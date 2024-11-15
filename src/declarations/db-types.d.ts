export interface SQLiteDateRange {
    start: string,
    end: string
}

export interface BatchMessageFetchOptions {
    limit: number,
    offset?: number,
    date?: SQLiteDateRange,
    order?: "ASC" | "DESC",
    sortColumn?: string,
    userId?: number,
    groupId?: number
}