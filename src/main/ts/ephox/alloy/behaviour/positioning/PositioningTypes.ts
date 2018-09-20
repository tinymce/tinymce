import { Option } from '@ephox/katamari';
import { Bounds } from '../../alien/Boxes';
import { Element } from '@ephox/dom-globals';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';

import { AnchorSpec } from '../../positioning/mode/Anchoring';
import { Stateless } from '../../behaviour/common/BehaviourState';

export interface PositioningBehaviour extends Behaviour.AlloyBehaviour<PositioningConfigSpec, PositioningConfig> {
  config: (config: PositioningConfigSpec) => Behaviour.NamedConfiguredBehaviour<PositioningConfigSpec, PositioningConfig>;
  position: (component: AlloyComponent, anchor: AnchorSpec, placee: AlloyComponent) => void;
  getMode: (component: AlloyComponent) => string;
}

export interface PositioningConfigSpec extends Behaviour.BehaviourConfigSpec {
  useFixed?: boolean;
  getBounds?: () => Bounds;
}

export interface PositioningConfig extends Behaviour.BehaviourConfigDetail {
  useFixed: () => boolean;
  getBounds: () => Option<() => Bounds>; // TODO: Strengthen types
}
