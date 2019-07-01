/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AddEventsBehaviour,
  AlloyEvents,
  AlloyTriggers,
  Behaviour,
  Button,
  Disabling,
  FormField as AlloyFormField,
  Memento,
  NativeEvents,
  Representing,
  SimpleSpec,
  SimulatedEvent,
  SugarEvent,
  SystemEvents,
  Tabstopping,
  Toggling,
  AlloyComponent
} from '@ephox/alloy';
import { Types } from '@ephox/bridge';
import { DragEvent, FileList } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { ComposingConfigs } from '../alien/ComposingConfigs';
import { renderFormFieldWith, renderLabel } from '../alien/FieldLabeller';
import { RepresentingConfigs } from '../alien/RepresentingConfigs';
import { formChangeEvent } from '../general/FormEvents';
import { Omit } from '../Omit';

const extensionsAccepted = '.jpg,.jpeg,.png,.gif';

const filterByExtension = function (files: FileList) {
  const re = new RegExp('(' + extensionsAccepted.split(/\s*,\s*/).join('|') + ')$', 'i');
  return Arr.filter(Arr.from(files), (file) => re.test(file.name));
};

type DropZoneSpec = Omit<Types.DropZone.DropZone, 'type'>;

export const renderDropZone = (spec: DropZoneSpec, providersBackstage: UiFactoryBackstageProviders): SimpleSpec => {

  // TODO: Consider moving to alloy
  const stopper: AlloyEvents.EventRunHandler<SugarEvent> = (_: AlloyComponent, se: SimulatedEvent<SugarEvent>): void => {
    se.stop();
  };

  // TODO: Consider moving to alloy
  const sequence = (actions: Array<AlloyEvents.EventRunHandler<SugarEvent>>): AlloyEvents.EventRunHandler<SugarEvent> => {
    return (comp, se) => {
      Arr.each(actions, (a) => {
        a(comp, se);
      });
    };
  };

  const onDrop: AlloyEvents.EventRunHandler<SugarEvent> = (comp, se) => {
    if (! Disabling.isDisabled(comp)) {
      const transferEvent = se.event().raw() as DragEvent;
      handleFiles(comp, transferEvent.dataTransfer.files);
    }
  };

  const onSelect = (component, simulatedEvent) => {
    const files = simulatedEvent.event().raw().target.files;
    handleFiles(component, files);
  };

  const handleFiles = (component, files: FileList) => {
    Representing.setValue(component, filterByExtension(files));
    AlloyTriggers.emitWith(component, formChangeEvent, { name: spec.name });
  };

  const memInput = Memento.record(
    {
      dom: {
        tag: 'input',
        attributes: {
          type: 'file',
          accept: 'image/*'
        },
        styles: {
          display: 'none'
        }
      },
      behaviours: Behaviour.derive([
        AddEventsBehaviour.config('input-file-events', [
          AlloyEvents.cutter(SystemEvents.tapOrClick())
        ])
      ])
    }
  );

  const renderField = (s) => {
    return {
      uid: s.uid,
      dom: {
        tag: 'div',
        classes: [ 'tox-dropzone-container' ]
      },
      behaviours: Behaviour.derive([
        RepresentingConfigs.memory([ ]),
        ComposingConfigs.self(),
        Disabling.config({}),
        Toggling.config({
          toggleClass: 'dragenter',
          toggleOnExecute: false
        }),
        AddEventsBehaviour.config('dropzone-events', [
          AlloyEvents.run('dragenter', sequence([ stopper, Toggling.toggle ])),
          AlloyEvents.run('dragleave', sequence([ stopper, Toggling.toggle ])),
          AlloyEvents.run('dragover', stopper),
          AlloyEvents.run('drop', sequence([ stopper, onDrop ])),
          AlloyEvents.run(NativeEvents.change(), onSelect)
        ]),
      ]),
      components: [
        {
          dom: {
            tag: 'div',
            classes: [ 'tox-dropzone' ],
            styles: {}
          },
          components: [
            {
              dom: {
                tag: 'p',
                innerHtml: providersBackstage.translate('Drop an image here')
              }
            },
            Button.sketch({
              dom: {
                tag: 'button',
                innerHtml: providersBackstage.translate('Browse for an image'),
                styles: {
                  position: 'relative'
                },
                classes: [ 'tox-button', 'tox-button--secondary']
              },
              components: [
                memInput.asSpec()
              ],
              action: (comp) => {
                const inputComp = memInput.get(comp);
                inputComp.element().dom().click();
              },
              buttonBehaviours: Behaviour.derive([
                Tabstopping.config({ })
              ])
            })
          ]
        }
      ]
    };
  };

  const pLabel = spec.label.map((label) => renderLabel(label, providersBackstage));
  const pField = AlloyFormField.parts().field({
    factory: { sketch: renderField }
  });

  return renderFormFieldWith(pLabel, pField, ['tox-form__group--stretched']);
};