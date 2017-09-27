define(
  'ephox.alloy.behaviour.invalidating.InvalidateApis',

  [
    'ephox.alloy.alien.AriaVoice',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Html'
  ],

  function (AriaVoice, Future, Result, Body, Class, Html) {
    var markValid = function (component, invalidConfig/*, invalidState */) {
      var elem = invalidConfig.getRoot()(component).getOr(component.element());
      Class.remove(elem, invalidConfig.invalidClass());
      invalidConfig.notify().bind(function (notifyInfo) {
        notifyInfo.getContainer()(component).each(function (container) {
          Html.set(container, notifyInfo.validHtml());
        });

        notifyInfo.onValid()(component);
      });
    };

    var markInvalid = function (component, invalidConfig, invalidState, text) {
      var elem = invalidConfig.getRoot()(component).getOr(component.element());
      Class.add(elem, invalidConfig.invalidClass());
      invalidConfig.notify().each(function (notifyInfo) {
        // Probably want to make "Body" configurable as well.
        AriaVoice.shout(Body.body(), text);
        notifyInfo.getContainer()(component).each(function (container) {
          // TODO: Should we just use Text here, not HTML?
          Html.set(container, text);
        });

        notifyInfo.onInvalid()(component, text);
      });
    };

    var query = function (component, invalidConfig, invalidState) {
      return invalidConfig.validator().fold(function () {
        return Future.pure(Result.value(true));
      }, function (validatorInfo) {
        return validatorInfo.validate()(component);
      });
    };


    var run = function (component, invalidConfig, invalidState) {
      invalidConfig.notify().each(function (notifyInfo) {
        notifyInfo.onValidate()(component);
      });

      return query(component, invalidConfig, invalidState).map(function (valid) {
        return valid.fold(function (err) {
          markInvalid(component, invalidConfig, invalidState, err);
          return Result.error(err);
        }, function (v) {
          markValid(component, invalidConfig, invalidState);
          return Result.value(v);
        });
      });
    };

    return {
      markValid: markValid,
      markInvalid: markInvalid,
      query: query,
      run: run
    };
  }
);