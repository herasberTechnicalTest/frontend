export interface PagedResult<T> { items: T[]; total: number; }
export interface LoginResponse { token?: string; [k: string]: any }
