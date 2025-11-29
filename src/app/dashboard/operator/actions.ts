'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { ProductionStage } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getAssignedOrders() {
    const session = await auth();
    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    // Allow ADMIN to view all orders, or require employeeId for operators
    if (session.user.role !== "ADMIN" && !session.user.employeeId) {
        return { error: "Unauthorized" };
    }

    // Fetch employee details to get assigned stages (only if employeeId exists)
    const employee = session.user.employeeId ? await prisma.employee.findUnique({
        where: { id: session.user.employeeId },
        select: { assignedStages: true }
    }) : null;

    const assignedStages = employee?.assignedStages || [];

    // Build where clause
    const where: any = {
        status: {
            in: ["APPROVED", "IN_PRODUCTION"],
        },
    };

    // If employee has specific assigned stages, filter by them
    if (assignedStages.length > 0) {
        where.currentStage = {
            in: assignedStages
        };
    }

    const orders = await prisma.order.findMany({
        where,
        include: {
            items: true,
            productionLogs: {
                orderBy: {
                    timestamp: 'desc'
                },
                take: 1
            }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    return { orders };
}

export async function updateOrderStage(orderId: string, stage: ProductionStage, notes?: string) {
    const session = await auth();
    if (!session?.user?.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        // 1. Create a production log
        await prisma.productionLog.create({
            data: {
                orderId,
                stage,
                status: "COMPLETED", // The stage is completed/done
                employeeId: session.user.employeeId,
                notes,
            }
        });

        // 2. Update the order's current stage
        await prisma.order.update({
            where: { id: orderId },
            data: {
                currentStage: stage,
                status: stage === 'COMPLETED' ? 'COMPLETED' : 'IN_PRODUCTION'
            }
        });

        revalidatePath('/dashboard/operator');
        return { success: true };
    } catch (error) {
        console.error("Failed to update order stage:", error);
        return { error: "Failed to update order stage" };
    }
}

export async function getOperatorStats() {
    const session = await auth();
    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    // Allow ADMIN to view stats, or require employeeId for operators
    if (session.user.role !== "ADMIN" && !session.user.employeeId) {
        return { error: "Unauthorized" };
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get order counts
        const [pendingOrders, ongoingOrders, completedOrders] = await Promise.all([
            prisma.order.count({
                where: { status: 'APPROVED' }
            }),
            prisma.order.count({
                where: { status: 'IN_PRODUCTION' }
            }),
            prisma.order.count({
                where: {
                    status: 'COMPLETED',
                    updatedAt: {
                        gte: today,
                        lt: tomorrow
                    }
                }
            })
        ]);

        // Get today's attendance (only if employeeId exists)
        const attendance = session.user.employeeId ? await prisma.attendance.findFirst({
            where: {
                employeeId: session.user.employeeId,
                date: {
                    gte: today,
                    lt: tomorrow
                }
            }
        }) : null;

        // Calculate hours worked
        let hoursWorked = 0;
        let checkInTime = '';
        if (attendance) {
            const now = attendance.checkOut || new Date();
            hoursWorked = (now.getTime() - attendance.checkIn.getTime()) / (1000 * 60 * 60);
            checkInTime = attendance.checkIn.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        // Get today's breaks (only if employeeId exists)
        const breaks = session.user.employeeId ? await prisma.break.findMany({
            where: {
                employeeId: session.user.employeeId,
                startTime: {
                    gte: today,
                    lt: tomorrow
                }
            }
        }) : [];

        const breakMinutes = breaks
            .filter(b => b.duration)
            .reduce((sum, b) => sum + (b.duration || 0), 0);

        // Get pending leave requests (only if employeeId exists)
        const pendingLeaves = session.user.employeeId ? await prisma.leaveRequest.count({
            where: {
                employeeId: session.user.employeeId,
                status: 'PENDING'
            }
        }) : 0;

        return {
            stats: {
                pendingOrders,
                ongoingOrders,
                completedOrders,
                checkedIn: !!attendance,
                checkInTime,
                hoursWorked,
                breaksToday: breaks.length,
                breakMinutes,
                pendingLeaves
            }
        };
    } catch (error) {
        console.error("Failed to get operator stats:", error);
        return { error: "Failed to get operator stats" };
    }
}

// ==================== ADMIN-ONLY ACTIONS ====================

export async function getAllOperatorsStatus() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return { error: "Unauthorized - Admin only" };
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get all employees with their user and attendance data
        const employees = await prisma.employee.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                },
                attendance: {
                    where: {
                        date: {
                            gte: today,
                            lt: tomorrow
                        }
                    },
                    take: 1
                },
                breaks: {
                    where: {
                        startTime: {
                            gte: today,
                            lt: tomorrow
                        },
                        endTime: null // Active breaks only
                    },
                    take: 1
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        // Get active production entries for all operators (entries without endTime)
        const activeProductions = await prisma.productionEntry.findMany({
            where: {
                endTime: null,
                startTime: {
                    gte: today
                }
            },
            include: {
                order: {
                    select: {
                        orderNumber: true,
                        currentStage: true
                    }
                },
                machine: {
                    select: {
                        name: true,
                        code: true
                    }
                }
            }
        });

        // Create a map of employeeId to active production
        const productionMap = new Map();
        activeProductions.forEach(prod => {
            if (prod.operatorId) {
                productionMap.set(prod.operatorId, prod);
            }
        });

        // Transform data for frontend
        const operatorsStatus = employees.map(emp => {
            const attendance = emp.attendance[0];
            const activeBreak = emp.breaks[0];
            const activeProduction = productionMap.get(emp.id);

            let status: 'working' | 'on_break' | 'absent' | 'checked_in' = 'absent';
            if (activeProduction) {
                status = 'working';
            } else if (activeBreak) {
                status = 'on_break';
            } else if (attendance) {
                status = 'checked_in';
            }

            return {
                employeeId: emp.id,
                name: emp.name,
                designation: emp.designation,
                phone: emp.phone,
                branchId: emp.branchId,
                assignedStages: emp.assignedStages,
                status,
                attendance: attendance ? {
                    checkIn: attendance.checkIn,
                    checkOut: attendance.checkOut,
                    status: attendance.status
                } : null,
                currentWork: activeProduction ? {
                    machine: activeProduction.machine?.name || 'N/A',
                    machineCode: activeProduction.machine?.code || 'N/A',
                    orderNumber: activeProduction.order.orderNumber,
                    stage: activeProduction.order.currentStage,
                    startTime: activeProduction.startTime
                } : null,
                onBreak: activeBreak ? {
                    startTime: activeBreak.startTime,
                    reason: activeBreak.reason
                } : null
            };
        });

        return { operators: operatorsStatus };
    } catch (error) {
        console.error("Failed to get operators status:", error);
        return { error: "Failed to get operators status" };
    }
}

export async function getProductionOverview() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return { error: "Unauthorized - Admin only" };
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get all active production entries (no endTime)
        const activeSessions = await prisma.productionEntry.findMany({
            where: {
                endTime: null
            },
            include: {
                operator: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                machine: {
                    select: {
                        name: true,
                        code: true
                    }
                },
                order: {
                    include: {
                        items: true
                    }
                }
            }
        });

        // Get today's completed orders
        const completedToday = await prisma.order.count({
            where: {
                status: 'COMPLETED',
                updatedAt: {
                    gte: today,
                    lt: tomorrow
                }
            }
        });

        // Get orders by stage
        const ordersByStage = await prisma.order.groupBy({
            by: ['currentStage'],
            where: {
                status: {
                    in: ['APPROVED', 'IN_PRODUCTION']
                }
            },
            _count: true
        });

        // Get today's production logs
        const productionLogs = await prisma.productionLog.findMany({
            where: {
                timestamp: {
                    gte: today,
                    lt: tomorrow
                }
            },
            include: {
                employee: {
                    select: {
                        name: true
                    }
                },
                order: {
                    select: {
                        orderNumber: true
                    }
                }
            },
            orderBy: {
                timestamp: 'desc'
            },
            take: 20
        });

        return {
            activeSessions,
            completedToday,
            ordersByStage,
            recentLogs: productionLogs
        };
    } catch (error) {
        console.error("Failed to get production overview:", error);
        return { error: "Failed to get production overview" };
    }
}

