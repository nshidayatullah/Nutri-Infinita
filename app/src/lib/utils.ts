import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Menghitung Berat Mentah Bersih (untuk Database Generated Column)
 * Formula: (Berat Matang * Faktor Konversi) * (BDD / 100)
 */
export function calculateRawNetWeight(weightCooked: number, conversionFactor: number, bddPercent: number): number {
  return (weightCooked * conversionFactor * bddPercent) / 100;
}

/**
 * Format angka dengan 1 desimal (untuk display gizi)
 */
export function formatNutrient(value: number): string {
  return value.toFixed(1);
}

/**
 * Format tanggal untuk Indonesia
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}
