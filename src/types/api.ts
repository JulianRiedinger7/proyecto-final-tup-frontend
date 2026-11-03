export type ApiResponse<T> = {
  msg: string;
  code: number;
  data?: T;
};

export type PaginatedData<T> = {
  items: T[];
  total: number;
};
