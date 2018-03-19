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

const dom = function (): FocusDom {
  const get = function (component) {
    return Focus.search(component.element());
  };

  const set = function (component, focusee) {
    component.getSystem().triggerFocus(focusee, component.element());
  };

  return {
    get,
    set
  };
};

const highlights = function (): FocusHighlights {
  const get = function (component) {
    return Highlighting.getHighlighted(component).map(function (item) {
      return item.element();
    });
  };

  const set = function (component, element) {
    component.getSystem().getByDom(element).fold(Fun.noop, function (item) {
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