import { FutureResult } from '@ephox/katamari';
import { ResponseBodyDataTypes, RequestBody, ResponseBody } from './HttpData';
import { HttpError } from './HttpError';

export const enum HttpMethod {
  Get = 'get',
  Post = 'post',
  Delete = 'delete',
  Patch = 'patch',
  Put = 'put'
}

export type ProgressFunction = (loaded: number, total: number) => void;
export type LoadedProgressFunction = (loaded: number) => void;

export interface HttpRequest<T extends ResponseBodyDataTypes> {
  responseType: T;
  body: RequestBody;
  url: string;
  method: HttpMethod;
  query?: Record<string, string>;
  progress?: ProgressFunction;
  headers?: Record<string, string>;
  credentials?: boolean;
}

export interface HttpResponse<T extends ResponseBody> {
  headers: Record<string, string>;
  statusCode: number;
  body: T;
}

export type JwtToken = string;
export type JwtTokenFactory = (fresh: boolean) => FutureResult<JwtToken, HttpError>;

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

export type PostPutInit <T extends ResponseBodyDataTypes> = Omit<HttpRequest<T>, 'method'>;
export type GetDelInit <T extends ResponseBodyDataTypes> = Omit<HttpRequest<T>, 'method' | 'body'>;

export interface DownloadHttpRequest {
  url: string;
  progress?: LoadedProgressFunction;
  headers?: Record<string, string>;
  credentials?: boolean;
}
