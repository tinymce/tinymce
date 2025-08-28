import { Optional } from '@ephox/katamari';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';

export interface HighlightingBehaviour extends Behaviour.AlloyBehaviour<HighlightingConfigSpec, HighlightingConfig> {
  config: (config: HighlightingConfigSpec) => Behaviour.NamedConfiguredBehaviour<HighlightingConfigSpec, HighlightingConfig>;
  dehighlightAll: (component: AlloyComponent) => void;
  dehighlight: (component: AlloyComponent, target: AlloyComponent) => void;
  highlight: (component: AlloyComponent, target: AlloyComponent) => void;
  highlightFirst: (component: AlloyComponent) => void;
  highlightLast: (component: AlloyComponent) => void;
  highlightAt: (component: AlloyComponent, index: number) => void;
  highlightBy: (component: AlloyComponent, predicate: (comp: AlloyComponent) => boolean) => void;
  isHighlighted: (component: AlloyComponent, queryTarget: any ) => boolean;
  getHighlighted: (component: AlloyComponent) => Optional<AlloyComponent>;
  getFirst: (component: AlloyComponent) => Optional<AlloyComponent>;
  getLast: (component: AlloyComponent) => Optional<AlloyComponent>;
  getPrevious: (component: AlloyComponent) => Optional<AlloyComponent>;
  getNext: (component: AlloyComponent) => Optional<AlloyComponent>;
  getCandidates: (component: AlloyComponent) => AlloyComponent[];
}

export interface HighlightingConfigSpec extends Behaviour.BehaviourConfigSpec {
  itemClass: string;
  highlightClass: string;
  onHighlight?: (comp: AlloyComponent, target: AlloyComponent) => void;
  onDehighlight?: (comp: AlloyComponent, target: AlloyComponent) => void;
}

export interface HighlightingConfig extends Behaviour.BehaviourConfigDetail {
  itemClass: string;
  highlightClass: string;
  onHighlight: (comp: AlloyComponent, target: AlloyComponent) => void;
  onDehighlight: (comp: AlloyComponent, target: AlloyComponent) => void;
}
