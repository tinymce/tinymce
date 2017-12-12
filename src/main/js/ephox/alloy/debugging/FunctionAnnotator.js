import { Option } from '@ephox/katamari';

var markAsBehaviourApi = function (f, apiName, apiFunction) {
  return f;
};

var markAsExtraApi = function (f, extraName) {
  return f;
};

var markAsSketchApi = function (f, apiFunction) {
  return f;
};

var getAnnotation = Option.none;

export default <any> {
  markAsBehaviourApi: markAsBehaviourApi,
  markAsExtraApi: markAsExtraApi,
  markAsSketchApi: markAsSketchApi,
  getAnnotation: getAnnotation
};