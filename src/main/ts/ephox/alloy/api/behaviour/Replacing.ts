import * as Behaviour from './Behaviour';
import * as ReplaceApis from '../../behaviour/replacing/ReplaceApis';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

export interface ReplacingBehaviour extends Behaviour.AlloyBehaviour {
  config: (ReplacingConfig) => { key: string, value: any };
  append?: (compontent: AlloyComponent, replaceConfig: {}) => void;
  prepend?: (compontent: AlloyComponent, replaceConfig: {}) => void;
  remove?: (compontent: AlloyComponent, replaceConfig: {}) => void;
  set?: (compontent: AlloyComponent, replaceConfig: {}) => void;
  contents?: (compontent: AlloyComponent, replaceConfig?: {}) => AlloyComponent[];
}

export interface ReplacingConfig extends Behaviour.AlloyBehaviourConfig {
  // Intentionally Blank
}

const Replacing: ReplacingBehaviour = Behaviour.create({
  fields: [ ],
  name: 'replacing',
  apis: ReplaceApis
});

export {
  Replacing
};