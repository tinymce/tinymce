import { SugarElement } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { SlidingConfig } from './SlidingTypes';

export const getAnimationRoot = (component: AlloyComponent, slideConfig: SlidingConfig): SugarElement<Element> =>
  slideConfig.getAnimationRoot.fold(
    () => component.element,
    (get) => get(component)
  );
