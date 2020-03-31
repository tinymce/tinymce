import { Class, Element } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { Stateless } from '../../behaviour/common/BehaviourState';
import { SwappingConfig } from './SwappingTypes';

const swap = (element: Element, addCls: string, removeCls: string) => {
  Class.remove(element, removeCls);
  Class.add(element, addCls);
};

const toAlpha = (component: AlloyComponent, swapConfig: SwappingConfig, _swapState: Stateless) => {
  swap(component.element(), swapConfig.alpha, swapConfig.omega);
};

const toOmega = (component: AlloyComponent, swapConfig: SwappingConfig, _swapState: Stateless) => {
  swap(component.element(), swapConfig.omega, swapConfig.alpha);
};

const clear = (component: AlloyComponent, swapConfig: SwappingConfig, _swapState: Stateless) => {
  Class.remove(component.element(), swapConfig.alpha);
  Class.remove(component.element(), swapConfig.omega);
};

const isAlpha = (component: AlloyComponent, swapConfig: SwappingConfig, _swapState: Stateless) => Class.has(component.element(), swapConfig.alpha);

const isOmega = (component: AlloyComponent, swapConfig: SwappingConfig, _swapState: Stateless) => Class.has(component.element(), swapConfig.omega);

export {
  toAlpha,
  toOmega,
  isAlpha,
  isOmega,
  clear
};
