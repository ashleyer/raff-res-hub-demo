export function formatCurrency(amount: number, opts?: { whole?: boolean }): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    ...(opts?.whole ? { maximumFractionDigits: 0 } : {}),
  });
}
