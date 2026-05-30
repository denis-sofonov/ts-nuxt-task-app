import type { PaginationMeta } from '#shared/types/api'

export function buildPageMeta(page: number, limit: number, total: number): PaginationMeta {
  return { page, limit, total, totalPages: Math.ceil(total / limit) }
}
