import { FutureResult, Global, Obj, Optional, Result, Strings, Type } from '@ephox/katamari';

import { DataType } from './DataType';
import { RequestBody, ResponseBodyDataTypes, ResponseType, ResponseTypeMap, textData } from './HttpData';
import { HttpError, HttpErrorCode } from './HttpError';
import * as HttpTypes from './HttpTypes';
import * as ResponseError from './ResponseError';
import * as ResponseSuccess from './ResponseSuccess';
import { buildUrl } from './UrlBuilder';

const getContentType = (requestBody: RequestBody): Optional<string> => Optional.from(requestBody).bind((b) => {
  switch (b.type) {
    case DataType.JSON: return Optional.some('application/json');
    case DataType.FormData: return Optional.some('application/x-www-form-urlencoded; charset=UTF-8');
    case DataType.MultipartFormData: return Optional.none();
    case DataType.Text: return Optional.some('text/plain');
    default: return Optional.some('text/plain');
  }
});

const getAccept = (responseType: ResponseBodyDataTypes) => {
  switch (responseType) {
    case DataType.Blob: return 'application/octet-stream';
    case DataType.JSON: return 'application/json, text/javascript';
    case DataType.Text: return 'text/plain';
    default: return '';
  }
};

const getResponseType = (responseType: ResponseBodyDataTypes): Optional<'blob' | 'text'> => {
  switch (responseType) {
    case DataType.JSON: return Optional.none();
    case DataType.Blob: return Optional.some<'blob' | 'text'>('blob');
    case DataType.Text: return Optional.some<'blob' | 'text'>('text');
    default: return Optional.none();
  }
};

const createOptions = <T extends ResponseType>(init: HttpTypes.HttpRequest<T>) => {
  const contentType = getContentType(init.body);
  const credentials: Optional<boolean> = init.credentials === true ? Optional.some<boolean>(true) : Optional.none<boolean>();
  const accept = getAccept(init.responseType) + ', */*; q=0.01';
  const headers = init.headers !== undefined ? init.headers : {};
  const responseType = getResponseType(init.responseType);
  const progress: Optional<HttpTypes.ProgressFunction> = Type.isFunction(init.progress) ? Optional.some(init.progress) : Optional.none();

  return {
    contentType,
    responseType,
    credentials,
    accept,
    headers,
    progress
  };
};

const applyOptions = (request: XMLHttpRequest, options: ReturnType<typeof createOptions>) => {
  options.contentType.each((contentType) => request.setRequestHeader('Content-Type', contentType));
  request.setRequestHeader('Accept', options.accept);
  options.credentials.each((creds) => request.withCredentials = creds);
  options.responseType.each((responseType) => request.responseType = responseType);
  options.progress.each((progressFunction) => request.upload.addEventListener('progress', (event) => progressFunction(event.loaded, event.total)));
  Obj.each(options.headers, (v, k) => request.setRequestHeader(k, v));
};

const toNativeFormData = (formDataInput: Record<string, string | Blob | File>): FormData => {
  const nativeFormData = new FormData();
  Obj.each(formDataInput, (value, key) => {
    nativeFormData.append(key, value);
  });
  return nativeFormData;
};

const getData = (body: RequestBody): Optional<string | FormData | Blob> =>
  Optional.from(body).map((b) => {
    if (b.type === DataType.JSON) {
      return JSON.stringify(b.data);
    } else if (b.type === DataType.FormData) {
      return toNativeFormData(b.data);
    } else if (b.type === DataType.MultipartFormData) {
      return toNativeFormData(b.data);
    } else {
      return b.data;
    }
  });

