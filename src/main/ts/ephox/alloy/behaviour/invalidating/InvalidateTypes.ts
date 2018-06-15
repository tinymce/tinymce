
import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option, Future, Result } from '@ephox/katamari';
import { SugarElement } from '../../alien/TypeDefinitions';

export interface InvalidatingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: InvalidatingConfigSpec) => Behaviour.NamedConfiguredBehaviour;
  markValid: (Component: AlloyComponent) => void;
  markInvalid: (Component: AlloyComponent) => void;
  query: <T>(Component: AlloyComponent) => Future<T>;
  run: <T>(Component: AlloyComponent) => Future<T>;
  validation: <T>(validate: (v: string) => Result<T, string>) => (component: AlloyComponent) => Future<Result<T, string>>;
}

export interface InvalidatingConfigSpec {
  invalidClass: string;
  getRoot?: (AlloyComponent) => Option<SugarElement>;
  notify?: {
    aria?: string;
    getContainer?: (input: AlloyComponent) => Option<SugarElement>;
    validHtml?: string;
    onValid?: (comp: AlloyComponent) => void;
    onInvalid?: (comp: AlloyComponent, err: string) => void;
    onValidate?: (comp: AlloyComponent) => void;
  }
  validator?: {
    validate: (input: AlloyComponent) => Future<Result<any, string>>;
    onEvent?: string;
    validateOnLoad?: boolean;
  }
}

export interface InvalidatingConfig {
  invalidClass: () => string;
  notify?: () => Option<{
    getContainer?: () => (input: AlloyComponent) => Option<SugarElement>;
    onValid?: () => (comp: AlloyComponent) => void;
    validHtml: () => string;
    onInvalid?: () => (comp: AlloyComponent, err: string) => void;
    onValidate: () => (comp: AlloyComponent) => void;
  }>;
  onEvent?: () => string;
  getRoot?: () => (AlloyComponent) => Option<SugarElement>
  validator: () => Option<{
    validate: () => (input: AlloyComponent) => Future<Result<any, string>>;
    onEvent?: () => string;
    validateOnLoad?: () => boolean
  }>;
}