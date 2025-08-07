export function getPagination(page?: string, pageSize?: string) {
    const p = Number(page)
    const ps = Number(pageSize)

    if (isNaN(p) || isNaN(ps) || p < 1 || ps < 1) return null

    return {
        skip: (p - 1) * ps,
        take: ps
    }
}