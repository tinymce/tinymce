import { FieldSchema, Objects, ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import * as DomState from '../alien/DomState';
import { Dragging } from '../api/behaviour/Dragging';
import { Pinching } from '../api/behaviour/Pinching';
import { Toggling } from '../api/behaviour/Toggling';
import * as CompBehaviours from '../api/component/CompBehaviours';
import BehaviourBlob from '../behaviour/common/BehaviourBlob';
import * as ComponentEvents from '../construct/ComponentEvents';
import { SketchSpec } from 'ephox/alloy/api/ui/Sketcher';

export default function () {
  const getEvents = function (elem, spec: SketchSpec) {
    const evts = DomState.getOrCreate(elem, function () {
      // If we haven't already setup this particular element, then generate any state and config
      // required by its behaviours and put it in the cache.
      const info = ValueSchema.asStructOrDie('foreign.cache.configuration', ValueSchema.objOfOnly([
        FieldSchema.defaulted('events', { }),
        FieldSchema.optionObjOf('behaviours', [
          // NOTE: Note all behaviours are supported at the moment
          Toggling.schema(),
          Dragging.schema(),
          Pinching.schema()
        ]),
        FieldSchema.defaulted('eventOrder', {})

      ]), Objects.narrow(spec, [ 'events', 'eventOrder' ]));

      const bInfo = CompBehaviours.generateFrom(spec, [ Toggling, Dragging, Pinching ]);
      const baseEvents = {
        'alloy.base.behaviour': info.events()
      };

      const bData = BehaviourBlob.getData(bInfo);
      return ComponentEvents.combine(bData, info.eventOrder(), [ Toggling, Dragging, Pinching ], baseEvents).getOrDie();
    });

    return {
      elem: Fun.constant(elem),
      evts: Fun.constant(evts)
    };
  };

  return {
    getEvents
  };
}