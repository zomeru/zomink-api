export const ErrorType = {
  BadRequestException: 400,
  UnauthorizedException: 401,
  NotFoundException: 404,
  ForbiddenException: 403,
  NotAcceptableException: 406,
  RequestTimeoutException: 408,
  ConflictException: 409,
  GoneException: 410,
  HttpVersionNotSupportedException: 505,
  PayloadTooLargeException: 413,
  UnsupportedMediaTypeException: 415,
  UnprocessableEntityException: 422,
  InternalServerErrorException: 500,
  NotImplementedException: 501,
  ImATeapotException: 418,
  MethodNotAllowedException: 405,
  BadGatewayException: 502,
  ServiceUnavailableException: 503,
  GatewayTimeoutException: 504,
  PreconditionFailedException: 412,
};

export const StatusType = {
  Success: 'success',
  Error: 'error',
};

export const SuccessType = {
  OK: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  IMUsed: 226,
};

export type ErrorResponse = {
  statusCode: number;
  message: string;
};

export type ErrorTypeKeys = keyof typeof ErrorType;
export type ErrorTypeValues = typeof ErrorType[ErrorTypeKeys]; //  "
export type SuccessTypeValues = typeof SuccessType[keyof typeof SuccessType]; //  "

export class AppError extends Error {
  statusCode: ErrorTypeValues;

  status: string;

  constructor(
    message: string,
    statusCode: ErrorTypeValues | SuccessTypeValues
  ) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4')
      ? StatusType.Error
      : StatusType.Success;

    Error.captureStackTrace(this, this.constructor);
  }
}

// export class AppError extends Error {
//   error: string;

//   statusCode: ErrorTypeValues;

//   constructor(statusCode: ErrorTypeValues, message: string) {
//     super(message);

//     this.error = message;
//     this.statusCode = statusCode;

//     // Error.captureStackTrace(this, this.constructor);
//   }

//   get StatusCode() {
//     return this.statusCode;
//   }

//   get JSON(): ErrorResponse {
//     return {
//       message: this.error,
//       statusCode: this.statusCode,
//     };
//   }
// }
