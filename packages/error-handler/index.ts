export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly details?: any;

    constructor(message:string,statusCode:number,isOperational:boolean,details?:any) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;
        Error.captureStackTrace(this);
    }

}

//Not found Error
export class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, 404,true);
    }
}
//Validation Error (use for jio/zod/react-hook-form validation error)
export class ValidationError extends AppError {
    constructor(message = "Invalid request data", details?: any) {
        super(message, 400,true,details);
    
    }
}
//Authentication Error
export class AuthenticationError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, 401, true);
    }
}
//forbidden Error(For Insuffucient Permissions)
export class ForbiddenError extends AppError {
    constructor(message = "Forbidden") {
        super(message, 403, true);
    }
}
//database Error
export class DatabaseError extends AppError {
    constructor(message = "Database error", details?: any) {
        super(message, 500, true, details);
    }
}
//rate limit Error
export class RateLimitError extends AppError {
    constructor(message = "Too many requests", details?: any) {
        super(message, 429, true, details);
    }
}