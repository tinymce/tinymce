import { AlloyComponent, MementoRecord, Representing } from '@ephox/alloy';
import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Fun, Optional } from '@ephox/katamari';
import { Html, SugarElement, Value } from '@ephox/sugar';

const processors = StructureSchema.objOf([
  FieldSchema.defaulted('preprocess', Fun.identity),
  FieldSchema.defaulted('postprocess', Fun.identity)
]);

const memento = (mem: MementoRecord, rawProcessors) => {
  const ps = StructureSchema.asRawOrDie('RepresentingConfigs.memento processors', processors, rawProcessors);
  return Representing.config({
    store: {
      mode: 'manual',
      getValue: (comp) => {
        const other = mem.get(comp);
        const rawValue = Representing.getValue(other);
        return ps.postprocess(rawValue);
      },
      setValue: (comp, rawValue) => {
        const newValue = ps.preprocess(rawValue);
        const other = mem.get(comp);
        Representing.setValue(other, newValue);
      }
    }
  });
};

const withComp = <D, I = D>(optInitialValue: Optional<I>, getter: (c: AlloyComponent) => D, setter: (c: AlloyComponent, v: I) => void) => Representing.config({
  store: {
    mode: 'manual' as 'manual',
    ...optInitialValue.map((initialValue) => ({ initialValue })).getOr({}),
    getValue: getter,
    setValue: setter
  }
});

const withElement = <D, I = D>(initialValue: Optional<I>, getter: (elem: SugarElement) => D, setter: (elem: SugarElement, v: I) => void) => withComp<D, I>(
  initialValue,
  (c) => getter(c.element),
  (c, v) => setter(c.element, v)
);

const domValue = (optInitialValue: Optional<string>) => withElement(optInitialValue, Value.get, Value.set);

const domHtml = (optInitialValue: Optional<string>) => withElement(optInitialValue, Html.get, Html.set);

const memory = (initialValue) => Representing.config({
  store: {
    mode: 'memory',
    initialValue
  }
});

export const RepresentingConfigs = {
  memento,
  withElement,
  withComp,
  domValue,
  domHtml,
  memory
};
