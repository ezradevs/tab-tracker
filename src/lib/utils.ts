import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString + "T12:00:00")
  if (isToday(date)) return "Today"
  if (isYesterday(date)) return "Yesterday"
  return format(date, "d MMM yyyy")
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString + "T12:00:00")
  if (isToday(date)) return "Today"
  if (isYesterday(date)) return "Yesterday"
  return formatDistanceToNow(date, { addSuffix: true })
}
