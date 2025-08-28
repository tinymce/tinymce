import { Fun, Optional } from '@ephox/katamari';
import { Compare, Focus, SugarElement } from '@ephox/sugar';

import { Highlighting } from '../behaviour/Highlighting';
import { AlloyComponent } from '../component/ComponentApi';
import * as AlloyTriggers from '../events/AlloyTriggers';
import * as SystemEvents from '../events/SystemEvents';

const reportFocusShifting = (component: AlloyComponent, prevFocus: Optional<SugarElement<HTMLElement>>, newFocus: Optional<SugarElement<HTMLElement>>) => {
  const noChange = prevFocus.exists((p) => newFocus.exists((n) => Compare.eq(n, p)));
  if (!noChange) {
    AlloyTriggers.emitWith(component, SystemEvents.focusShifted(), {
      prevFocus,
      newFocus
    });
  }
};

export interface FocusManager {
  get: (component: AlloyComponent) => Optional<SugarElement<HTMLElement>>;
  set: (component: AlloyComponent, focusee: SugarElement<HTMLElement>) => void;
}

const dom = (): FocusManager => {
  const get = (component: AlloyComponent) => Focus.search(component.element);

  const set = (component: AlloyComponent, focusee: SugarElement<HTMLElement>) => {
    const prevFocus = get(component);
    component.getSystem().triggerFocus(focusee, component.element);
    const newFocus = get(component);
    reportFocusShifting(component, prevFocus, newFocus);
  };

  return {
    get,
    set
  };
};

const highlights = (): FocusManager => {
  const get = (component: AlloyComponent) => Highlighting.getHighlighted(component).map((item) => item.element);

  const set = (component: AlloyComponent, element: SugarElement<HTMLElement>) => {
    const prevFocus = get(component);
    component.getSystem().getByDom(element).fold(Fun.noop, (item) => {
      Highlighting.highlight(component, item);
    });
    const newFocus = get(component);
    reportFocusShifting(component, prevFocus, newFocus);
  };

  return {
    get,
    set
  };
};

export {
  dom,
  highlights
};
