import * as Behaviour from './Behaviour';
import * as ReplaceApis from '../../behaviour/replacing/ReplaceApis';
import { AlloyComponent } from '../../api/component/ComponentApi';

export interface ReplacingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: ReplacingConfig) => { [key: string]: (any) => any };
  append: (compontent: AlloyComponent, replaceConfig: {}) => void;
  prepend: (compontent: AlloyComponent, replaceConfig: {}) => void;
  remove: (compontent: AlloyComponent, replaceConfig: {}) => void;
  set: (compontent: AlloyComponent, replaceConfig: {}) => void;
  contents: (compontent: AlloyComponent, replaceConfig?: {}) => AlloyComponent[];
}

export interface ReplacingConfig {
  // Intentionally Blank
}

const Replacing = Behaviour.create({
  fields: [ ],
  name: 'replacing',
  apis: ReplaceApis
}) as ReplacingBehaviour;

export {
  Replacing
};