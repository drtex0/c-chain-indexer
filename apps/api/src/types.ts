export type ApiDataOutput<T> = { data: T };

export type PaginationOutput<T> = { data: T; page: number; pageSize: number; totalCount: number; totalPages: number };
