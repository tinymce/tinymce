import type { SugarElement } from '@ephox/sugar';

import type { AlloyComponent } from '../../api/component/ComponentApi';

import type { SlidingConfig } from './SlidingTypes';

export const getAnimationRoot = (component: AlloyComponent, slideConfig: SlidingConfig): SugarElement<Element> =>
  slideConfig.getAnimationRoot.fold(
    () => component.element,
    (get) => get(component)
  );
