import * as Behaviour from './Behaviour';
import * as ActivePosition from '../../behaviour/positioning/ActivePosition';
import * as PositionApis from '../../behaviour/positioning/PositionApis';
import PositionSchema from '../../behaviour/positioning/PositionSchema';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { Option } from '@ephox/boulder/node_modules/@ephox/katamari';

export interface PositioningBehaviour extends Behaviour.AlloyBehaviour {
  config: (PositioningConfig) => { key: string, value: any };
  position?: <T>(component: AlloyComponent, anchor: AnchorPositioningConfig<T>, placee: AlloyComponent) => void;
  getMode?: (component: AlloyComponent) => any;
}

export interface PositioningConfig extends Behaviour.AlloyBehaviourConfig {
  useFixed: boolean;
}

export interface AnchorPositioningConfig <T> {
  anchor: string;
  item?: AlloyComponent;
  bubble?: Option<T>;
  root?: Element;
  hotspot?: AlloyComponent;
}

const Positioning: PositioningBehaviour = Behaviour.create({
  fields: PositionSchema,
  name: 'positioning',
  active: ActivePosition,
  apis: PositionApis
});

export {
  Positioning
};