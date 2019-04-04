import { JwtTokenFactory, PostPutInit, GetDelInit, JwtToken, HttpRequest } from './HttpTypes';
import * as Http from './Http';
import { FutureResult } from '@ephox/katamari';
import { ResponseBodyDataTypes, ResponseTypeMap } from './HttpData';
import { HttpError, HttpErrorCode } from './HttpError';

const headers = (headersInput: HttpRequest<ResponseBodyDataTypes>['headers'], token: string) => {
  const authHeader = { Authorization: 'Bearer ' + token };
  return headersInput ? {...headersInput, ...authHeader} : authHeader;
};

type RunMethod<T> = (token: JwtToken) => FutureResult<T, HttpError>;

const requestFreshToken = (tokenFactory: JwtTokenFactory) => tokenFactory(true);
const requestCachedToken = (tokenFactory: JwtTokenFactory) => tokenFactory(false);

const tryAgain = <T>(tokenFactory: JwtTokenFactory, runMethod: RunMethod<T>) => (error: HttpError) => {
  return error.status === HttpErrorCode.Unauthorized ? requestFreshToken(tokenFactory).bindFuture(runMethod) : FutureResult.error(error);
};

const runWithToken = <T extends keyof ResponseTypeMap>(runMethod: RunMethod<ResponseTypeMap[T]>, tokenFactory: JwtTokenFactory) =>
  requestCachedToken(tokenFactory)
  .bindFuture<ResponseTypeMap[T]>(
    (token) => runMethod(token).bind((result) => result.fold(tryAgain(tokenFactory, runMethod), FutureResult.pure))
  );

export const post = <T extends keyof ResponseTypeMap>(init: PostPutInit<T>, tokenFactory: JwtTokenFactory) => {
  return runWithToken<T>((token) => Http.post({...init, headers: headers(init.headers, token)}), tokenFactory);
};
export const put = <T extends keyof ResponseTypeMap>(init: PostPutInit<T>, tokenFactory: JwtTokenFactory) => {
  return runWithToken<T>((token) => Http.put({...init, headers: headers(init.headers, token)}), tokenFactory);
};
export const get = <T extends keyof ResponseTypeMap>(init: GetDelInit<T>, tokenFactory: JwtTokenFactory) => {
  return runWithToken<T>((token) => Http.get({...init, headers: headers(init.headers, token)}), tokenFactory);
};
export const del = <T extends keyof ResponseTypeMap>(init: GetDelInit<T>, tokenFactory: JwtTokenFactory) => {
  return runWithToken<T>((token) => Http.del({...init, headers: headers(init.headers, token)}), tokenFactory);
};