const send = <T extends ResponseType>(init: HttpTypes.HttpRequest<T>): FutureResult<ResponseTypeMap[T], HttpError<T>> => FutureResult.nu((callback) => {
  const request = new XMLHttpRequest();
  request.open(init.method, buildUrl(init.url, Optional.from(init.query)), true); // enforced async! enforced type as String!

  const options = createOptions(init);
  applyOptions(request, options);

  const onError = () => {
    ResponseError.handle<T>(init.url, init.responseType, request).get((err) => callback(Result.error(err)));
  };

  const onLoad = () => {
    // Local files and Cors errors return status 0.
    // The only way we can decifer a local request is request url starts with 'file:' and allow local files to succeed.
    if (request.status === 0 && !Strings.startsWith(init.url, 'file:')) {
      onError();
    } else if (request.status < 100 || request.status >= 400) {
      onError();
    } else {
      ResponseSuccess.validate<T>(init.responseType, request).get(callback);
    }
  };

  request.onerror = onError;
  request.onload = onLoad;

  getData(init.body).fold(
    () => request.send(),
    (data) => {
      request.send(data);
    }
  );
});

const empty = () => textData('');

const post = <T extends ResponseType>(init: HttpTypes.PostPutInit<T>): FutureResult<ResponseTypeMap[T], HttpError<T>> =>
  send({ ...init, method: HttpTypes.HttpMethod.Post });

const put = <T extends ResponseType>(init: HttpTypes.PostPutInit<T>): FutureResult<ResponseTypeMap[T], HttpError<T>> =>
  send({ ...init, method: HttpTypes.HttpMethod.Put });

const get = <T extends ResponseType>(init: HttpTypes.GetDelInit<T>): FutureResult<ResponseTypeMap[T], HttpError<T>> =>
  send({ ...init, method: HttpTypes.HttpMethod.Get, body: empty() });

const del = <T extends ResponseType>(init: HttpTypes.GetDelInit<T>): FutureResult<ResponseTypeMap[T], HttpError<T>> =>
  send({ ...init, method: HttpTypes.HttpMethod.Delete, body: empty() });

const sendProgress = (init: HttpTypes.DownloadHttpRequest, loaded: number) => {
  if (Type.isFunction(init.progress)) {
    init.progress(loaded);
  }
};

const getMimeType = (headers: Headers) => Optional.from(headers.get('content-type')).map((value) => value.split(';')[0]);

const fetchDownload = (init: HttpTypes.DownloadHttpRequest): FutureResult<Blob, HttpError<DataType.Blob>> => FutureResult.nu((resolve) => {
  const fail = (message: string, status: number) => {
    resolve(Result.error<Blob, HttpError<DataType.Blob>>({
      message,
      status,
      responseText: new Blob()
    }));
  };

  const failOnError = (_e: Error) => {
    fail(`Could not load url ${init.url}`, HttpErrorCode.InternalServerError);
  };

  const downloadStream = (response: Response) => {
    const body = response.body;
    const chunks: Array<Uint8Array> = [];
    let loaded = 0;
    const mime = getMimeType(response.headers);

    sendProgress(init, 0);

    if (body) {
      const reader = body.getReader();
      const process = (result: ReadableStreamReadResult<Uint8Array>) => {
        if (result.done) {
          resolve(Result.value(new Blob(chunks, { type: mime.getOr('') })));
        } else {
          chunks.push(result.value);
          loaded += result.value.length;
          sendProgress(init, loaded);
          reader.read().then(process).catch(failOnError);
        }
      };

      reader.read().then(process).catch(failOnError);
    } else {
      fail('Failed to get response body', HttpErrorCode.InternalServerError);
    }
  };

  window.fetch(init.url, {
    method: 'get',
    headers: init.headers,
    credentials: init.credentials ? 'include' : 'omit'
  }).then((response) => {
    if (response.status < 100 || response.status >= 400) {
      fail(`Could not load url ${init.url}`, response.status);
    } else {
      downloadStream(response);
    }
  }).catch(failOnError);
});

const fallbackDownload = (init: HttpTypes.DownloadHttpRequest): FutureResult<Blob, HttpError<DataType.Blob>> => {
  sendProgress(init, 0);

  return get({
    url: init.url,
    responseType: DataType.Blob,
    headers: init.headers
  }).mapResult((blob) => {
    sendProgress(init, blob.size);
    return blob;
  });
};

const download = (init: HttpTypes.DownloadHttpRequest): FutureResult<Blob, HttpError<DataType.Blob>> =>
  Obj.get(Global, 'fetch').exists(Type.isFunction) ?
    fetchDownload(init) :
    fallbackDownload(init);

export {
  send,
  post,
  put,
  get,
  del,
  download
};
