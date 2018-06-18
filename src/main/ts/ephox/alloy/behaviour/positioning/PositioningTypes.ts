import { Option } from '@ephox/katamari';
import { Bounds } from 'ephox/alloy/alien/Boxes';
import { Element } from '@ephox/dom-globals';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { BehaviourConfigSpec, BehaviourConfigDetail } from '../../api/behaviour/Behaviour';


export interface PositioningBehaviour extends Behaviour.AlloyBehaviour<PositioningConfigSpec,PositioningConfig> {
  config: (config: PositioningConfigSpec) => Behaviour.NamedConfiguredBehaviour<PositioningConfigSpec, PositioningConfig>;
  position: <T>(component: AlloyComponent, anchor: AnchorPositioningConfig<T>, placee: AlloyComponent) => void;
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

export interface AnchorPositioningConfig <T> {
  anchor: string;
  item?: AlloyComponent;  // TODO: Option type, {} empty works with Obj or change the scheme
  bubble?: Option<T>;     // This is correctly implemented, bubble? value is Option<T>
  root?: Element;         // TODO: Option type
  hotspot?: AlloyComponent;
}