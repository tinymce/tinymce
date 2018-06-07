import { Focus } from '@ephox/sugar';
import { FocusingConfig } from '../../behaviour/focusing/FocusingTypes';
import { AlloyComponent } from '../../api/component/ComponentApi';

const focus = function (component: AlloyComponent, focusConfig: FocusingConfig): void {
  if (! focusConfig.ignore()) {
    Focus.focus(component.element());
    focusConfig.onFocus()(component);
  }
};

const blur = function (component: AlloyComponent, focusConfig: FocusingConfig): void {
  if (! focusConfig.ignore()) {
    Focus.blur(component.element());
  }
};

const isFocused = function (component: AlloyComponent): boolean {
  return Focus.hasFocus(component.element());
};

export {
  focus,
  blur,
  isFocused
};