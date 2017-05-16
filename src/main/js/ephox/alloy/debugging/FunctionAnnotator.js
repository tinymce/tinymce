define(
  'ephox.alloy.debugging.FunctionAnnotator',

  [
    'ephox.katamari.api.Option'
  ],

  function (Option) {
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

    return {
      markAsBehaviourApi: markAsBehaviourApi,
      markAsExtraApi: markAsExtraApi,
      markAsSketchApi: markAsSketchApi,
      getAnnotation: getAnnotation
    };
  }
);
