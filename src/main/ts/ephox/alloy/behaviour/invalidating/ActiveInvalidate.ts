import * as AlloyEvents from '../../api/events/AlloyEvents';
import InvalidateApis from './InvalidateApis';
import { Fun } from '@ephox/katamari';

const events = function (invalidConfig, invalidState) {
  return invalidConfig.validator().map(function (validatorInfo) {
    return AlloyEvents.derive([
      AlloyEvents.run(validatorInfo.onEvent(), function (component) {
        InvalidateApis.run(component, invalidConfig, invalidState).get(Fun.identity);
      })
    ].concat(validatorInfo.validateOnLoad() ? [
      AlloyEvents.runOnAttached(function (component) {
        InvalidateApis.run(component, invalidConfig, invalidState).get(Fun.noop);
      })
    ] : [ ]));
  }).getOr({ });
};

export {
  events
};