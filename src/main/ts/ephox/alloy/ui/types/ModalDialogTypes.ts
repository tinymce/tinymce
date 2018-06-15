import { Option, Result } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema, SketchSpec, LooseSpec } from '../../api/component/SpecTypes';
import { SingleSketch, CompositeSketchSpec, CompositeSketch, CompositeSketchDetail } from '../../api/ui/Sketcher';
import { NativeSimulatedEvent } from '../../events/SimulatedEvent';

export interface ModalDialogDetail extends CompositeSketchDetail {
  uid: () => string;
  // FIX: Completed DOM tpye.
  dom: () => any;
  components: () => AlloySpec[ ];
  modalBehaviours: () => SketchBehaviours;

  // FIX: Keying.cyclic
  onExecute: () => (comp: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Option<boolean>;
  onEscape: () => (comp: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Option<boolean>;
  useTabstopAt: () => (comp: AlloyComponent) => boolean;

  lazySink: () => () => Result<AlloyComponent, Error>;
  dragBlockClass: () => Option<string>;
}

export interface ModalDialogSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  modalBehaviours?: AlloyBehaviourRecord;

  lazySink?: () => Result<AlloyComponent, Error>;
  useTabstopAt?: (comp: AlloyComponent) => boolean;
  onExecute?: (comp: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Option<boolean>;
  onEscape?: (comp: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Option<boolean>;
  dragBlockClass?: string;

  parts: {
    blocker?: LooseSpec;
  }
}

export interface ModalDialogSketcher extends CompositeSketch<ModalDialogSpec, ModalDialogDetail> {
  show: (dialog: AlloyComponent) => void;
  hide: (dialog: AlloyComponent) => void;
  getBody: (dialog: AlloyComponent) => AlloyComponent;
}