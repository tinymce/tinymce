import AlloyEvents from '../../api/events/AlloyEvents';
import Behaviour from '../common/Behaviour';
import RepresentApis from './RepresentApis';

var events = function (repConfig, repState) {
  var es = repConfig.resetOnDom() ? [
    AlloyEvents.runOnAttached(function (comp, se) {
      RepresentApis.onLoad(comp, repConfig, repState);
    }),
    AlloyEvents.runOnDetached(function (comp, se) {
      RepresentApis.onUnload(comp, repConfig, repState);
    })
  ] : [
    Behaviour.loadEvent(repConfig, repState, RepresentApis.onLoad)
  ];

  return AlloyEvents.derive(es);
};

export default <any> {
  events: events
};