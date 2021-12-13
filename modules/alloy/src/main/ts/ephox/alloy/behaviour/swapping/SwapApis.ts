import { Class, SugarElement } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { Stateless } from '../common/BehaviourState';
import { SwappingConfig } from './SwappingTypes';

const swap = (element: SugarElement<Element>, addCls: string, removeCls: string): void => {
  Class.remove(element, removeCls);
  Class.add(element, addCls);
};

const toAlpha = (component: AlloyComponent, swapConfig: SwappingConfig, _swapState: Stateless): void => {
  swap(component.element, swapConfig.alpha, swapConfig.omega);
};

const toOmega = (component: AlloyComponent, swapConfig: SwappingConfig, _swapState: Stateless): void => {
  swap(component.element, swapConfig.omega, swapConfig.alpha);
};

const clear = (component: AlloyComponent, swapConfig: SwappingConfig, _swapState: Stateless): void => {
  Class.remove(component.element, swapConfig.alpha);
  Class.remove(component.element, swapConfig.omega);
};

const isAlpha = (component: AlloyComponent, swapConfig: SwappingConfig, _swapState: Stateless): boolean =>
  Class.has(component.element, swapConfig.alpha);

const isOmega = (component: AlloyComponent, swapConfig: SwappingConfig, _swapState: Stateless): boolean =>
  Class.has(component.element, swapConfig.omega);

export {
  toAlpha,
  toOmega,
  isAlpha,
  isOmega,
  clear
};
