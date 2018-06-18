import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option } from '@ephox/katamari';
import { Bounds } from 'ephox/alloy/alien/Boxes';
import { Element } from '@ephox/dom-globals';


export interface PositioningBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: PositioningConfigSpec) => Behaviour.NamedConfiguredBehaviour;
  position: <T>(component: AlloyComponent, anchor: AnchorPositioningConfig<T>, placee: AlloyComponent) => void;
  // TYPIFY
  getMode: (component: AlloyComponent) => any;
}

export interface PositioningConfigSpec {
  useFixed?: boolean;
  bounds?: Bounds
}

export interface PositioningConfig {
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