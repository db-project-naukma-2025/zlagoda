export function getApiErrorMessage(
  error: unknown,
  fallback = "An error occurred",
): string {
  if (
    error instanceof Error &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "detail" in error.response.data
  ) {
    const detail = error.response.data.detail;

    if (typeof detail === "string") {
      return detail;
    } else if (typeof detail === "object" && detail && "msg" in detail) {
      return String(detail.msg);
    } else if (Array.isArray(detail)) {
      return [
        ...new Set(
          detail.map((item: object | null) =>
            item && "msg" in item ? String(item.msg) : "error",
          ),
        ),
      ].join("\n");
    }

    return fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return fallback;
}
