import { getRawMaterials, getLowStockRawMaterials } from "@/actions/raw-material";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Package, AlertTriangle } from "lucide-react";

export default async function RawMaterialsPage() {
    const [materials, lowStockMaterials] = await Promise.all([
        getRawMaterials(),
        getLowStockRawMaterials(),
    ]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Raw Materials</h2>
                    <p className="text-muted-foreground">
                        Manage your raw material inventory
                    </p>
                </div>
                <Link href="/dashboard/raw-materials/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Material
                    </Button>
                </Link>
            </div>

            {lowStockMaterials.length > 0 && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-yellow-800">
                            <AlertTriangle className="h-5 w-5" />
                            Low Stock Alert
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-yellow-700">
                            {lowStockMaterials.length} material(s) are running low and need reordering
                        </p>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {materials.map((material) => {
                    const isLowStock = material.reorderLevel && material.quantity <= material.reorderLevel;
                    const lastPurchase = material.purchases[0];

                    return (
                        <Card key={material.id} className={isLowStock ? "border-yellow-300" : ""}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-muted-foreground" />
                                        <CardTitle className="text-lg">{material.name}</CardTitle>
                                    </div>
                                    {isLowStock && (
                                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                            Low Stock
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Category</p>
                                    <p className="font-medium">{material.category}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Current Stock</p>
                                    <p className="text-2xl font-bold">
                                        {material.quantity} <span className="text-sm font-normal text-muted-foreground">{material.unit}</span>
                                    </p>
                                </div>
                                {material.reorderLevel && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Reorder Level</p>
                                        <p className="font-medium">{material.reorderLevel} {material.unit}</p>
                                    </div>
                                )}
                                {material.currentPrice && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Current Price</p>
                                        <p className="font-medium">₹{material.currentPrice}/{material.unit}</p>
                                    </div>
                                )}
                                {lastPurchase && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Last Purchase</p>
                                        <p className="text-sm">
                                            {new Date(lastPurchase.purchaseDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                                <div className="flex gap-2 pt-2">
                                    <Link href={`/dashboard/raw-materials/${material.id}/edit`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full">
                                            Edit
                                        </Button>
                                    </Link>
                                    <Link href={`/dashboard/purchases/new?materialId=${material.id}`} className="flex-1">
                                        <Button size="sm" className="w-full">
                                            Purchase
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {materials.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No raw materials yet</h3>
                        <p className="text-muted-foreground mb-4">Get started by adding your first raw material</p>
                        <Link href="/dashboard/raw-materials/new">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Material
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
