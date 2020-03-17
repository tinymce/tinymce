import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { Bounds } from '../../alien/Boxes';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { LazySink } from '../../api/component/CommonTypes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';
import { NativeSimulatedEvent } from '../../events/SimulatedEvent';

export interface ModalDialogDetail extends CompositeSketchDetail {
  uid: string;
  dom: RawDomSchema;
  components: AlloySpec[ ];
  modalBehaviours: SketchBehaviours;
  eventOrder: Record<string, string[]>;

  onExecute: (comp: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Option<boolean>;
  onEscape: (comp: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Option<boolean>;
  useTabstopAt: (elem: Element) => boolean;

  lazySink: LazySink;
  dragBlockClass: Option<string>;
  getDragBounds: () => Bounds;
}

export interface ModalDialogSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  modalBehaviours?: AlloyBehaviourRecord;
  eventOrder?: Record<string, string[]>;

  lazySink?: LazySink;
  useTabstopAt?: (comp: Element) => boolean;
  onExecute?: (comp: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Option<boolean>;
  onEscape?: (comp: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Option<boolean>;
  dragBlockClass?: string;
  getDragBounds?: () => Bounds;

  parts: {
    blocker: {
      dom?: Partial<RawDomSchema>;
      components?: AlloySpec[];
    };
  };
}

export type GetBusySpec = (
  dlg: AlloyComponent,
  busyBehaviours: AlloyBehaviourRecord
) => AlloySpec;

export interface ModalDialogApis {
  show: (dialog: AlloyComponent) => void;
  hide: (dialog: AlloyComponent) => void;
  getBody: (dialog: AlloyComponent) => AlloyComponent;
  getFooter: (dialog: AlloyComponent) => AlloyComponent;
  setBusy: (dialog: AlloyComponent, getBusySpec: GetBusySpec) => void;
  setIdle: (dialog: AlloyComponent) => void;
}

export interface ModalDialogSketcher extends CompositeSketch<ModalDialogSpec>, ModalDialogApis { }
