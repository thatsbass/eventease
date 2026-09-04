export type ID = string

export type Nullable<T> = T | null

export type Pagination = {
  page: number
  pageSize: number
  total: number
}

export type ApiResponse<T> = {
  data: T
  message?: string
}

export type ApiError = {
  error: string
}