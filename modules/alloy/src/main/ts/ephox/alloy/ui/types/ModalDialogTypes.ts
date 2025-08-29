import type { Optional } from '@ephox/katamari';
import type { SugarElement } from '@ephox/sugar';

import type { Bounds } from '../../alien/Boxes';
import type { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import type { LazySink } from '../../api/component/CommonTypes';
import type { AlloyComponent } from '../../api/component/ComponentApi';
import type { SketchBehaviours } from '../../api/component/SketchBehaviours';
import type { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import type { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';
import type { NativeSimulatedEvent } from '../../events/SimulatedEvent';

export interface ModalDialogDetail extends CompositeSketchDetail {
  uid: string;
  dom: RawDomSchema;
  components: AlloySpec[ ];
  modalBehaviours: SketchBehaviours;
  eventOrder: Record<string, string[]>;

  onExecute: (comp: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Optional<boolean>;
  onEscape: (comp: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Optional<boolean>;
  useTabstopAt: (elem: SugarElement<HTMLElement>) => boolean;
  firstTabstop?: number;

  lazySink: LazySink;
  dragBlockClass: Optional<string>;
  getDragBounds: () => Bounds;
}

export interface ModalDialogSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  modalBehaviours?: AlloyBehaviourRecord;
  eventOrder?: Record<string, string[]>;

  lazySink?: LazySink;
  useTabstopAt?: (comp: SugarElement<HTMLElement>) => boolean;
  onExecute?: (comp: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Optional<boolean>;
  onEscape?: (comp: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Optional<boolean>;
  firstTabstop?: number;
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
  getFooter: (dialog: AlloyComponent) => Optional<AlloyComponent>;
  setBusy: (dialog: AlloyComponent, getBusySpec: GetBusySpec) => void;
  setIdle: (dialog: AlloyComponent) => void;
}

export interface ModalDialogSketcher extends CompositeSketch<ModalDialogSpec>, ModalDialogApis { }
