import BlobError from './BlobError';
import JsonResponse from './JsonResponse';
import { Future } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Struct } from '@ephox/katamari';

var getBlobError = function (request) {
  // can't get responseText of a blob, throws a DomException. Need to use FileReader.
  // request.response can be null if the server provided no content in the error response.
  return Option.from(request.response).map(BlobError).getOr(Future.pure('no response content'));
};

var handle = function (url, responseType, request) {
  var fallback = function () {
    return Future.pure(request.response);
  };

  var asyncResText = responseType.match({
    json: function () {
      // for errors, the responseText is json if it can be, fallback if it can't
      return JsonResponse.parse(request.response).fold(fallback, Future.pure);
    },
    blob: function () {
      return getBlobError(request);
    },
    text: fallback,
    html: fallback,
    xml: fallback
  });

  return asyncResText.map(function (responseText) {
    var message = request.status === 0 ? 'Unknown HTTP error (possible cross-domain request)' :  'Could not load url "' + url + '": ' + request.statusText;
    return nu({
      message: message,
      status: request.status,
      responseText: responseText
    });
  });
};

var nu = Struct.immutableBag([ 'message', 'status', 'responseText' ], [ ]);

export default <any> {
  handle: handle,
  nu: nu
};