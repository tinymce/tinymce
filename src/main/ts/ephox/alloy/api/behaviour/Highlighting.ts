import * as Behaviour from './Behaviour';
import * as HighlightApis from '../../behaviour/highlighting/HighlightApis';
import HighlightSchema from '../../behaviour/highlighting/HighlightSchema';
import { AlloyBehaviour, AlloyBehaviourConfig, SugarElement } from 'ephox/alloy/alien/TypeDefinitions';
import { AlloyComponent } from 'ephox/alloy/api/component/Component';
import { Option } from '@ephox/katamari';

export interface HighlightingBehaviour extends AlloyBehaviour {
  config: (HighlightingConfig) => any;
  dehighlightAll?: (component: AlloyComponent) => void;
  dehighlight?: (component: AlloyComponent, target: AlloyComponent) => void;
  highlight?: (component: AlloyComponent, target: AlloyComponent) => void;
  highlightFirst?: (component: AlloyComponent) => void;
  highlightLast?: (component: AlloyComponent) => void;
  highlightAt?: (component: AlloyComponent, index: number) => void;
  highlightBy?: (component: AlloyComponent, predicate: (any) => any) => void;
  isHighlighted?: (component: AlloyComponent, queryTarget?: any ) => void;
  getHighlighted?: (component: AlloyComponent) => Option<AlloyComponent>;
  getFirst?: (component: AlloyComponent) => Option<AlloyComponent>;
  getLast?: (component: AlloyComponent) => Option<AlloyComponent>;
  getPrevious?: (component: AlloyComponent) => Option<AlloyComponent>;
  getNext?: (component: AlloyComponent) => Option<AlloyComponent>;
}

export interface HighlightingConfig extends AlloyBehaviourConfig {
  itemClass: string;
  highlightClass: string;
  onHighlight: () => (chooser, choice) => void;
  onDehighlight: () => (chooser, choice) => void;
}

const Highlighting: HighlightingBehaviour = Behaviour.create({
  fields: HighlightSchema,
  name: 'highlighting',
  apis: HighlightApis
});

export {
  Highlighting
};