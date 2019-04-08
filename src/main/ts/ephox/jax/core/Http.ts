import { Blob, XMLHttpRequest, FormData, File, fetch, Response, Headers } from '@ephox/dom-globals';
import { FutureResult, Result, Option, Obj, Type, Strings, Global } from '@ephox/katamari';
import * as ResponseError from './ResponseError';
import * as ResponseSuccess from './ResponseSuccess';
import * as HttpTypes from './HttpTypes';
import { HttpError, HttpErrorCode } from './HttpError';
import { DataType } from './DataType';
import { RequestBody, ResponseBodyDataTypes, ResponseTypeMap, textData } from './HttpData';
import { buildUrl } from './UrlBuilder';

const getContentType = (requestBody: RequestBody): Option<string> => {
  return Option.from(requestBody).bind((b) => {
    switch (b.type) {
      case DataType.JSON: return Option.some('application/json');
      case DataType.FormData: return Option.some('application/x-www-form-urlencoded; charset=UTF-8');
      case DataType.MultipartFormData: return Option.none();
      case DataType.Text: return Option.some('text/plain');
      default: return Option.some('text/plain');
    }
  });
};

const getAccept = (responseType: ResponseBodyDataTypes) => {
  switch (responseType) {
    case DataType.Blob: return 'application/octet-stream';
    case DataType.JSON: return 'application/json, text/javascript';
    case DataType.Text: return 'text/plain';
    default: return '';
  }
};

const getResponseType = (responseType: ResponseBodyDataTypes): Option<'blob' | 'text'> => {
  switch (responseType) {
    case DataType.JSON: return Option.none();
    case DataType.Blob: return Option.some<'blob' | 'text'>('blob');
    case DataType.Text: return Option.some<'blob' | 'text'>('text');
    default: return Option.none();
  }
};

const createOptions = <T extends keyof ResponseTypeMap>(init: HttpTypes.HttpRequest<T>) => {
  const contentType = getContentType(init.body);
  const credentials: Option<boolean> = init.credentials === true ? Option.some(true) : Option.none();
  const accept = getAccept(init.responseType) + ', */*; q=0.01';
  const headers = init.headers !== undefined ? init.headers : {};
  const responseType = getResponseType(init.responseType);
  const progress: Option<HttpTypes.ProgressFunction> = Type.isFunction(init.progress) ? Option.some(init.progress) : Option.none();

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

const toNativeFormData = (formDataInput: Record<string, string | Blob | File>) => {
  const nativeFormData = new FormData();
  Obj.each(formDataInput, (value, key) => {
    nativeFormData.append(key, value);
  });
  return nativeFormData;
};

const getData = (body: RequestBody) => Option.from(body).map((b) => {
  if (b.type === DataType.JSON) {
    return JSON.stringify(b.data);
  } else if (b.type === DataType.FormData) {
    return toNativeFormData(b.data);
  } else if (b.type === DataType.MultipartFormData) {
    return toNativeFormData(b.data);
  } else {
    return b;
  }
});

const send = <T extends keyof ResponseTypeMap>(init: HttpTypes.HttpRequest<T>) => {
  return FutureResult.nu<ResponseTypeMap[T], HttpError>((callback) => {
    const request = new XMLHttpRequest();
    request.open(init.method, buildUrl(init.url, Option.from(init.query)), true); // enforced async! enforced type as String!

    const options = createOptions(init);
    applyOptions(request, options);

    const onError = () => {
      ResponseError.handle(init.url, init.responseType, request).get((err) => callback(Result.error(err)));
    };

    const onLoad = () => {
      // Local files and Cors errors return status 0.
      // The only way we can decifer a local request is request url starts with 'file:' and allow local files to succeed.
      if (request.status === 0 && ! Strings.startsWith(init.url, 'file:')) {
        onError();
      } else if (request.status < 100 || request.status >= 400) {
        onError();
      } else {
        ResponseSuccess.validate(init.responseType, request).get(callback);
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
};

const empty = () => textData('');

const post = <T extends keyof ResponseTypeMap>(init: HttpTypes.PostPutInit<T>) => {
  return send({ ...init, method: HttpTypes.HttpMethod.Post });
};

const put = <T extends keyof ResponseTypeMap>(init: HttpTypes.PostPutInit<T>) => {
  return send({ ...init, method: HttpTypes.HttpMethod.Put });
};

const get = <T extends keyof ResponseTypeMap>(init: HttpTypes.GetDelInit<T>) => {
  return send({ ...init, method: HttpTypes.HttpMethod.Get, body: empty() });
};

const del = <T extends keyof ResponseTypeMap>(init: HttpTypes.GetDelInit<T>) => {
  return send({ ...init, method: HttpTypes.HttpMethod.Delete, body: empty() });
};

interface FetchReaderResult {
  done: boolean;
  value: Uint8Array;
}

const sendProgress = (init: HttpTypes.DownloadHttpRequest, loaded: number) => {
  if (Type.isFunction(init.progress)) {
    init.progress(loaded);
  }
};

const getMimeType = (headers: Headers) => {
  return Option.from(headers.get('content-type')).map((value) => {
    return value.split(';')[0];
  });
};

const fetchDownload = (init: HttpTypes.DownloadHttpRequest): FutureResult<Blob, HttpError> => {
  return FutureResult.nu((resolve) => {
    const fail = (message: string, status: number) => {
      resolve(Result.error({
        message,
        status,
        responseText: ''
      }));
    };

    const failOnError = (e: Error) => {
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
        const process = (result: FetchReaderResult) => {
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

    fetch(init.url, {
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
};

const fallbackDownload = (init: HttpTypes.DownloadHttpRequest): FutureResult<Blob, HttpError> => {
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

const download = (init: HttpTypes.DownloadHttpRequest): FutureResult<Blob, HttpError> => {
  return Obj.get(Global, 'fetch').exists(Type.isFunction) ? fetchDownload(init) : fallbackDownload(init);
};

export {
  send,
  post,
  put,
  get,
  del,
  download
};
