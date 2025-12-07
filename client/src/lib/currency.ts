/**
 * Currency formatting utilities for Brazilian Real (BRL)
 */

/**
 * Format number as Brazilian Real currency
 * @param value - The numeric value to format
 * @returns Formatted currency string in BRL
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format number as compact BRL (e.g., R$ 1.5K)
 * @param value - The numeric value to format
 * @returns Compact formatted currency string
 */
export function formatCompactBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Parse BRL string to number
 * @param value - The BRL formatted string
 * @returns Numeric value
 */
export function parseBRL(value: string): number {
  // Remove currency symbol and spaces
  const cleanValue = value.replace(/[R$\s.]/g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
}

/**
 * Format percentage for Brazilian locale
 * @param value - The decimal value (0.1 = 10%)
 * @returns Formatted percentage string
 */
export function formatPercent(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}