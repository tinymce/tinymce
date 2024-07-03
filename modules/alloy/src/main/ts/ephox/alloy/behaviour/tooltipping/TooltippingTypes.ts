import { Optional } from '@ephox/katamari';

import { AlloyBehaviour, BehaviourConfigDetail, BehaviourConfigSpec } from '../../api/behaviour/Behaviour';
import { LazySink } from '../../api/component/CommonTypes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { AnchorSpec } from '../../positioning/mode/Anchoring';
import { BehaviourState } from '../common/BehaviourState';

export interface TooltippingBehaviour extends AlloyBehaviour<TooltippingConfigSpec, TooltippingConfig> {
  hideAllExclusive: (comp: AlloyComponent) => void;
  setComponents: (comp: AlloyComponent, specs: AlloySpec[]) => void;
  setEnabled: (comp: AlloyComponent, enabled: boolean) => void;
  isEnabled: (comp: AlloyComponent) => boolean;
  immediateOpenClose: (comp: AlloyComponent, open: boolean) => void;
}

export interface TooltippingConfig extends BehaviourConfigDetail {
  lazySink: LazySink;
  tooltipDom: RawDomSchema;
  tooltipComponents: AlloySpec[];
  exclusive: boolean;
  mode: 'normal' | 'follow-highlight' | 'children-keyboard-focus' | 'children-normal';
  delayForShow: () => number;
  delayForHide: () => number;
  onSetup: (component: AlloyComponent) => void;
  anchor: (comp: AlloyComponent) => AnchorSpec;
  onShow: (comp: AlloyComponent, tooltip: AlloyComponent) => void;
  onHide: (comp: AlloyComponent, tooltip: AlloyComponent) => void;
}

export interface TooltippingConfigSpec extends BehaviourConfigSpec {
  lazySink: LazySink;
  tooltipDom: RawDomSchema;
  tooltipComponents?: AlloySpec[];
  exclusive?: boolean;
  mode?: 'normal' | 'follow-highlight' | 'children-keyboard-focus' | 'children-normal';
  delayForShow?: () => number;
  delayForHide?: () => number;
  anchor?: (comp: AlloyComponent) => AnchorSpec;
  onShow?: (comp: AlloyComponent, tooltip: AlloyComponent) => void;
  onHide?: (comp: AlloyComponent, tooltip: AlloyComponent) => void;
  onSetup?: (component: AlloyComponent) => void;
}

export interface TooltippingState extends BehaviourState {
  getTooltip: () => Optional<AlloyComponent>;
  setTooltip: (popup: AlloyComponent) => void;
  clearTooltip: () => void;
  clearTimer: () => void;
  resetTimer: (f: () => void, delay: number) => void;
  isShowing: () => boolean;
  isEnabled: () => boolean;
  setEnabled: (enabled: boolean) => void;
}
