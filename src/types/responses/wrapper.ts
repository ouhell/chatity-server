export type Page<T> = {
  size: number;
  pageSize: number;
  isLast: boolean;
  isFirst: boolean;
  content: T[];
};