export async function getLeaveRequestsForApproval(status?: 'PENDING' | 'APPROVED' | 'REJECTED') {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return { error: "Unauthorized - Admin only" };
    }

    try {
        const where: any = {};
        if (status) {
            where.status = status;
        }

        const leaveRequests = await prisma.leaveRequest.findMany({
            where,
            include: {
                employee: {
                    select: {
                        id: true,
                        name: true,
                        designation: true,
                        phone: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return { leaveRequests };
    } catch (error) {
        console.error("Failed to get leave requests:", error);
        return { error: "Failed to get leave requests" };
    }
}

export async function approveLeaveRequest(requestId: string, approvedBy: string) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return { error: "Unauthorized - Admin only" };
    }

    try {
        await prisma.leaveRequest.update({
            where: { id: requestId },
            data: {
                status: 'APPROVED',
                approvedBy,
                approvedAt: new Date()
            }
        });

        revalidatePath('/dashboard/operator');
        return { success: true };
    } catch (error) {
        console.error("Failed to approve leave request:", error);
        return { error: "Failed to approve leave request" };
    }
}

export async function rejectLeaveRequest(requestId: string, rejectedBy: string, reason?: string) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return { error: "Unauthorized - Admin only" };
    }

    try {
        await prisma.leaveRequest.update({
            where: { id: requestId },
            data: {
                status: 'REJECTED',
                approvedBy: rejectedBy,
                approvedAt: new Date()
                // Note: reason is stored in the request, not in the approval
            }
        });

        revalidatePath('/dashboard/operator');
        return { success: true };
    } catch (error) {
        console.error("Failed to reject leave request:", error);
        return { error: "Failed to reject leave request" };
    }
}

