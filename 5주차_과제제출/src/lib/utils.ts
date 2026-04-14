export function formatPrice(amount: number, currency: string = "krw"): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
