import { Fun, Option } from '@ephox/katamari';
import { Focus } from '@ephox/sugar';

import { Highlighting } from '../behaviour/Highlighting';
import { SugarElement } from '../../alien/TypeDefinitions';
import { AlloyComponent } from '../../api/component/ComponentApi';

export interface FocusDom {
  get: (component: AlloyComponent) => any;
  set: (component: AlloyComponent, focusee: SugarElement) => void;
}

export interface FocusHighlights {
  get: (component: AlloyComponent) => Option<SugarElement>;
  set: (component: AlloyComponent, element: SugarElement) => void;
}

const dom = (): FocusDom => {
  const get = (component) => {
    return Focus.search(component.element());
  };

  const set = (component, focusee) => {
    component.getSystem().triggerFocus(focusee, component.element());
  };

  return {
    get,
    set
  };
};

const highlights = (): FocusHighlights => {
  const get = (component) => {
    return Highlighting.getHighlighted(component).map((item) => {
      return item.element();
    });
  };

  const set = (component, element) => {
    component.getSystem().getByDom(element).fold(Fun.noop, (item) => {
      Highlighting.highlight(component, item);
    });
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