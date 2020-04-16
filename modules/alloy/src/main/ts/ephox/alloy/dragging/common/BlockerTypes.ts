import { Event } from '@ephox/dom-globals';
import { EventArgs } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';

export interface BlockerDragApi<T extends Event> {
  drop: (comp: AlloyComponent) => void;
  delayDrop: (comp: AlloyComponent) => void;
  forceDrop: (comp: AlloyComponent) => void;
  move: (evt: EventArgs<T>) => void;
}
