export const dynamic = 'force-dynamic';

import { getStoreById } from "@/actions/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, Store, MapPin, Phone, Mail, Package, User } from "lucide-react";
import { notFound } from "next/navigation";

export default async function StoreDetailPage({ params }: { params: { id: string } }) {
    const store = await getStoreById(params.id);

    if (!store) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/dashboard/stores">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                            {store.name}
                        </h2>
                        <p className="text-muted-foreground">Store details and inventory</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/dashboard/stores/${store.id}/edit`}>
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Status Badge */}
            <div>
                {store.isActive ? (
                    <Badge className="bg-green-100 text-green-800 px-4 py-2">
                        Active
                    </Badge>
                ) : (
                    <Badge variant="secondary" className="px-4 py-2">
                        Inactive
                    </Badge>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Store Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Store className="mr-2 h-5 w-5" />
                            Store Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="text-sm text-muted-foreground">Store Name</div>
                            <div className="font-medium">{store.name}</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Store Code</div>
                            <Badge variant="secondary" className="font-mono">{store.code}</Badge>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                Address
                            </div>
                            <div className="font-medium">{store.address}</div>
                        </div>
                        {store.phone && (
                            <div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    Phone
                                </div>
                                <div className="font-medium">{store.phone}</div>
                            </div>
                        )}
                        {store.email && (
                            <div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    Email
                                </div>
                                <div className="font-medium">{store.email}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Manager Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <User className="mr-2 h-5 w-5" />
                            Manager Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {store.manager ? (
                            <>
                                <div>
                                    <div className="text-sm text-muted-foreground">Name</div>
                                    <div className="font-medium">{store.manager.name}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Email</div>
                                    <div className="font-medium">{store.manager.email}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Role</div>
                                    <Badge variant="outline">{store.manager.role}</Badge>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <User className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                <p>No manager assigned</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Inventory Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Package className="mr-2 h-5 w-5" />
                        Inventory Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="text-sm text-blue-700">Total Items</div>
                            <div className="text-2xl font-bold text-blue-900">{store._count.inventory}</div>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                            <div className="text-sm text-green-700">Sales</div>
                            <div className="text-2xl font-bold text-green-900">{store._count.sales}</div>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                            <div className="text-sm text-purple-700">Transfers</div>
                            <div className="text-2xl font-bold text-purple-900">
                                {(store._count.transfersFrom || 0) + (store._count.transfersTo || 0)}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
