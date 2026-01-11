export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; reason: string }

export type CompletedMap = Record<string, number[]>
