import { AddEventsBehaviour, AlloyEvents, Behaviour, Memento, Representing, SimpleSpec } from '@ephox/alloy';
import { Element } from '@ephox/dom-globals';
import { Cell, Option } from '@ephox/katamari';

import { ComposingConfigs } from '../alien/ComposingConfigs';

export interface CustomEditorFoo {
  tag: string;
  init: (e: Element) => Promise<{
    setValue(value: string): void,
    getValue(): string,
    destroy(): void
  }>;
}

export const renderCustomEditor = (spec: CustomEditorFoo): SimpleSpec => {
  const editorApi = Cell(Option.none());

  const memReplaced = Memento.record({
    dom: {
      tag: spec.tag
    }
  });

  const initialValue = Cell(Option.none());

  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-well', 'tox-well--no-padding' ]
    },
    behaviours: Behaviour.derive([
      AddEventsBehaviour.config('editor-foo-events', [
        AlloyEvents.runOnAttached((component) => {
          memReplaced.getOpt(component).each((ta) => {
            spec.init(ta.element().dom()).then((ea) => {
              initialValue.get().each((cvalue) => {
                ea.setValue(cvalue);
              });

              initialValue.set(Option.none());
              editorApi.set(Option.some(ea));
            });
          });
        })
      ]),
      Representing.config({
        store: {
          mode: 'manual',
          getValue: () => editorApi.get().fold(
            () => initialValue.get().getOr(''),
            (ed) => ed.getValue()
          ),
          setValue: (component, value) => {
            editorApi.get().fold(
              () => {
                initialValue.set(Option.some(value));
              },
              (ed) => ed.setValue(value)
            );
          }
        }
      }),

      ComposingConfigs.self()
    ]),
    components: [memReplaced.asSpec()]
  };
};