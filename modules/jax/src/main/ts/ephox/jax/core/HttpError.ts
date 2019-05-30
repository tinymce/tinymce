import { Result } from '@ephox/katamari';

export const enum HttpErrorCode {
  Created = 201,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  InternalServerError = 500
}

export interface HttpError {
  message: string;
  status: HttpErrorCode;
  responseText: string;
}

export const httpError = <T>(status: number, message: string, responseText: string): Result<T, HttpError> => Result.error<T>({ message, status, responseText });
