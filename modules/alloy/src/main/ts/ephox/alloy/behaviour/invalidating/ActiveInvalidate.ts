import { Fun } from '@ephox/katamari';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import { Stateless } from '../../behaviour/common/BehaviourState';
import * as InvalidateApis from './InvalidateApis';
import { InvalidatingConfig } from './InvalidateTypes';

const events = (invalidConfig: InvalidatingConfig, invalidState: Stateless): AlloyEvents.AlloyEventRecord => {
  return invalidConfig.validator.map((validatorInfo) => {
    return AlloyEvents.derive([
      AlloyEvents.run(validatorInfo.onEvent, (component) => {
        InvalidateApis.run(component, invalidConfig, invalidState).get(Fun.identity);
      })
    ].concat(validatorInfo.validateOnLoad ? [
      AlloyEvents.runOnAttached((component) => {
        InvalidateApis.run(component, invalidConfig, invalidState).get(Fun.noop);
      })
    ] : [ ]));
  }).getOr({ });
};

export {
  events
};
