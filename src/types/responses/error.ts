export type ServerError<T> = {
  status: number;
  isServerServed: true;
  body: T;
};
