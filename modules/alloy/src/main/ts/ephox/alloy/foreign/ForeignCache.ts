import { Objects } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

import * as DomState from '../alien/DomState';
import { Dragging } from '../api/behaviour/Dragging';
import { Pinching } from '../api/behaviour/Pinching';
import { Toggling } from '../api/behaviour/Toggling';
import * as CompBehaviours from '../api/component/CompBehaviours';
import { Dispatcher, DispatchedAlloyConfig } from '../api/system/ForeignGui';
import * as BehaviourBlob from '../behaviour/common/BehaviourBlob';
import * as ComponentEvents from '../construct/ComponentEvents';

export default () => {
  const getEvents = (elem: Element, spec: DispatchedAlloyConfig) => {
    const evts = DomState.getOrCreate(elem, () => {
      // If we haven't already setup this particular element, then generate any state and config
      // required by its behaviours and put it in the cache.
      const info = {
        events: Objects.hasKey(spec, 'events') ? spec.events : { },
        eventOrder: Objects.hasKey(spec, 'eventOrder') ? spec.eventOrder : { }
      };

      // NOTE: Note all behaviours are supported at the moment
      const bInfo = CompBehaviours.generateFrom(spec, [ Toggling, Dragging, Pinching ]);
      const baseEvents = {
        'alloy.base.behaviour': info.events
      };

      const bData = BehaviourBlob.getData(bInfo);
      return ComponentEvents.combine(bData, info.eventOrder, [ Toggling, Dragging, Pinching ], baseEvents).getOrDie();
    });

    return {
      elem: Fun.constant(elem),
      evts: Fun.constant(evts)
    };
  };

  return {
    getEvents
  };
};