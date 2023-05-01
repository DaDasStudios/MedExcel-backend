export enum ResponseStatus {
    NOT_FOUND_QUESTIONS = "NOT_FOUND_QUESTIONS",
    NOT_FOUND_USER = "NOT_FOUND_USER",
    NOT_FOUND_REVIEW = "NOT_FOUND_REVIEW",
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
    BAD_REQUEST = "BAD_REQUEST",
    REVOKED_TOKEN = "REVOKED_TOKEN",
    SESSION_EXPIRED = "SESSION_EXPIRED",
    UNAUTHORIZED = "UNAUTHORIZED",

    // * Success response status
    RESOURCE_CREATED = "RESOURCE_CREATED",
    RESOURCE_DELETED = "RESOURCE_DELETED",
    USER_UPDATED = "USER_UPDATED",
    USER_DELETED = "USER_DELETED",
    CORRECT = "CORRECT",

    // * Question status
    EXAM_CANCELED = "EXAM_CANCELED",
    EXAM_STARTED = "EXAM_STARTED",
    EXAM_FINISHED = "EXAM_FINISHED",

    // * Pending to action status
    WAITING_FOR_AUTHENTICATION = "WAITING_FOR_AUTHENTICATION",
}