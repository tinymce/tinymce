import { Fun, Option } from '@ephox/katamari';
import { Focus, Element, Compare } from '@ephox/sugar';

import { Highlighting } from '../behaviour/Highlighting';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloyTriggers } from '../Main';

export interface FocusManager {
  get: (component: AlloyComponent) => Option<Element>;
  set: (component: AlloyComponent, focusee: Element) => void;
}

const dom = (): FocusManager => {
  const get = (component) => {
    return Focus.search(component.element());
  };

  const set = (component, focusee) => {
    const prevFocus = get(component);
    component.getSystem().triggerFocus(focusee, component.element());
    const newFocus = get(component);
    if (! prevFocus.exists((p) => newFocus.exists((n) => Compare.eq(n, p)))) {
      AlloyTriggers.emitWith(component, 'focusManager.change', {
        prevFocus,
        newFocus
      });
    }
  };

  return {
    get,
    set
  };
};

const highlights = (): FocusManager => {
  const get = (component) => {
    return Highlighting.getHighlighted(component).map((item) => {
      return item.element();
    });
  };

  const set = (component, element) => {
    const prevFocus = get(component);
    component.getSystem().getByDom(element).fold(Fun.noop, (item) => {
      Highlighting.highlight(component, item);
    });
    const newFocus = get(component);
    if  (! prevFocus.exists((p) => newFocus.exists((n) => Compare.eq(n, p))))  {
      AlloyTriggers.emitWith(component, 'focusManager.change', {
        prevFocus,
        newFocus
      });
    }
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