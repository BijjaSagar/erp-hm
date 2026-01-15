import { getSellers } from "@/actions/seller";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Users, Phone, Mail, MapPin } from "lucide-react";

export default async function SellersPage() {
    const sellers = await getSellers(true);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Sellers</h2>
                    <p className="text-muted-foreground">
                        Manage your suppliers and vendors
                    </p>
                </div>
                <Link href="/dashboard/marketing/sellers/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Seller
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sellers.map((seller) => (
                    <Card key={seller.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                    <CardTitle className="text-lg">{seller.name}</CardTitle>
                                </div>
                                <Badge variant={seller.isActive ? "default" : "secondary"}>
                                    {seller.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {seller.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{seller.phone}</span>
                                </div>
                            )}
                            {seller.email && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="truncate">{seller.email}</span>
                                </div>
                            )}
                            {seller.address && (
                                <div className="flex items-start gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <span className="line-clamp-2">{seller.address}</span>
                                </div>
                            )}
                            <div className="pt-2 border-t">
                                <p className="text-sm text-muted-foreground">
                                    {seller._count.purchases} purchase{seller._count.purchases !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <Link href={`/dashboard/marketing/sellers/${seller.id}/edit`}>
                                <Button variant="outline" size="sm" className="w-full">
                                    Edit Seller
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {sellers.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No sellers yet</h3>
                        <p className="text-muted-foreground mb-4">Add your first supplier to get started</p>
                        <Link href="/dashboard/marketing/sellers/new">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Seller
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
