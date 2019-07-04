/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AddEventsBehaviour, AlloyEvents, Behaviour, Memento, Representing, SimpleSpec } from '@ephox/alloy';
import { Cell, Option } from '@ephox/katamari';

import { ComposingConfigs } from '../alien/ComposingConfigs';
import { Omit } from '../Omit';
import { Types } from '@ephox/bridge';

type CustomEditorSpec = Omit<Types.CustomEditor.CustomEditor, 'type'>;

export const renderCustomEditor = (spec: CustomEditorSpec): SimpleSpec => {
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
      classes: [ 'tox-custom-editor' ]
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