import { Option } from '@ephox/katamari';
import { Bounds } from 'ephox/alloy/alien/Boxes';
import { Element } from '@ephox/dom-globals';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { BehaviourConfigSpec, BehaviourConfigDetail } from '../../api/behaviour/Behaviour';
import { AnchorSpec } from 'ephox/alloy/positioning/mode/Anchoring';
import { Stateless } from 'ephox/alloy/behaviour/common/BehaviourState';


export interface PositioningBehaviour extends Behaviour.AlloyBehaviour<PositioningConfigSpec,PositioningConfig> {
  config: (config: PositioningConfigSpec) => Behaviour.NamedConfiguredBehaviour<PositioningConfigSpec, PositioningConfig>;
  position: (component: AlloyComponent, anchor: AnchorSpec, placee: AlloyComponent) => void;
  getMode: (component: AlloyComponent) => string;
}

export interface PositioningConfigSpec extends BehaviourConfigSpec {
  useFixed?: boolean;
  bounds?: Bounds
}

export interface PositioningConfig extends BehaviourConfigDetail {
  useFixed: () => boolean;
  bounds: () => Option<Bounds> // TODO: Strengthen types
};
