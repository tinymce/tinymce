import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option } from '@ephox/katamari';
import { BehaviourConfigSpec, BehaviourConfigDetail } from '../../api/behaviour/Behaviour';


export interface HighlightingBehaviour extends Behaviour.AlloyBehaviour<HighlightingConfigSpec, HighlightingConfig> {
  config: (config: HighlightingConfigSpec) => Behaviour.NamedConfiguredBehaviour<HighlightingConfigSpec, HighlightingConfig>;
  dehighlightAll: (component: AlloyComponent) => void;
  dehighlight: (component: AlloyComponent, target: AlloyComponent) => void;
  highlight: (component: AlloyComponent, target: AlloyComponent) => void;
  highlightFirst: (component: AlloyComponent) => void;
  highlightLast: (component: AlloyComponent) => void;
  highlightAt: (component: AlloyComponent, index: number) => void;
  highlightBy: (component: AlloyComponent, predicate: (any) => any) => void;
  isHighlighted: (component: AlloyComponent, queryTarget: any ) => void;
  getHighlighted: (component: AlloyComponent) => Option<AlloyComponent>;
  getFirst: (component: AlloyComponent) => Option<AlloyComponent>;
  getLast: (component: AlloyComponent) => Option<AlloyComponent>;
  getPrevious: (component: AlloyComponent) => Option<AlloyComponent>;
  getNext: (component: AlloyComponent) => Option<AlloyComponent>;
}

export interface HighlightingConfigSpec extends BehaviourConfigSpec {
  itemClass: string;
  highlightClass: string;
  onHighlight?: (comp: AlloyComponent, target: AlloyComponent) => void;
  onDehighlight?: (comp: AlloyComponent, target: AlloyComponent) => void;
}

export interface HighlightingConfig extends BehaviourConfigDetail {
  itemClass: () => string;
  highlightClass: () => string;
  onHighlight: () => (comp: AlloyComponent, target: AlloyComponent) => void;
  onDehighlight: () => (comp: AlloyComponent, target: AlloyComponent) => void;
}