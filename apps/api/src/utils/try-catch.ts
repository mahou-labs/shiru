type Success<T> = {
  data: T;
  error: null;
};

type Failure = {
  data: null;
  error: unknown;
};

type Result<T> = Success<T> | Failure;

export async function tryCatch<T>(promise: Promise<T>): Promise<Result<T>> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error: unknown) {
    return { data: null, error };
  }
}
