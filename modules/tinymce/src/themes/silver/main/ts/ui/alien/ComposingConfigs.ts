import { AlloyComponent, Composing, MementoRecord } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';
import { Traverse } from '@ephox/sugar';

type ComposingBehaviour = ReturnType<typeof Composing['config']>;

// TODO: Move this to alloy if the concept works out
const self = (): ComposingBehaviour => Composing.config({
  find: Optional.some
});

const memento = (mem: MementoRecord): ComposingBehaviour => Composing.config({
  find: mem.getOpt
});

const childAt = (index: number): ComposingBehaviour => Composing.config({
  find: (comp: AlloyComponent) => Traverse.child(comp.element, index)
    .bind((element) => comp.getSystem().getByDom(element).toOptional())
});

export const ComposingConfigs = {
  self,
  memento,
  childAt
};
