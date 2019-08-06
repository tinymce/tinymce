import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

import * as Behaviour from '../../api/behaviour/Behaviour';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { DomModification } from '../../dom/DomModification';
import { NativeSimulatedEvent, EventFormat } from '../../events/SimulatedEvent';
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
  getImageParent?: (component: AlloyComponent) => Element;
  getImage?: (component: AlloyComponent) => DragnDropImageClone;
  canDrag?: (component: AlloyComponent, target: Element) => boolean;
  onDragstart?: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragover?: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragend?: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
}

export interface DragStartingConfig {
  type: string;
  phoneyTypes: string[];
  effectAllowed: string;
  getData: Option<(component: AlloyComponent) => string>;
  getImageParent: Option<(component: AlloyComponent) => Element>;
  getImage: Option<(component: AlloyComponent) => {
    element: () => Element;
    x: () => number;
    y: () => number;
  }>;
  canDrag: (component: AlloyComponent, target: Element) => boolean;
  onDragstart: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragover: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragend: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  instance: {
    exhibit: () => DomModification;
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
  dropEffect: string;
  onDrop: (component: AlloyComponent, dropEvent: DropEvent) => void;
  onDrag: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragover: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragenter: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragleave: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  instance: {
    exhibit: () => DomModification;
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
