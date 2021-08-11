import { FutureResult } from '@ephox/katamari';

import * as Http from './Http';
import { ResponseBodyDataTypes, ResponseTypeMap } from './HttpData';
import { HttpError, HttpErrorCode } from './HttpError';
import { GetDelInit, HttpRequest, JwtToken, JwtTokenFactory, PostPutInit } from './HttpTypes';

const headers = (headersInput: HttpRequest<ResponseBodyDataTypes>['headers'], token: string) => {
  const authHeader = { Authorization: 'Bearer ' + token };
  return headersInput ? { ...headersInput, ...authHeader } : authHeader;
};

type RunMethod<T, U extends keyof ResponseTypeMap> = (token: JwtToken) => FutureResult<T, HttpError<U>>;

const requestFreshToken = <T extends keyof ResponseTypeMap>(tokenFactory: JwtTokenFactory): FutureResult<JwtToken, HttpError<T>> => tokenFactory(true);
const requestCachedToken = <T extends keyof ResponseTypeMap>(tokenFactory: JwtTokenFactory): FutureResult<JwtToken, HttpError<T>> => tokenFactory(false);

const tryAgain = <T, U extends keyof ResponseTypeMap>(tokenFactory: JwtTokenFactory, runMethod: RunMethod<T, U>) =>
  (error: HttpError<U>) => error.status === HttpErrorCode.Unauthorized ? requestFreshToken(tokenFactory).bindFuture(runMethod) : FutureResult.error(error);

const runWithToken = <T extends keyof ResponseTypeMap>(runMethod: RunMethod<ResponseTypeMap[T], T>, tokenFactory: JwtTokenFactory): FutureResult<T, HttpError<any>> =>
  requestCachedToken(tokenFactory)
    .bindFuture<ResponseTypeMap[T]>(
    (token) => runMethod(token).bind((result) => result.fold(tryAgain(tokenFactory, runMethod), FutureResult.pure))
  );

export const post = <T extends keyof ResponseTypeMap>(init: PostPutInit<T>, tokenFactory: JwtTokenFactory): FutureResult<T, HttpError<T>> =>
  runWithToken<T>((token) => Http.post({ ...init, headers: headers(init.headers, token) }), tokenFactory);
export const put = <T extends keyof ResponseTypeMap>(init: PostPutInit<T>, tokenFactory: JwtTokenFactory): FutureResult<T, HttpError<T>> =>
  runWithToken<T>((token) => Http.put({ ...init, headers: headers(init.headers, token) }), tokenFactory);
export const get = <T extends keyof ResponseTypeMap>(init: GetDelInit<T>, tokenFactory: JwtTokenFactory): FutureResult<T, HttpError<T>> =>
  runWithToken<T>((token) => Http.get({ ...init, headers: headers(init.headers, token) }), tokenFactory);
export const del = <T extends keyof ResponseTypeMap>(init: GetDelInit<T>, tokenFactory: JwtTokenFactory): FutureResult<T, HttpError<T>> =>
  runWithToken<T>((token) => Http.del({ ...init, headers: headers(init.headers, token) }), tokenFactory);
