import {
    getFinancialOverview,
    getRevenueTrends,
    getExpenseBreakdown,
    getTopRevenueProducts,
    getCashFlowSummary
} from "@/actions/accounting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    CreditCard,
    AlertCircle,
    BarChart3,
    PieChart,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import Link from "next/link";

export default async function AccountingDashboard() {
    const overview = await getFinancialOverview();
    const trends = await getRevenueTrends('monthly', 6);
    const expenseBreakdown = await getExpenseBreakdown();
    const topProducts = await getTopRevenueProducts(5);
    const cashFlow = await getCashFlowSummary();

    if (!overview) {
        return (
            <div className="p-6">
                <p className="text-muted-foreground">Unable to load financial data</p>
            </div>
        );
    }

    const { metrics } = overview;

    // Calculate expense breakdown percentages
    const totalExpenseAmount = expenseBreakdown.reduce((sum, e) => sum + e.amount, 0);
    const expensesWithPercentage = expenseBreakdown.map(e => ({
        ...e,
        percentage: totalExpenseAmount > 0 ? (e.amount / totalExpenseAmount) * 100 : 0
    }));

    return (
        <div className="p-6 space-y-6 fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Financial Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Comprehensive financial overview and analytics
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/accounting/pl-report">
                        <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                            <BarChart3 className="h-3 w-3 mr-1" />
                            P&L Report
                        </Badge>
                    </Link>
                    <Link href="/dashboard/accounting/tax-reports">
                        <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                            <PieChart className="h-3 w-3 mr-1" />
                            Tax Reports
                        </Badge>
                    </Link>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Revenue */}
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Total Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-900">
                            ₹{metrics.totalRevenue.toLocaleString()}
                        </div>
                        <p className="text-xs text-green-600 mt-1 flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {metrics.transactionCount} transactions
                        </p>
                    </CardContent>
                </Card>

                {/* Expenses */}
                <Card className="border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Total Expenses
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-900">
                            ₹{metrics.totalExpenses.toLocaleString()}
                        </div>
                        <p className="text-xs text-red-600 mt-1 flex items-center">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Operating costs
                        </p>
                    </CardContent>
                </Card>

                {/* Net Profit */}
                <Card className={`border-${metrics.netProfit >= 0 ? 'blue' : 'orange'}-200 bg-gradient-to-br from-${metrics.netProfit >= 0 ? 'blue' : 'orange'}-50 to-${metrics.netProfit >= 0 ? 'cyan' : 'amber'}-50`}>
                    <CardHeader className="pb-2">
                        <CardTitle className={`text-sm font-medium text-${metrics.netProfit >= 0 ? 'blue' : 'orange'}-700 flex items-center gap-2`}>
                            {metrics.netProfit >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                            Net Profit
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-bold text-${metrics.netProfit >= 0 ? 'blue' : 'orange'}-900`}>
                            ₹{metrics.netProfit.toLocaleString()}
                        </div>
                        <p className={`text-xs text-${metrics.netProfit >= 0 ? 'blue' : 'orange'}-600 mt-1`}>
                            {metrics.profitMargin.toFixed(2)}% margin
                        </p>
                    </CardContent>
                </Card>

                {/* Outstanding */}
                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Outstanding
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-900">
                            ₹{metrics.totalOutstanding.toLocaleString()}
                        </div>
                        <p className="text-xs text-purple-600 mt-1">
                            Pending payments
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Trends & Expense Breakdown */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Revenue Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            Revenue Trends (Last 6 Months)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {trends.length > 0 ? (
                            <div className="space-y-2">
                                {trends.map((trend, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 rounded hover:bg-muted">
                                        <span className="text-sm font-medium">{trend.period}</span>
                                        <div className="text-right">
                                            <div className="font-bold text-green-700">
                                                ₹{trend.revenue.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {trend.transactions} transactions
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">
                                No revenue data available
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Expense Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="h-5 w-5 text-red-600" />
                            Expense Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {expensesWithPercentage.length > 0 ? (
                            <div className="space-y-3">
                                {expensesWithPercentage.map((expense, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">{expense.category}</span>
                                            <span className="text-muted-foreground">
                                                {expense.percentage.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-red-500 to-rose-500"
                                                    style={{ width: `${expense.percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-semibold text-red-700 min-w-[80px] text-right">
                                                ₹{expense.amount.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">
                                No expense data available
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Top Products & Cash Flow */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Top Revenue Products */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                            Top Revenue Products
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {topProducts.length > 0 ? (
                            <div className="space-y-3">
                                {topProducts.map((product, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 rounded hover:bg-muted">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <div className="font-medium">{product.product}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {product.quantity} units sold
                                                </div>
                                            </div>
                                        </div>
                                        <div className="font-bold text-blue-700">
                                            ₹{product.revenue.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">
                                No product data available
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Cash Flow Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-purple-600" />
                            Cash Flow Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {cashFlow ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                                    <span className="text-sm font-medium text-green-700">Cash Inflow</span>
                                    <span className="font-bold text-green-900">
                                        ₹{cashFlow.cashInflow.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
                                    <span className="text-sm font-medium text-red-700">Cash Outflow</span>
                                    <span className="font-bold text-red-900">
                                        ₹{cashFlow.cashOutflow.toLocaleString()}
                                    </span>
                                </div>
                                <div className={`flex items-center justify-between p-3 rounded-lg ${cashFlow.netCashFlow >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} border`}>
                                    <span className={`text-sm font-medium ${cashFlow.netCashFlow >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                                        Net Cash Flow
                                    </span>
                                    <span className={`font-bold ${cashFlow.netCashFlow >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                                        ₹{cashFlow.netCashFlow.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">
                                No cash flow data available
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
