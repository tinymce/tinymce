import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import { DomDefinitionDetail } from '../../dom/DomDefinition';
import { DomModification } from '../../dom/DomModification';
import { EventFormat, NativeSimulatedEvent } from '../../events/SimulatedEvent';
import { DropEvent } from './DropEvent';
import { DragnDropImageClone } from './ImageClone';

export interface DragnDropBehaviour extends Behaviour.AlloyBehaviour<DragnDropConfigSpec, DragnDropConfig> {
  config: (config: DragnDropConfigSpec) => Behaviour.NamedConfiguredBehaviour<DragnDropConfigSpec, DragnDropConfig>;
}

export type DragnDropConfig = DragStartingConfig | DroppingConfig;

export interface StartingDragndropConfigSpec {
  mode: 'drag';
  type?: string;
  phoneyTypes?: string[];
  effectAllowed?: string;
  getData?: (component: AlloyComponent) => string;
  getImageParent?: (component: AlloyComponent) => SugarElement<Element>;
  getImage?: (component: AlloyComponent) => DragnDropImageClone;
  canDrag?: (component: AlloyComponent, target: SugarElement<Node>) => boolean;
  onDragstart?: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent<DragEvent>) => void;
  onDragover?: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent<DragEvent>) => void;
  onDragend?: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent<DragEvent>) => void;
}

export interface DragStartingConfig {
  type: string;
  phoneyTypes: string[];
  effectAllowed: DataTransfer['effectAllowed'];
  getData: Optional<(component: AlloyComponent) => string>;
  getImageParent: Optional<(component: AlloyComponent) => SugarElement<Element>>;
  getImage: Optional<(component: AlloyComponent) => DragnDropImageClone>;
  canDrag: (component: AlloyComponent, target: SugarElement<Node>) => boolean;
  onDragstart: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent<DragEvent>) => void;
  onDragover: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent<DragEvent>) => void;
  onDragend: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent<DragEvent>) => void;
  instance: {
    exhibit: (base: DomDefinitionDetail, dragInfo: DragStartingConfig) => DomModification;
    handlers: (dragInfo: DragStartingConfig) => {
      dragover: AlloyEvents.AlloyEventHandler<EventFormat>;
      dragend: AlloyEvents.AlloyEventHandler<EventFormat>;
      dragstart: AlloyEvents.AlloyEventHandler<EventFormat>;
    };
  };
}

export interface DropDragndropConfigSpec {
  mode: 'drop';
  type?: string;
  dropEffect?: string;
  onDrop?: (component: AlloyComponent, dropEvent: DropEvent) => void;
  onDrag?: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragover?: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragenter?: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragleave?: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
}

export interface DroppingConfig {
  type: string;
  dropEffect: DataTransfer['dropEffect'];
  onDrop: (component: AlloyComponent, dropEvent: DropEvent) => void;
  onDrag: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragover: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragenter: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragleave: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  instance: {
    exhibit: (base: DomDefinitionDetail, dragInfo: DragStartingConfig) => DomModification;
    handlers: (dragInfo: DroppingConfig) => {
      dragover: AlloyEvents.AlloyEventHandler<EventFormat>;
      dragleave: AlloyEvents.AlloyEventHandler<EventFormat>;
      drag: AlloyEvents.AlloyEventHandler<EventFormat>;
      dragenter: AlloyEvents.AlloyEventHandler<EventFormat>;
      drop: AlloyEvents.AlloyEventHandler<EventFormat>;
    };
  };
}

export type DragnDropConfigSpec = StartingDragndropConfigSpec | DropDragndropConfigSpec;
