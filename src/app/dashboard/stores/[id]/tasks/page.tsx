export const dynamic = 'force-dynamic';

import { getStoreById } from "@/actions/store";
import { getStoreTasksByStore } from "@/actions/store-tasks";
import { getEmployees } from "@/actions/employee";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Hammer, Paintbrush, Package, CheckCircle2, Clock, AlertCircle, Plus } from "lucide-react";
import { CreateTaskForm } from "./create-task-form";
import { TaskStatusButton } from "./task-status-button";

const taskColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
    COMPLETED: "bg-green-100 text-green-800 border-green-200",
};

const taskTypeIcons: Record<string, any> = {
    PLYWOOD_FITTING: Package,
    PAINTING: Paintbrush,
    FINISHING: Hammer,
    OTHER: AlertCircle,
};

const taskTypeColors: Record<string, string> = {
    PLYWOOD_FITTING: "bg-indigo-100 text-indigo-800",
    PAINTING: "bg-pink-100 text-pink-800",
    FINISHING: "bg-cyan-100 text-cyan-800",
    OTHER: "bg-slate-100 text-slate-800",
};

export default async function StoreTasksPage({ params }: { params: { id: string } }) {
    const session = await auth();
    const [store, tasks, employees] = await Promise.all([
        getStoreById(params.id),
        getStoreTasksByStore(params.id),
        getEmployees(),
    ]);

    if (!store) notFound();

    const storeEmployees = employees.filter((e: any) => e.storeId === params.id);

    const pending = tasks.filter((t: any) => t.status === "PENDING").length;
    const inProgress = tasks.filter((t: any) => t.status === "IN_PROGRESS").length;
    const completed = tasks.filter((t: any) => t.status === "COMPLETED").length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/stores/${params.id}`}>
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{store.name} — Production Tasks</h2>
                        <p className="text-muted-foreground text-sm">Plywood Fitting, Painting & Finishing work at this store</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="pt-4 flex items-center gap-3">
                        <Clock className="h-8 w-8 text-yellow-600" />
                        <div>
                            <div className="text-2xl font-bold text-yellow-900">{pending}</div>
                            <div className="text-xs text-yellow-700">Pending</div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-4 flex items-center gap-3">
                        <Hammer className="h-8 w-8 text-blue-600" />
                        <div>
                            <div className="text-2xl font-bold text-blue-900">{inProgress}</div>
                            <div className="text-xs text-blue-700">In Progress</div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-4 flex items-center gap-3">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                        <div>
                            <div className="text-2xl font-bold text-green-900">{completed}</div>
                            <div className="text-xs text-green-700">Completed</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Create Task */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Plus className="h-4 w-4 text-blue-600" />
                            New Task
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CreateTaskForm storeId={params.id} employees={employees} />
                    </CardContent>
                </Card>

                {/* Task List */}
                <div className="lg:col-span-2 space-y-3">
                    {tasks.length === 0 ? (
                        <Card>
                            <CardContent className="py-16 text-center text-muted-foreground">
                                <Hammer className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p className="font-semibold">No tasks yet</p>
                                <p className="text-sm mt-1">Create a task for Plywood Fitting or Painting work</p>
                            </CardContent>
                        </Card>
                    ) : (
                        tasks.map((task: any) => {
                            const TypeIcon = taskTypeIcons[task.taskType] || AlertCircle;
                            return (
                                <Card key={task.id} className={`border-l-4 ${task.status === "COMPLETED" ? "border-l-green-500" : task.status === "IN_PROGRESS" ? "border-l-blue-500" : "border-l-yellow-500"}`}>
                                    <CardContent className="pt-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className={`p-2 rounded-lg ${taskTypeColors[task.taskType] || "bg-slate-100"}`}>
                                                    <TypeIcon className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Badge className={taskTypeColors[task.taskType]}>
                                                            {task.taskType.replace("_", " ")}
                                                        </Badge>
                                                        <Badge className={taskColors[task.status]}>
                                                            {task.status.replace("_", " ")}
                                                        </Badge>
                                                    </div>
                                                    {task.description && (
                                                        <p className="text-sm text-slate-600 mt-1.5">{task.description}</p>
                                                    )}
                                                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                                        {task.assignee && (
                                                            <span>👷 {task.assignee.name}</span>
                                                        )}
                                                        <span>📅 {new Date(task.createdAt).toLocaleDateString("en-IN")}</span>
                                                        {task.completedAt && (
                                                            <span className="text-green-700">✅ Done: {new Date(task.completedAt).toLocaleDateString("en-IN")}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <TaskStatusButton task={task} />
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
