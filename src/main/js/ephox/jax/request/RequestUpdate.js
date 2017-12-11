import { Obj } from '@ephox/katamari';
import { Type } from '@ephox/katamari';

var mutate = function (request, options) {
  options.contentType().each(function (contentType) {
    request.setRequestHeader('Content-Type', contentType);
  });

  var accept = options.accept();
  request.setRequestHeader('Accept', accept);

  options.credentials().each(function (creds) {
    // NOTE: IE10 minimum
    request.withCredentials = creds;
  });

  options.responseType().each(function (responseType) {
    request.responseType = responseType;
  });

  var extra = options.headers();
  Obj.each(extra, function (v, k) {
    if (!Type.isString(k) && !Type.isString(v)) console.error('Request header data was not a string: ', k, ' -> ', v);
    else request.setRequestHeader(k, v);
  });
};

export default <any> {
  mutate: mutate
};