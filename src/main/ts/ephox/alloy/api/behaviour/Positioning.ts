import * as Behaviour from './Behaviour';
import * as ActivePosition from '../../behaviour/positioning/ActivePosition';
import * as PositionApis from '../../behaviour/positioning/PositionApis';
import PositionSchema from '../../behaviour/positioning/PositionSchema';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option } from '@ephox/katamari';

export interface PositioningBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: PositioningConfig) => { [key: string]: (any) => any };
  position: <T>(component: AlloyComponent, anchor: AnchorPositioningConfig<T>, placee: AlloyComponent) => void;
  getMode: (component: AlloyComponent) => any;
}

export interface PositioningConfig {
  useFixed: boolean;
}

export interface AnchorPositioningConfig <T> {
  anchor: string;
  item?: AlloyComponent;  // TODO: Option type, {} empty works with Obj or change the scheme
  bubble?: Option<T>;     // This is correctly implemented, bubble? value is Option<T>
  root?: Element;         // TODO: Option type
  hotspot?: AlloyComponent;
}

const Positioning = Behaviour.create({
  fields: PositionSchema,
  name: 'positioning',
  active: ActivePosition,
  apis: PositionApis
}) as PositioningBehaviour;

export {
  Positioning
};