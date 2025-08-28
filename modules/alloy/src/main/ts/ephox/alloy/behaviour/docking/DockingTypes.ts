import { Optional } from '@ephox/katamari';

import { Bounds } from '../../alien/Boxes';
import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { BehaviourState } from '../common/BehaviourState';

export type DockingMode = 'top' | 'bottom';

export interface InitialDockingPosition {
  style: Record<string, string>;
  position: string;
  bounds: Bounds;
  location: 'top' | 'bottom';
}

export interface DockingBehaviour extends Behaviour.AlloyBehaviour<DockingConfigSpec, DockingConfig> {
  config: (config: DockingConfigSpec) => Behaviour.NamedConfiguredBehaviour<DockingConfigSpec, DockingConfig>;
  refresh: (component: AlloyComponent) => void;
  reset: (component: AlloyComponent) => void;
  isDocked: (component: AlloyComponent) => boolean;
  getModes: (component: AlloyComponent) => DockingMode[];
  setModes: (component: AlloyComponent, modes: DockingMode[]) => void;
  forceDockToTop: (component: AlloyComponent) => void;
  forceDockToBottom: (component: AlloyComponent) => void;
}

export interface DockingContext {
  fadeInClass: string;
  fadeOutClass: string;
  transitionClass: string;
  lazyContext: (component: AlloyComponent) => Optional<Bounds>;
  onShow: (component: AlloyComponent) => void;
  onShown: (component: AlloyComponent) => void;
  onHide: (component: AlloyComponent) => void;
  onHidden: (component: AlloyComponent) => void;
}

export interface DockingViewport {
  readonly bounds: Bounds;
  readonly optScrollEnv: Optional<{
    readonly currentScrollTop: number;
    readonly scrollElmTop: number;
  }>;
}

export interface DockToTopDecision {
  location: 'top';
  leftX: number;
  topY: number;
}

export interface DockToBottomDecision {
  location: 'bottom';
  leftX: number;
  bottomY: number;
}

export interface NoDockDecision {
  location: 'no-dock';
}

export type DockingDecision = DockToTopDecision | DockToBottomDecision | NoDockDecision;

export interface DockingConfig extends Behaviour.BehaviourConfigDetail {
  contextual: Optional<DockingContext>;
  lazyViewport: (component: AlloyComponent) => DockingViewport;
  modes: DockingMode[];
  onDocked: (component: AlloyComponent) => void;
  onUndocked: (component: AlloyComponent) => void;
}

export interface DockingState extends BehaviourState {
  isDocked: () => boolean;
  setDocked: (docked: boolean) => void;
  getInitialPos: () => Optional<InitialDockingPosition>;
  setInitialPos: (bounds: InitialDockingPosition) => void;
  clearInitialPos: () => void;
  isVisible: () => boolean;
  setVisible: (visible: boolean) => void;
  getModes: () => DockingMode[];
  setModes: (modes: DockingMode[]) => void;
}

export interface DockingConfigSpec extends Behaviour.BehaviourConfigSpec {
  contextual?: {
    fadeInClass: string;
    fadeOutClass: string;
    transitionClass: string;
    lazyContext: (component: AlloyComponent) => Optional<Bounds>;
    onShow?: (component: AlloyComponent) => void;
    onShown?: (component: AlloyComponent) => void;
    onHide?: (component: AlloyComponent) => void;
    onHidden?: (component: AlloyComponent) => void;
  };
  lazyViewport?: (component: AlloyComponent) => DockingViewport;
  modes?: DockingMode[];
  onDocked?: (comp: AlloyComponent) => void;
  onUndocked?: (comp: AlloyComponent) => void;
}
