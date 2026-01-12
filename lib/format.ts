// Malaysian locale formatting utilities

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ms-MY", {
    style: "currency",
    currency: "MYR",
  }).format(amount);
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ms-MY", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
};

export const formatDateLong = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ms-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
};
