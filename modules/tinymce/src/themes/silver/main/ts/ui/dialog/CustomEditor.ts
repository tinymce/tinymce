import { AddEventsBehaviour, AlloyEvents, Behaviour, Memento, SimpleSpec } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Obj, Optional, Singleton } from '@ephox/katamari';

import Resource from 'tinymce/core/api/Resource';

import { ComposingConfigs } from '../alien/ComposingConfigs';
import * as RepresentingConfigs from '../alien/RepresentingConfigs';

type CustomEditorSpec = Dialog.CustomEditor;
type CustomEditorInitFn = Dialog.CustomEditorInitFn;

const isOldCustomEditor = (spec: CustomEditorSpec): spec is Dialog.CustomEditorOld =>
  Obj.has(spec as Dialog.CustomEditorOld, 'init');

export const renderCustomEditor = (spec: CustomEditorSpec): SimpleSpec => {
  const editorApi = Singleton.value<Dialog.CustomEditorInit>();

  const memReplaced = Memento.record({
    dom: {
      tag: spec.tag
    }
  });

  const initialValue = Singleton.value<string>();

  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-custom-editor' ]
    },
    behaviours: Behaviour.derive([
      AddEventsBehaviour.config('custom-editor-events', [
        AlloyEvents.runOnAttached((component) => {
          memReplaced.getOpt(component).each((ta) => {
            (isOldCustomEditor(spec)
              ? spec.init(ta.element.dom)
              : Resource.load(spec.scriptId, spec.scriptUrl).then(
                (init: CustomEditorInitFn) => init(ta.element.dom, spec.settings)
              )
            ).then((ea) => {
              initialValue.on((cvalue) => {
                ea.setValue(cvalue);
              });

              initialValue.clear();
              editorApi.set(ea);
            });
          });
        })
      ]),
      RepresentingConfigs.withComp(
        Optional.none(),
        () => editorApi.get().fold(
          () => initialValue.get().getOr(''),
          (ed) => ed.getValue()
        ),
        (component, value) => {
          editorApi.get().fold(
            () => initialValue.set(value),
            (ed) => ed.setValue(value)
          );
        }
      ),

      ComposingConfigs.self()
    ]),
    components: [ memReplaced.asSpec() ]
  };
};
