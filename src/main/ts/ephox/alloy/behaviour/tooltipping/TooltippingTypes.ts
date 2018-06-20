import { BehaviourConfigSpec, BehaviourConfigDetail } from "../../api/behaviour/Behaviour";
import { AlloyComponent } from "../../api/component/ComponentApi";
import { Result, Option } from "@ephox/katamari";
import * as Behaviour from '../../api/behaviour/Behaviour';
import { RawDomSchema } from "../../api/component/SpecTypes";
import { BehaviourState } from "ephox/alloy/api/Main";

export interface TooltippingBehaviour extends Behaviour.AlloyBehaviour<TooltippingConfigSpec, TooltippingConfig> {

}

export interface TooltippingConfig extends BehaviourConfigDetail {
  // Make consistent with other lazy sinks.
  lazySink: () => (comp: AlloyComponent) => Result<AlloyComponent, any>;
  tooltipDom: () => RawDomSchema;
  exclusive: () => boolean;
  delay: () => number;
}

export interface TooltippingConfigSpec extends BehaviourConfigSpec {
  // Make consistent with other lazy sinks.
  lazySink: (comp: AlloyComponent) => Result<AlloyComponent, any>;
  tooltipDom: RawDomSchema;
  exclusive?: boolean;
  delay?: number;
}

export interface TooltippingState extends BehaviourState {
  getTooltip: () => Option<AlloyComponent>;
  setTooltip: (popup: AlloyComponent) => void;
  clearTooltip: () => void;
  clearTimer: () => void;
  resetTimer: (f: Function, delay: number) => void;
  isShowing: () => boolean;
}