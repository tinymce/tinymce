import { Option } from '@ephox/katamari';

import { Bounds } from '../../alien/Boxes';
import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { BehaviourState } from '../common/BehaviourState';

export type DockingMode = 'top' | 'bottom';

export interface InitialDockingPosition {
  style: Record<string, string>;
  position: string;
  bounds: Bounds;
}

export interface DockingBehaviour extends Behaviour.AlloyBehaviour<DockingConfigSpec, DockingConfig> {
  config: (config: DockingConfigSpec) => Behaviour.NamedConfiguredBehaviour<DockingConfigSpec, DockingConfig>;
  refresh: (component: AlloyComponent) => void;
  reset: (component: AlloyComponent) => void;
  isDocked: (component: AlloyComponent) => boolean;
  getInitialPosition: (component: AlloyComponent) => Option<InitialDockingPosition>;
}

export interface DockingContext {
  fadeInClass: string;
  fadeOutClass: string;
  transitionClass: string;
  lazyContext: (component: AlloyComponent) => Option<Bounds>;
  onShow: (component: AlloyComponent) => void;
  onShown: (component: AlloyComponent) => void;
  onHide: (component: AlloyComponent) => void;
  onHidden: (component: AlloyComponent) => void;
}

export interface DockingConfig extends Behaviour.BehaviourConfigDetail {
  contextual: Option<DockingContext>;
  lazyViewport: (component?: AlloyComponent) => Bounds;
  modes: DockingMode[];
  onDocked: (component: AlloyComponent) => void;
  onUndocked: (component: AlloyComponent) => void;
}

export interface DockingState extends BehaviourState {
  isDocked: () => boolean;
  setDocked: (docked: boolean) => void;
  getInitialPosition: () => Option<InitialDockingPosition>;
  setInitialPosition: (bounds: Option<InitialDockingPosition>) => void;
  isVisible: () => boolean;
  setVisible: (visible: boolean) => void;
}

export interface DockingConfigSpec extends Behaviour.BehaviourConfigSpec {
  contextual?: {
    fadeInClass: string;
    fadeOutClass: string;
    transitionClass: string;
    lazyContext: (component: AlloyComponent) => Option<Bounds>;
    onShow?: (component: AlloyComponent) => void;
    onShown?: (component: AlloyComponent) => void;
    onHide?: (component: AlloyComponent) => void;
    onHidden?: (component: AlloyComponent) => void;
  };
  lazyViewport?: (component?: AlloyComponent) => Bounds;
  modes?: DockingMode[];
  onDocked?: (comp: AlloyComponent) => void;
  onUndocked?: (comp: AlloyComponent) => void;
}
