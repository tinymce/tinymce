import { AlloyComponent } from '../../api/component/ComponentApi';
import { SlidingConfig } from './SlidingTypes';

export const getAnimationRoot = (component: AlloyComponent, slideConfig: SlidingConfig) =>
  slideConfig.getAnimationRoot.fold(
    () => component.element(),
    (get) => get(component)
  );