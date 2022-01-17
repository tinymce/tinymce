import { Future, Optional, Result } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';

export interface InvalidatingBehaviour extends Behaviour.AlloyBehaviour<InvalidatingConfigSpec, InvalidatingConfig> {
  config: (config: InvalidatingConfigSpec) => Behaviour.NamedConfiguredBehaviour<InvalidatingConfigSpec, InvalidatingConfig>;
  markValid: (component: AlloyComponent) => void;
  isInvalid: (component: AlloyComponent) => boolean;
  markInvalid: (component: AlloyComponent, text: string) => void;
  query: (component: AlloyComponent) => Future<Result<any, string>>;
  run: (component: AlloyComponent) => Future<Result<any, string>>;
  validation: <T>(validate: (v: string) => Result<T, string>) => (component: AlloyComponent) => Future<Result<T, string>>;
}

export interface InvalidatingConfigSpec extends Behaviour.BehaviourConfigSpec {
  invalidClass: string;
  getRoot?: (comp: AlloyComponent) => Optional<SugarElement<Element>>;
  notify?: {
    aria?: string;
    getContainer?: (input: AlloyComponent) => Optional<SugarElement<Node>>;
    validHtml?: string;
    onValid?: (comp: AlloyComponent) => void;
    onInvalid?: (comp: AlloyComponent, err: string) => void;
    onValidate?: (comp: AlloyComponent) => void;
  };
  validator?: {
    validate: (input: AlloyComponent) => Future<Result<any, string>>;
    onEvent?: string;
    validateOnLoad?: boolean;
  };
}

export interface InvalidatingConfig extends Behaviour.BehaviourConfigDetail {
  invalidClass: string;
  notify: Optional<{
    aria: string;
    getContainer: (input: AlloyComponent) => Optional<SugarElement<Node>>;
    onValid: (comp: AlloyComponent) => void;
    validHtml: string;
    onInvalid: (comp: AlloyComponent, err: string) => void;
    onValidate: (comp: AlloyComponent) => void;
  }>;
  getRoot: (comp: AlloyComponent) => Optional<SugarElement<Element>>;
  validator: Optional<{
    validate: (input: AlloyComponent) => Future<Result<any, string>>;
    onEvent: string;
    validateOnLoad?: boolean;
  }>;
}
