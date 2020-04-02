import { Option } from '@ephox/katamari';

import { AlloyBehaviour, BehaviourConfigDetail, BehaviourConfigSpec } from '../../api/behaviour/Behaviour';
import { LazySink } from '../../api/component/CommonTypes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { BehaviourState } from '../../behaviour/common/BehaviourState';
import { AnchorSpec } from '../../positioning/mode/Anchoring';

export interface TooltippingBehaviour extends AlloyBehaviour<TooltippingConfigSpec, TooltippingConfig> {
  hideAllExclusive: (comp: AlloyComponent) => void;
  setComponents: (comp: AlloyComponent, specs: AlloySpec[]) => void;
}

export interface TooltippingConfig extends BehaviourConfigDetail {
  lazySink: LazySink;
  tooltipDom: RawDomSchema;
  tooltipComponents: AlloySpec[];
  exclusive: boolean;
  mode: 'normal' | 'follow-highlight';
  delay: number;
  anchor: (comp: AlloyComponent) => AnchorSpec;
  onShow: (comp: AlloyComponent, tooltip: AlloyComponent) => void;
  onHide: (comp: AlloyComponent, tooltip: AlloyComponent) => void;
}

export interface TooltippingConfigSpec extends BehaviourConfigSpec {
  lazySink: LazySink;
  tooltipDom: RawDomSchema;
  tooltipComponents?: AlloySpec[];
  exclusive?: boolean;
  mode?: 'normal' | 'follow-highlight';
  delay?: number;
  anchor?: (comp: AlloyComponent) => AnchorSpec;
  onShow?: (comp: AlloyComponent, tooltip: AlloyComponent) => void;
  onHide?: (comp: AlloyComponent, tooltip: AlloyComponent) => void;
}

export interface TooltippingState extends BehaviourState {
  getTooltip: () => Option<AlloyComponent>;
  setTooltip: (popup: AlloyComponent) => void;
  clearTooltip: () => void;
  clearTimer: () => void;
  resetTimer: (f: () => any, delay: number) => void;
  isShowing: () => boolean;
}
