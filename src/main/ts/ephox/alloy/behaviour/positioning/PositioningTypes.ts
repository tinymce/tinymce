import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option } from '@ephox/katamari';
import { Element } from '@ephox/dom-globals';


export interface PositioningBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: PositioningConfigSpec) => Behaviour.NamedConfiguredBehaviour;
  position: <T>(component: AlloyComponent, anchor: AnchorPositioningConfig<T>, placee: AlloyComponent) => void;
  getMode: (component: AlloyComponent) => any;
}

export type PositioningBounds = { };

export interface PositioningConfigSpec {
  useFixed?: boolean;
  bounds?: PositioningBounds
}

export interface PositioningConfig {
  useFixed: () => boolean;
  bounds: () => Option<PositioningBounds> // TODO: Strengthen types
};

export interface AnchorPositioningConfig <T> {
  anchor: string;
  item?: AlloyComponent;  // TODO: Option type, {} empty works with Obj or change the scheme
  bubble?: Option<T>;     // This is correctly implemented, bubble? value is Option<T>
  root?: Element;         // TODO: Option type
  hotspot?: AlloyComponent;
}