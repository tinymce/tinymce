import { AlloyComponent } from '@ephox/alloy';
import { Css } from '@ephox/sugar';

const forceInitialSize = (comp: AlloyComponent): void => Css.set(comp.element, 'width', Css.get(comp.element, 'width'));

export {
  forceInitialSize
};
