import { Result } from '@ephox/katamari';

import { ResponseTypeMap } from './HttpData';

export const enum HttpErrorCode {
  Created = 201,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  InternalServerError = 500
}

export interface HttpError<T extends keyof ResponseTypeMap> {
  message: string;
  status: HttpErrorCode;
  responseText: ResponseTypeMap[T];
}

export const httpError = <T extends keyof ResponseTypeMap>(status: number, message: string, responseText: T): Result<T, HttpError<T>> => Result.error<T>({ message, status, responseText });
