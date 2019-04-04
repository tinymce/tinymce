import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Element } from '@ephox/sugar';
import { NativeSimulatedEvent } from '../../events/SimulatedEvent';
import { SugarEvent } from '../../alien/TypeDefinitions';
import { DragnDropImageClone } from './ImageClone';

export interface DragnDropBehaviour extends Behaviour.AlloyBehaviour<DragnDropConfigSpec, DragnDropConfig> {
  config: (config: DragnDropConfigSpec) => Behaviour.NamedConfiguredBehaviour<DragnDropConfigSpec, DragnDropConfig>;
}

export interface DragnDropConfig {
}

export interface StartingDragndropConfigSpec {
  mode: 'drag',
  type: string;
  getData: (component: AlloyComponent) => string;
  getImage?: (component: AlloyComponent) => DragnDropImageClone;
  imageParent?: Element;
  canDrag?: (component: AlloyComponent, target: Element) => boolean;
  onDragstart?: (component: AlloyComponent) => void;
  onDragover?: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragend?: (component: AlloyComponent) => void;
  phoneyTypes?: string[];
  dropEffect?: 'copy' | 'move' | 'link' | 'none';
}

export interface DropDragndropConfigSpec {
  mode: 'drop',
  type: string;
  onDrop?: (component: AlloyComponent, simulatedEvent: SugarEvent) => void;
  onDrag?: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragover?: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragenter?: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragleave?: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
}

export type DragnDropConfigSpec = StartingDragndropConfigSpec | DropDragndropConfigSpec;
