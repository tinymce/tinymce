import { Future, Result } from '@ephox/katamari';
import { Body, Class, Html } from '@ephox/sugar';

import * as AriaVoice from '../../alien/AriaVoice';

const markValid = function (component, invalidConfig/*, invalidState */) {
  const elem = invalidConfig.getRoot()(component).getOr(component.element());
  Class.remove(elem, invalidConfig.invalidClass());
  invalidConfig.notify().bind(function (notifyInfo) {
    notifyInfo.getContainer()(component).each(function (container) {
      Html.set(container, notifyInfo.validHtml());
    });

    notifyInfo.onValid()(component);
  });
};

const markInvalid = function (component, invalidConfig, invalidState, text) {
  const elem = invalidConfig.getRoot()(component).getOr(component.element());
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

const query = function (component, invalidConfig, invalidState) {
  return invalidConfig.validator().fold(function () {
    return Future.pure(Result.value(true));
  }, function (validatorInfo) {
    return validatorInfo.validate()(component);
  });
};

const run = function (component, invalidConfig, invalidState) {
  invalidConfig.notify().each(function (notifyInfo) {
    notifyInfo.onValidate()(component);
  });

  return query(component, invalidConfig, invalidState).map(function (valid) {
    if (component.getSystem().isConnected()) {
      return valid.fold(function (err) {
        markInvalid(component, invalidConfig, invalidState, err);
        return Result.error(err);
      }, function (v) {
        markValid(component, invalidConfig);
        return Result.value(v);
      });
    } else {
      return Result.error('No longer in system');
    }
  });
};

export {
  markValid,
  markInvalid,
  query,
  run
};