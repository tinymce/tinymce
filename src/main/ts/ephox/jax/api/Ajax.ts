import { Methods } from './Methods';
import { RequestOptions } from '../request/RequestOptions';
import { RequestUpdate } from '../request/RequestUpdate';
import { ResponseError } from '../response/ResponseError';
import { ResponseSuccess } from '../response/ResponseSuccess';
import { Fun } from '@ephox/katamari';
import { FutureResult } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Result } from '@ephox/katamari';
import { Strings } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';
import { XMLHttpRequest } from '@ephox/sand';
import { ContentType } from './ContentType';
import { ResponseType } from './ResponseType';
import { Credentials } from './Credentials';
import { USVString, Document, Blob, BufferSource, FormData, URLSearchParams, ReadableStream } from '@ephox/dom-globals';

// _custom gets defaulted to an empty object.
const send = function (url: string, method: Methods, contentType: Option<ContentType>, responseType: ResponseType, credentials: Credentials, _custom?: Record<string, string>) {
  const custom = _custom !== undefined ? _custom : { };

  return FutureResult.nu<any, ResponseError>(function (callback) {
    const type = method.match({
      get: Fun.constant('get'),
      put: Fun.constant('put'),
      post: Fun.constant('post'),
      del: Fun.constant('delete')
    });

    const request = XMLHttpRequest();
    request.open(type, url, true); // enforced async! enforced type as String!

    const options = RequestOptions.generate(contentType, responseType, credentials, custom);
    RequestUpdate.mutate(request, options);

    const onError = function () {
      ResponseError.handle(url, responseType, request).get(function (err) {
        callback(Result.error(err));
      });
    };

    const onLoad = function () {
      // Local files and Cors errors return status 0.
      // The only way we can decifer a local request is request url starts with 'file:' and allow local files to succeed.
      if (request.status === 0 && ! Strings.startsWith(url, 'file:')) onError();
      else if ( request.status < 100 || request.status >= 400) onError();
      else ResponseSuccess.validate(responseType, request).get(callback);
    };

    request.onload = onLoad;
    request.onerror = onError;

    // There isn't really a nice way to unwrap this
    contentType.fold(function () {
      request.send();
    }, function (cType) {
      const data = cType.match<Document | Blob | BufferSource | FormData | URLSearchParams | ReadableStream | USVString>({
        file: Fun.identity,
        form: Fun.identity,
        json: Json.stringify,
        plain: Fun.identity,
        html: Fun.identity
      });
      request.send(data);
    });


  }).toLazy();
};

const get = function (url: string, responseType: ResponseType, credentials: Credentials, _custom?: Record<string, string>) {
  const method = Methods.get();
  return send(url, method, Option.none(), responseType, credentials, _custom);
};

const post = function (url: string, contentType: ContentType, responseType: ResponseType, credentials: Credentials, _custom?: Record<string, string>) {
  const method = Methods.post();
  return send(url, method, Option.some(contentType), responseType, credentials, _custom);
};

const put = function (url: string, contentType: ContentType, responseType: ResponseType, credentials: Credentials, _custom?: Record<string, string>) {
  const method = Methods.put();
  return send(url, method, Option.some(contentType), responseType, credentials, _custom);
};

const del = function (url: string, responseType: ResponseType, credentials: Credentials, _custom?: Record<string, string>) {
  const method = Methods.del();
  return send(url, method, Option.none(), responseType, credentials, _custom);
};

export {
  get,
  post,
  put,
  del
};