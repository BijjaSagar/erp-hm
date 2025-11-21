const GST_RATE = 0.18; // 18% GST

export function calculateGST(amount: number): number {
    return parseFloat((amount * GST_RATE).toFixed(2));
}

export function calculateTotal(amount: number, isGst: boolean): number {
    if (isGst) {
        const gstAmount = calculateGST(amount);
        return parseFloat((amount + gstAmount).toFixed(2));
    }
    return amount;
}
