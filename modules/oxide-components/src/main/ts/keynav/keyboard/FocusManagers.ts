import { Optional } from '@ephox/katamari';
import { Focus, SugarElement } from '@ephox/sugar';

export interface FocusManager {
  get: (component: SugarElement<HTMLElement>) => Optional<SugarElement<HTMLElement>>;
  set: (component: SugarElement<HTMLElement>, focusee: SugarElement<HTMLElement>) => void;
}

const dom = (): FocusManager => {
  const get = (component: SugarElement<HTMLElement>) => Focus.search(component);

  const set = (_component: SugarElement<HTMLElement>, focusee: SugarElement<HTMLElement>) => {
    focusee.dom.focus();
  };

  return {
    get,
    set
  };
};

export {
  dom
};
