import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import { Bounds } from '../../alien/Boxes';
import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { AnchorSpec } from '../../positioning/mode/Anchoring';

export interface PositioningBehaviour extends Behaviour.AlloyBehaviour<PositioningConfigSpec, PositioningConfig> {
  config: (config: PositioningConfigSpec) => Behaviour.NamedConfiguredBehaviour<PositioningConfigSpec, PositioningConfig>;
  position: (component: AlloyComponent, anchor: AnchorSpec, placee: AlloyComponent) => void;
  positionWithin: (component: AlloyComponent, anchor: AnchorSpec, placee: AlloyComponent, boxElement: Optional<SugarElement>) => void;
  positionWithinBounds: (component: AlloyComponent, anchor: AnchorSpec, placee: AlloyComponent, bounds: Optional<Bounds>) => void;
  getMode: (component: AlloyComponent) => string;
}

export interface PositioningConfigSpec extends Behaviour.BehaviourConfigSpec {
  useFixed?: () => boolean;
  getBounds?: () => Bounds;
}

export interface PositioningConfig extends Behaviour.BehaviourConfigDetail {
  useFixed: () => boolean;
  getBounds: Optional<() => Bounds>; // TODO: Strengthen types
}
