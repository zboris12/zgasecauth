export const StatusCodes = {
	OK: {
		status: 200,
		statusText: "OK",
	},
	NO_CONTENT: {
		status: 204,
		statusText: "No Content",
	},
	BAD_REQUEST: {
		status: 400,
		statusText: "Bad Request",
	},
	UNAUTHORIZED: {
		status: 401,
		statusText: "Unauthorized",
	},
	FORBIDDEN: {
		status: 403,
		statusText: "Forbidden",
	},
	NOT_FOUND: {
		status: 404,
		statusText: "Not Found",
	},
	METHOD_NOT_ALLOWED: {
		status: 405,
		statusText: "Method Not Allowed",
	},
	CONFLICT: {
		status: 409,
		statusText: "Conflict",
	},
	INTERNAL_SERVER_ERROR: {
		status: 500,
		statusText: "Internal Server Error",
	},
};
