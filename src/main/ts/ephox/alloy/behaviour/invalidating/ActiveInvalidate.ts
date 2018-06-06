import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as InvalidateApis from './InvalidateApis';
import { Fun } from '@ephox/katamari';
import { Stateless } from 'ephox/alloy/behaviour/common/NoState';
import { InvalidatingConfig } from 'ephox/alloy/behaviour/invalidating/InvalidateTypes';

const events = function (invalidConfig: InvalidatingConfig, invalidState: Stateless): AlloyEvents.EventHandlerConfigRecord {
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