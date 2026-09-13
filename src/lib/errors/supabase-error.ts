type ErrorLike = {
  code?:
    unknown;

  message?:
    unknown;

  details?:
    unknown;

  hint?:
    unknown;
};


function isErrorLike(
  error: unknown,
): error is ErrorLike {
  return (
    typeof error ===
      "object" &&
    error !== null
  );
}


export function getSupabaseErrorCode(
  error: unknown,
): string | null {
  if (
    !isErrorLike(
      error,
    ) ||
    typeof error.code !==
      "string"
  ) {
    return null;
  }


  return error.code;
}


export function getSupabaseErrorMessage(
  error: unknown,
): string | null {
  if (
    error instanceof
      Error
  ) {
    return error.message;
  }


  if (
    !isErrorLike(
      error,
    ) ||
    typeof error.message !==
      "string"
  ) {
    return null;
  }


  return error.message;
}


export function errorHasCode(
  error: unknown,
  code: string,
) {
  return (
    getSupabaseErrorCode(
      error,
    ) ===
    code
  );
}


export function errorMessageIncludes(
  error: unknown,
  text: string,
) {
  const message =
    getSupabaseErrorMessage(
      error,
    );


  if (!message) {
    return false;
  }


  return message
    .toLowerCase()
    .includes(
      text.toLowerCase(),
    );
}