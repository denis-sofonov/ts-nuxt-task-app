import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge conditional class names while resolving Tailwind conflicts
 * (later utilities win). Used by every shadcn-vue component.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
