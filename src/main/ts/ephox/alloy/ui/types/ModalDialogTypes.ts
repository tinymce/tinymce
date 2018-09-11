import { Option, Result } from '@ephox/katamari';

import { Element } from '@ephox/sugar';
import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';
import { NativeSimulatedEvent } from '../../events/SimulatedEvent';

export interface ModalDialogDetail extends CompositeSketchDetail {
  uid: () => string;
  dom: () => RawDomSchema;
  components: () => AlloySpec[ ];
  modalBehaviours: () => SketchBehaviours;
  eventOrder: () => Record<string, string[]>;

  // FIX: Keying.cyclic
  onExecute: () => (comp: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Option<boolean>;
  onEscape: () => (comp: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Option<boolean>;
  useTabstopAt: () => (elem: Element) => boolean;

  lazySink: () => () => Result<AlloyComponent, Error>;
  dragBlockClass: () => Option<string>;
}

export interface ModalDialogSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  modalBehaviours?: AlloyBehaviourRecord;
  eventOrder?: Record<string, string[]>;

  lazySink?: () => Result<AlloyComponent, Error>;
  useTabstopAt?: (comp: Element) => boolean;
  onExecute?: (comp: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Option<boolean>;
  onEscape?: (comp: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Option<boolean>;
  dragBlockClass?: string;

  parts: {
    blocker: {
      dom?: Partial<RawDomSchema>;
    }
  };
}

export type GetBusySpec = (
  dlg: AlloyComponent,
  busyBehaviours: AlloyBehaviourRecord
) => AlloySpec;

export interface ModalDialogSketcher extends CompositeSketch<ModalDialogSpec, ModalDialogDetail> {
  show: (dialog: AlloyComponent) => void;
  hide: (dialog: AlloyComponent) => void;
  getBody: (dialog: AlloyComponent) => AlloyComponent;
  getFooter: (dialog: AlloyComponent) => AlloyComponent;
  setBusy(
    dialog: AlloyComponent,
    getBusySpec: GetBusySpec
  );
  setIdle(dialog: AlloyComponent);
}