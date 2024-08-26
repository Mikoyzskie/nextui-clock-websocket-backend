const ErrorMessage = {
 NOT_FOUND: "User not found. Try Again.",
 AUTH_ERROR: "Invalid pin. Try Again",
 SERVER_ERROR: "Internal Server Error",
 LOGGED: "Already logged today.",
} as const;

export { ErrorMessage };
