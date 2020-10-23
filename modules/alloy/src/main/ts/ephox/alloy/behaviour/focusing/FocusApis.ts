import { Focus } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { FocusingConfig } from './FocusingTypes';

const focus = (component: AlloyComponent, focusConfig: FocusingConfig): void => {
  if (!focusConfig.ignore) {
    Focus.focus(component.element);
    focusConfig.onFocus(component);
  }
};

const blur = (component: AlloyComponent, focusConfig: FocusingConfig): void => {
  if (!focusConfig.ignore) {
    Focus.blur(component.element);
  }
};

const isFocused = (component: AlloyComponent): boolean => Focus.hasFocus(component.element);

export {
  focus,
  blur,
  isFocused
};
