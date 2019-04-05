import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Element } from '@ephox/sugar';
import { NativeSimulatedEvent } from '../../events/SimulatedEvent';
import { DragnDropImageClone } from './ImageClone';
import { DropEvent } from './DropEvent';
import { Option } from '@ephox/katamari';
import { DomModification } from 'ephox/alloy/dom/DomModification';

export interface DragnDropBehaviour extends Behaviour.AlloyBehaviour<DragnDropConfigSpec, DragnDropConfig> {
  config: (config: DragnDropConfigSpec) => Behaviour.NamedConfiguredBehaviour<DragnDropConfigSpec, DragnDropConfig>;
}

export type DragnDropConfig = DragStartingConfig | DroppingConfig;

export interface StartingDragndropConfigSpec {
  mode: 'drag',
  type?: string;
  phoneyTypes?: string[];
  effectAllowed?: string;
  getData?: (component: AlloyComponent) => string;
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
  getData: (component: AlloyComponent) => string;
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
      dragover: any;
      dragend: any;
      dragstart: any;
    };
  };
}

export interface DropDragndropConfigSpec {
  mode: 'drop',
  type?: string;
  dropEffect?: string;
  onDrop?: (component: AlloyComponent, simulatedEvent: DropEvent) => void;
  onDrag?: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragover?: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragenter?: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragleave?: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
}

export interface DroppingConfig {
  type: string;
  dropEffect: string;
  onDrop: (component: AlloyComponent, simulatedEvent: DropEvent) => void;
  onDrag: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragover: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragenter: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragleave: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  instance: {
    exhibit: () => any;
    handlers: (dragInfo: DroppingConfig) => {
      dragover: any;
      dragleave: any;
      drag: any;
      dragenter: any;
      drop: any;
    };
  };
}

export type DragnDropConfigSpec = StartingDragndropConfigSpec | DropDragndropConfigSpec;

