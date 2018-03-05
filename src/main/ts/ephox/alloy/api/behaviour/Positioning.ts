import * as Behaviour from './Behaviour';
import * as ActivePosition from '../../behaviour/positioning/ActivePosition';
import * as PositionApis from '../../behaviour/positioning/PositionApis';
import PositionSchema from '../../behaviour/positioning/PositionSchema';
import { AlloyComponent } from 'ephox/alloy/api/component/Component';
import { AlloyBehaviour, AlloyBehaviourConfig } from 'ephox/alloy/alien/TypeDefinitions';
import { Option } from '@ephox/boulder/node_modules/@ephox/katamari';

export interface PositioningBehaviour extends AlloyBehaviour {
  config: (PositioningConfig) => any;
  position?: <T>(component: AlloyComponent, anchor: AnchorPositioningConfig<T>, placee: AlloyComponent) => void;
  getMode?: (component: AlloyComponent) => any;
}

export interface PositioningConfig extends AlloyBehaviourConfig {
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