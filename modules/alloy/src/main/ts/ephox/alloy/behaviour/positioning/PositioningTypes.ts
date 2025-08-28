import { Optional } from '@ephox/katamari';

import { Bounds } from '../../alien/Boxes';
import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { PlacerResult } from '../../positioning/layout/LayoutTypes';
import { AnchorDetail, AnchorSpec } from '../../positioning/mode/Anchoring';
import { TransitionMode } from '../../positioning/view/Transitions';
import { BehaviourState } from '../common/BehaviourState';

interface TransitionSpec {
  readonly classes: string[];
  readonly mode?: TransitionMode;
}

interface TransitionDetail {
  readonly classes: string[];
  readonly mode: TransitionMode;
}

export interface PlacementSpec {
  readonly anchor: AnchorSpec;
  readonly transition?: TransitionSpec;
}

export interface PlacementDetail {
  readonly anchor: AnchorDetail<any>;
  readonly transition: Optional<TransitionDetail>;
}

export interface PositioningBehaviour extends Behaviour.AlloyBehaviour<PositioningConfigSpec, PositioningConfig> {
  readonly config: (config: PositioningConfigSpec) => Behaviour.NamedConfiguredBehaviour<PositioningConfigSpec, PositioningConfig>;
  readonly position: (component: AlloyComponent, placee: AlloyComponent, spec: PlacementSpec) => void;
  readonly positionWithinBounds: (component: AlloyComponent, placee: AlloyComponent, spec: PlacementSpec, optWithinBounds: Optional<Bounds>) => void;
  readonly getMode: (component: AlloyComponent) => string;
  readonly reset: (component: AlloyComponent, placee: AlloyComponent) => void;
}

export interface PositioningConfigSpec extends Behaviour.BehaviourConfigSpec {
  readonly useFixed?: () => boolean;
  readonly getBounds?: () => Bounds;
}

export interface PositioningConfig extends Behaviour.BehaviourConfigDetail {
  readonly useFixed: () => boolean;
  readonly getBounds: Optional<() => Bounds>;
}

export interface PositioningState extends BehaviourState {
  readonly clear: (id?: string) => void;
  readonly get: (id: string) => Optional<PlacerResult>;
  readonly set: (id: string, state: PlacerResult) => void;
}

