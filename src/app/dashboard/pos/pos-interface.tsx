"use client";

import { useState, useEffect } from "react";
import { createPOSTransaction } from "@/actions/pos";
import { getStoreInventory } from "@/actions/store";
import { searchCustomers } from "@/actions/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, Search, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

interface CartItem {
    sku: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    totalPrice: number;
}

export default function POSInterface({ stores }: { stores: any[] }) {
    const router = useRouter();
    const [selectedStore, setSelectedStore] = useState(stores[0]?.id || "");
    const [inventory, setInventory] = useState<any[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (selectedStore) {
            loadInventory();
        }
    }, [selectedStore]);

    const loadInventory = async () => {
        const items = await getStoreInventory(selectedStore);
        setInventory(items);
    };

    const addToCart = (item: any) => {
        const existing = cart.find(c => c.sku === item.sku);
        if (existing) {
            setCart(cart.map(c =>
                c.sku === item.sku
                    ? { ...c, quantity: c.quantity + 1, totalPrice: (c.quantity + 1) * c.unitPrice }
                    : c
            ));
        } else {
            setCart([...cart, {
                sku: item.sku,
                productName: item.productName,
                quantity: 1,
                unitPrice: item.sellingPrice,
                discount: 0,
                taxRate: 18, // Default GST
                totalPrice: item.sellingPrice,
            }]);
        }
    };

    const removeFromCart = (sku: string) => {
        setCart(cart.filter(c => c.sku !== sku));
    };

    const updateQuantity = (sku: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(sku);
            return;
        }
        setCart(cart.map(c =>
            c.sku === sku
                ? { ...c, quantity, totalPrice: quantity * c.unitPrice }
                : c
        ));
    };

    const calculateTotals = () => {
        const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
        const discount = 0;
        const taxAmount = cart.reduce((sum, item) => sum + (item.totalPrice * item.taxRate / 100), 0);
        const total = subtotal - discount + taxAmount;
        return { subtotal, discount, taxAmount, total };
    };

    const handleCheckout = async () => {
        if (cart.length === 0) {
            alert("Cart is empty");
            return;
        }

        setIsProcessing(true);

        const { subtotal, discount, taxAmount, total } = calculateTotals();

        const formData = new FormData();
        formData.append("storeId", selectedStore);
        formData.append("customerName", customerName || "Walk-in Customer");
        formData.append("subtotal", subtotal.toString());
        formData.append("discount", discount.toString());
        formData.append("taxAmount", taxAmount.toString());
        formData.append("totalAmount", total.toString());
        formData.append("paymentMethod", paymentMethod);

        const items = cart.map(item => ({
            productName: item.productName,
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            taxRate: item.taxRate,
            totalPrice: item.totalPrice,
        }));

        const payments = [{
            method: paymentMethod,
            amount: total,
        }];

        formData.append("items", JSON.stringify(items));
        formData.append("payments", JSON.stringify(payments));

        const result = await createPOSTransaction({}, formData);

        if (result.message.includes("successfully")) {
            alert(`Sale completed! Bill Number: ${result.billNumber}`);
            setCart([]);
            setCustomerName("");
            loadInventory();
        } else {
            alert(result.message);
        }

        setIsProcessing(false);
    };

    const filteredInventory = inventory.filter(item =>
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const { subtotal, discount, taxAmount, total } = calculateTotals();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Selection */}
            <div className="lg:col-span-2 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Select Store</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select value={selectedStore} onValueChange={setSelectedStore}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {stores.map(store => (
                                    <SelectItem key={store.id} value={store.id}>
                                        {store.name} ({store.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Products</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                            {filteredInventory.map(item => (
                                <Button
                                    key={item.sku}
                                    variant="outline"
                                    className="h-auto p-4 flex flex-col items-start"
                                    onClick={() => addToCart(item)}
                                    disabled={item.quantity === 0}
                                >
                                    <div className="font-semibold text-sm">{item.productName}</div>
                                    <div className="text-xs text-muted-foreground">{item.sku}</div>
                                    <div className="text-lg font-bold mt-2">₹{item.sellingPrice}</div>
                                    <div className="text-xs text-muted-foreground">Stock: {item.quantity}</div>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Cart & Checkout */}
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Cart</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Customer Name (Optional)</Label>
                            <Input
                                placeholder="Walk-in Customer"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {cart.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">
                                    <ShoppingBag className="mx-auto h-12 w-12 mb-2 opacity-50" />
                                    <p>Cart is empty</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.sku} className="flex items-center justify-between p-2 border rounded">
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{item.productName}</div>
                                            <div className="text-xs text-muted-foreground">₹{item.unitPrice} × {item.quantity}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateQuantity(item.sku, parseInt(e.target.value))}
                                                className="w-16 h-8"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFromCart(item.sku)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal:</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Tax (GST):</span>
                                <span>₹{taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total:</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CASH">Cash</SelectItem>
                                    <SelectItem value="CARD">Card</SelectItem>
                                    <SelectItem value="UPI">UPI</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                            onClick={handleCheckout}
                            disabled={isProcessing || cart.length === 0}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                `Complete Sale - ₹${total.toFixed(2)}`
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
