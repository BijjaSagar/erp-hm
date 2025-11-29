export const dynamic = 'force-dynamic';

import Link from "next/link";
import { getStores } from "@/actions/store";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Store as StoreIcon, MapPin, Phone, Mail, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function StoresPage() {
    const stores = await getStores();

    return (
        <div className="space-y-6 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Store Management
                    </h2>
                    <p className="text-muted-foreground mt-2">Manage your retail stores and showrooms</p>
                </div>
                <Link href="/dashboard/stores/new">
                    <Button className="shadow-lg">
                        <Plus className="mr-2 h-4 w-4" /> Add Store
                    </Button>
                </Link>
            </div>

            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <StoreIcon className="h-5 w-5 text-primary" />
                        All Stores
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border border-border/50 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableHead className="font-semibold">Store</TableHead>
                                    <TableHead className="font-semibold">Code</TableHead>
                                    <TableHead className="font-semibold">Location</TableHead>
                                    <TableHead className="font-semibold">Manager</TableHead>
                                    <TableHead className="font-semibold">Inventory</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    <TableHead className="text-right font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stores.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                            <StoreIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                            <p className="font-medium">No stores found</p>
                                            <p className="text-sm mt-1">Create your first store to get started</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    stores.map((store) => (
                                        <TableRow key={store.id} className="hover:bg-accent/30 transition-colors">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-primary/10 rounded-lg">
                                                        <StoreIcon className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <span>{store.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-mono">{store.code}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-muted-foreground text-sm gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    <span className="max-w-xs truncate">{store.address}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {store.manager ? (
                                                    <div className="text-sm">
                                                        <div className="font-medium">{store.manager.name}</div>
                                                        <div className="text-muted-foreground text-xs">{store.manager.email}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm italic">Not assigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="gap-1">
                                                    <Package className="h-3 w-3" />
                                                    {store._count.inventory} items
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {store.isActive ? (
                                                    <Badge className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 border border-green-500/20">
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">Inactive</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Link href={`/dashboard/stores/${store.id}`}>
                                                    <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary">
                                                        View
                                                    </Button>
                                                </Link>
                                                <Link href={`/dashboard/stores/${store.id}/edit`}>
                                                    <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary">
                                                        Edit
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

