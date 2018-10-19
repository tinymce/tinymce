import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { ContentType } from '../api/ContentType';
import { Credentials } from '../api/Credentials';
import { ResponseType } from "../api/ResponseType";

export interface RequestOptions {
  contentType: () => Option<string>;
  credentials: () => Option<boolean>;
  responseType: () => Option<'blob' | 'document' | 'text'>;
  accept: () => string;
  headers: () => any;
}

const generate = function (cType: Option<ContentType>, rType: ResponseType, creds: Credentials, custom): RequestOptions {
  const contentType = cType.bind(function (adt) {
    return adt.match({
      file: function () {
        return Option.none<string>(); // browser sets this automatically
      },
      form: function () {
        return Option.some('application/x-www-form-urlencoded; charset=UTF-8');
      },
      json: function () {
        return Option.some('application/json');
      },
      plain: function () {
        return Option.some('text/plain');
      },
      html: function () {
        return Option.some('text/html');
      }
    });
  });

  const credentials = creds.match<Option<boolean>>({
    none: Option.none,
    xhr: Fun.constant(Option.some(true))
  });

  const responseType = rType.match<Option<'blob' | 'document' | 'text'>>({
    // Not supported by IE, so we have to manually process it
    json: Option.none,
    blob: Fun.constant(Option.some<'blob'>('blob')),
    // Check if cross-browser
    xml: Fun.constant(Option.some<'document'>('document')),
    html: Fun.constant(Option.some<'document'>('document')),
    text: Fun.constant(Option.some<'text'>('text'))
  });

  const exactAccept = rType.match({
    json: Fun.constant('application/json, text/javascript'),
    blob: Fun.constant('application/octet-stream'),
    text: Fun.constant('text/plain'),
    html: Fun.constant('text/html'),
    xml: Fun.constant('application/xml, text/xml')
  });

  // Always accept everything.
  const accept = exactAccept + ', */*; q=0.01';

  const headers = custom;

  return {
    contentType: Fun.constant(contentType),
    credentials: Fun.constant(credentials),
    responseType: Fun.constant(responseType),
    accept: Fun.constant(accept),
    headers: Fun.constant(headers)
  };
};

export const RequestOptions = {
  generate
};