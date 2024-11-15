export class ApiError<T> extends Error {
  public status: number;
  public data: T;

  constructor(status: number, data: T) {
    super();
    this.status = status;
    this.data = data;
  }

  public static notFound(data?: unknown) {
    return new ApiError(404, data ?? "resource not found");
  }

  public static unAuthorized(data?: unknown) {
    return new ApiError(401, data ?? "user unauthorized");
  }

  public static forbidden(data?: unknown) {
    return new ApiError(403, data ?? "action forbidden");
  }
}
