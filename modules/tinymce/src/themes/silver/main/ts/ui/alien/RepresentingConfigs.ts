/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { MementoRecord, Representing, AlloyComponent } from '@ephox/alloy';
import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Fun, Merger, Option } from '@ephox/katamari';
import { Element, Html, Value } from '@ephox/sugar';

const processors = ValueSchema.objOf([
  FieldSchema.defaulted('preprocess', Fun.identity),
  FieldSchema.defaulted('postprocess', Fun.identity)
]);

const memento = (mem: MementoRecord, rawProcessors) => {
  const ps = ValueSchema.asRawOrDie('RepresentingConfigs.memento processors', processors, rawProcessors);
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

const withComp = <D>(optInitialValue: Option<D>, getter: (c: AlloyComponent) => D, setter: (c: AlloyComponent, v: D) => void) => {
  return Representing.config(
    Merger.deepMerge(
      {
        store: {
          mode: 'manual',
          getValue: getter,
          setValue: setter
        }
      },
      optInitialValue.map((initialValue) => {
        return {
          store: {
            initialValue
          }
        };
      }).getOr({ } as any)
    )
  );
};

const withElement = <D>(initialValue: Option<D>, getter: (elem: Element) => D, setter: (elem: Element, v: D) => void) => {
  return withComp(
    initialValue,
    (c) => getter(c.element()),
    (c, v) => setter(c.element(), v)
  );
};

const domValue = (optInitialValue: Option<string>) => {
  return withElement(optInitialValue, Value.get, Value.set);
};

const domHtml = (optInitialValue: Option<string>) => {
  return withElement(optInitialValue, Html.get, Html.set);
};

const memory = <D>(initialValue) => {
  return Representing.config({
    store: {
      mode: 'memory',
      initialValue
    }
  });
};

export const RepresentingConfigs = {
  memento,
  withElement,
  withComp,
  domValue,
  domHtml,
  memory
};