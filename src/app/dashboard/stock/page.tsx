import { getInventory, updateStock } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StockUpdateForm } from "./stock-update-form";
import { AlertTriangle } from "lucide-react";

export default async function StockPage() {
    const { items } = await getInventory();

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Stock Management</h1>
                {/* Add Item Button could go here for Admins */}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Inventory Levels</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item Name</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items?.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{item.unit}</TableCell>
                                    <TableCell>
                                        {item.quantity <= (item.reorderLevel || 0) ? (
                                            <Badge variant="destructive" className="flex w-fit items-center gap-1">
                                                <AlertTriangle className="h-3 w-3" /> Low Stock
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                OK
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <StockUpdateForm itemId={item.id} itemName={item.name} />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {items?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No inventory items found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
