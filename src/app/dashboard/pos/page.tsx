export const dynamic = 'force-dynamic';

import { getStores } from "@/actions/store";
import { getStoreInventory } from "@/actions/store";
import POSInterface from "./pos-interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

export default async function POSPage() {
    const stores = await getStores();

    if (stores.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>No Stores Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Please create a store first before using the POS system.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center">
                    <ShoppingCart className="mr-3 h-8 w-8" />
                    Point of Sale
                </h2>
            </div>

            <POSInterface stores={stores} />
        </div>
    );
}
