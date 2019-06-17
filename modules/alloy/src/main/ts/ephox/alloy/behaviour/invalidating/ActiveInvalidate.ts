import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as InvalidateApis from './InvalidateApis';
import { Fun } from '@ephox/katamari';
import { Stateless } from '../../behaviour/common/BehaviourState';
import { InvalidatingConfig } from '../../behaviour/invalidating/InvalidateTypes';
import { EventFormat } from '../../events/SimulatedEvent';

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