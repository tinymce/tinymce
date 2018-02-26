import { Option } from '@ephox/katamari';

const markAsBehaviourApi = function (f, apiName, apiFunction) {
  return f;
};

const markAsExtraApi = function (f, extraName) {
  return f;
};

const markAsSketchApi = function (f, apiFunction) {
  return f;
};

const getAnnotation = Option.none;

export {
  markAsBehaviourApi,
  markAsExtraApi,
  markAsSketchApi,
  getAnnotation
};