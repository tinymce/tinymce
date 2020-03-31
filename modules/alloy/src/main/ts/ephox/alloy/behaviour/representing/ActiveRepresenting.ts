import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as Behaviour from '../common/Behaviour';
import * as RepresentApis from './RepresentApis';
import { RepresentingConfig, RepresentingState } from './RepresentingTypes';

const events = (repConfig: RepresentingConfig, repState: RepresentingState): AlloyEvents.AlloyEventRecord => {
  const es = repConfig.resetOnDom ? [
    AlloyEvents.runOnAttached((comp, _se) => {
      RepresentApis.onLoad(comp, repConfig, repState);
    }),
    AlloyEvents.runOnDetached((comp, _se) => {
      RepresentApis.onUnload(comp, repConfig, repState);
    })
  ] : [
    Behaviour.loadEvent(repConfig, repState, RepresentApis.onLoad)
  ];

  return AlloyEvents.derive(es);
};

export {
  events
};
