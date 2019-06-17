import { AlloyComponent } from '../../api/component/ComponentApi';
import { SlidingConfig } from './SlidingTypes';

export const getAnimationRoot = (component: AlloyComponent, slideConfig: SlidingConfig) => {
  return slideConfig.getAnimationRoot.fold(() => {
    return component.element();
  }, (get) => {
    return get(component);
  });
};