export async function getOperatorAnalytics() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return { error: "Unauthorized - Admin only" };
    }

    try {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // Get all employees
        const employees = await prisma.employee.findMany({
            select: {
                id: true,
                name: true
            }
        });

        // Get production entries for this month
        const productionEntries = await prisma.productionEntry.findMany({
            where: {
                createdAt: {
                    gte: monthStart,
                    lte: monthEnd
                }
            },
            select: {
                operatorId: true,
                inputQuantity: true,
                outputQuantity: true,
                rejectedQuantity: true,
                endTime: true
            }
        });

        // Get wastage logs for this month
        const wastageLogs = await prisma.wastageLog.findMany({
            where: {
                timestamp: {
                    gte: monthStart,
                    lte: monthEnd
                }
            },
            select: {
                employeeId: true,
                quantity: true
            }
        });

        // Get attendance for this month
        const attendanceRecords = await prisma.attendance.findMany({
            where: {
                date: {
                    gte: monthStart,
                    lte: monthEnd
                }
            },
            select: {
                employeeId: true,
                checkIn: true,
                checkOut: true,
                status: true
            }
        });

        // Calculate top performers
        const topPerformers = employees
            .map(emp => {
                const empEntries = productionEntries.filter(e => e.operatorId === emp.id && e.endTime);
                const ordersCompleted = empEntries.length;

                const totalInput = empEntries.reduce((sum, e) => sum + e.inputQuantity, 0);
                const totalOutput = empEntries.reduce((sum, e) => sum + e.outputQuantity, 0);
                const efficiency = totalInput > 0 ? (totalOutput / totalInput) * 100 : 0;

                const totalRejected = empEntries.reduce((sum, e) => sum + e.rejectedQuantity, 0);
                const qualityScore = totalOutput > 0 ? ((totalOutput - totalRejected) / totalOutput) * 100 : 0;

                return {
                    employeeId: emp.id,
                    name: emp.name,
                    ordersCompleted,
                    efficiency: Math.round(efficiency),
                    qualityScore: Math.round(qualityScore)
                };
            })
            .filter(p => p.ordersCompleted > 0)
            .sort((a, b) => b.efficiency - a.efficiency);

        // Calculate wastage stats
        const wastageStats = employees
            .map(emp => {
                const empWastage = wastageLogs.filter(w => w.employeeId === emp.id);
                const totalWastage = empWastage.reduce((sum, log) => sum + log.quantity, 0);

                const empProduction = productionEntries.filter(e => e.operatorId === emp.id);
                const totalProduced = empProduction.reduce((sum, e) => sum + e.outputQuantity, 0);
                const wastagePercentage = totalProduced > 0 ? (totalWastage / totalProduced) * 100 : 0;

                return {
                    employeeId: emp.id,
                    name: emp.name,
                    wastagePercentage,
                    totalWastage
                };
            })
            .filter(w => w.totalWastage > 0);

        // Calculate attendance stats
        const totalAttendance = attendanceRecords.length;
        const onTimeCount = attendanceRecords.filter(a => a.status === 'PRESENT').length;
        const lateCount = attendanceRecords.filter(a => a.status === 'LATE').length;

        const totalPossibleDays = employees.length * (today.getDate());
        const absentCount = totalPossibleDays - totalAttendance;

        const totalHours = attendanceRecords.reduce((sum, att) => {
            if (att.checkOut) {
                const hours = (att.checkOut.getTime() - att.checkIn.getTime()) / (1000 * 60 * 60);
                return sum + hours;
            }
            return sum;
        }, 0);
        const averageHours = totalAttendance > 0 ? totalHours / totalAttendance : 0;

        const attendanceStats = {
            onTime: totalAttendance > 0 ? Math.round((onTimeCount / totalAttendance) * 100) : 0,
            late: totalAttendance > 0 ? Math.round((lateCount / totalAttendance) * 100) : 0,
            absent: totalPossibleDays > 0 ? Math.round((absentCount / totalPossibleDays) * 100) : 0,
            averageHours
        };

        return {
            analytics: {
                topPerformers,
                wastageStats,
                attendanceStats,
                productivityTrends: [] // Placeholder for future implementation
            }
        };
    } catch (error) {
        console.error("Failed to get operator analytics:", error);
        return { error: "Failed to get operator analytics" };
    }
}
