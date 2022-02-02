import { FutureResult } from '@ephox/katamari';

import * as Http from './Http';
import { ResponseBodyDataTypes, ResponseType, ResponseTypeMap } from './HttpData';
import { HttpError, HttpErrorCode } from './HttpError';
import { GetDelInit, HttpRequest, JwtToken, JwtTokenFactory, PostPutInit } from './HttpTypes';

const headers = (headersInput: HttpRequest<ResponseBodyDataTypes>['headers'], token: string) => {
  const authHeader = { Authorization: 'Bearer ' + token };
  return headersInput ? { ...headersInput, ...authHeader } : authHeader;
};

type RunMethod<T extends ResponseType> = (token: JwtToken) => FutureResult<ResponseTypeMap[T], HttpError<T>>;

const requestFreshToken = <T extends ResponseType>(tokenFactory: JwtTokenFactory<T>): FutureResult<JwtToken, HttpError<T>> => tokenFactory(true);
const requestCachedToken = <T extends ResponseType>(tokenFactory: JwtTokenFactory<T>): FutureResult<JwtToken, HttpError<T>> => tokenFactory(false);

const tryAgain = <T extends ResponseType>(tokenFactory: JwtTokenFactory<T>, runMethod: RunMethod<T>) =>
  (error: HttpError<T>) => error.status === HttpErrorCode.Unauthorized ? requestFreshToken<T>(tokenFactory).bindFuture(runMethod) : FutureResult.error(error);

const runWithToken = <T extends ResponseType>(runMethod: RunMethod<T>, tokenFactory: JwtTokenFactory<T>): FutureResult<T, HttpError<T>> =>
  requestCachedToken<T>(tokenFactory).bindFuture(
    (token) => runMethod(token).bind((result) => result.fold(tryAgain<T>(tokenFactory, runMethod), FutureResult.pure))
  );

export const post = <T extends ResponseType>(init: PostPutInit<T>, tokenFactory: JwtTokenFactory<T>): FutureResult<T, HttpError<T>> =>
  runWithToken<T>((token) => Http.post({ ...init, headers: headers(init.headers, token) }), tokenFactory);
export const put = <T extends ResponseType>(init: PostPutInit<T>, tokenFactory: JwtTokenFactory<T>): FutureResult<T, HttpError<T>> =>
  runWithToken<T>((token) => Http.put({ ...init, headers: headers(init.headers, token) }), tokenFactory);
export const get = <T extends ResponseType>(init: GetDelInit<T>, tokenFactory: JwtTokenFactory<T>): FutureResult<T, HttpError<T>> =>
  runWithToken<T>((token) => Http.get({ ...init, headers: headers(init.headers, token) }), tokenFactory);
export const del = <T extends ResponseType>(init: GetDelInit<T>, tokenFactory: JwtTokenFactory<T>): FutureResult<T, HttpError<T>> =>
  runWithToken<T>((token) => Http.del({ ...init, headers: headers(init.headers, token) }), tokenFactory);
