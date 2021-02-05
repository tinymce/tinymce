/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloyTriggers, Behaviour, Button, Disabling,
  FormField as AlloyFormField, Memento, NativeEvents, Representing, SimpleSpec, SimulatedEvent,
  SystemEvents, Tabstopping, Toggling
} from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Arr, Strings } from '@ephox/katamari';
import { EventArgs } from '@ephox/sugar';

import Tools from 'tinymce/core/api/util/Tools';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as ReadOnly from '../../ReadOnly';
import { ComposingConfigs } from '../alien/ComposingConfigs';
import { DisablingConfigs } from '../alien/DisablingConfigs';
import { renderFormFieldWith, renderLabel } from '../alien/FieldLabeller';
import { RepresentingConfigs } from '../alien/RepresentingConfigs';
import { formChangeEvent } from '../general/FormEvents';

const defaultImageFileTypes = 'jpeg,jpg,jpe,jfi,jif,jfif,png,gif,bmp,webp';

const filterByExtension = (files: FileList, providersBackstage: UiFactoryBackstageProviders) => {
  const allowedImageFileTypes = Tools.explode(providersBackstage.getSetting('images_file_types', defaultImageFileTypes, 'string'));
  const isFileInAllowedTypes = (file: File) => Arr.exists(allowedImageFileTypes, (type) => Strings.endsWith(file.name.toLowerCase(), `.${type.toLowerCase()}`));

  return Arr.filter(Arr.from(files), isFileInAllowedTypes);
};

type DropZoneSpec = Omit<Dialog.DropZone, 'type'>;

export const renderDropZone = (spec: DropZoneSpec, providersBackstage: UiFactoryBackstageProviders): SimpleSpec => {

  // TODO: Consider moving to alloy
  const stopper: AlloyEvents.EventRunHandler<EventArgs> = (_: AlloyComponent, se: SimulatedEvent<EventArgs>): void => {
    se.stop();
  };

  // TODO: Consider moving to alloy
  const sequence = (actions: Array<AlloyEvents.EventRunHandler<EventArgs>>): AlloyEvents.EventRunHandler<EventArgs> => (comp, se) => {
    Arr.each(actions, (a) => {
      a(comp, se);
    });
  };

  const onDrop: AlloyEvents.EventRunHandler<EventArgs> = (comp, se) => {
    if (!Disabling.isDisabled(comp)) {
      const transferEvent = se.event.raw as DragEvent;
      handleFiles(comp, transferEvent.dataTransfer.files);
    }
  };

  const onSelect = (component: AlloyComponent, simulatedEvent: SimulatedEvent<EventArgs>) => {
    const input = simulatedEvent.event.raw.target as HTMLInputElement;
    handleFiles(component, input.files);
  };

  const handleFiles = (component, files: FileList) => {
    Representing.setValue(component, filterByExtension(files, providersBackstage));
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
          AlloyEvents.cutter(NativeEvents.click()),
          AlloyEvents.cutter(SystemEvents.tap())
        ])
      ])
    }
  );

  const renderField = (s) => ({
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
      ])
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
              classes: [ 'tox-button', 'tox-button--secondary' ]
            },
            components: [
              memInput.asSpec()
            ],
            action: (comp) => {
              const inputComp = memInput.get(comp);
              inputComp.element.dom.click();
            },
            buttonBehaviours: Behaviour.derive([
              Tabstopping.config({ }),
              DisablingConfigs.button(providersBackstage.isDisabled),
              ReadOnly.receivingConfig()
            ])
          })
        ]
      }
    ]
  });

  const pLabel = spec.label.map((label) => renderLabel(label, providersBackstage));
  const pField = AlloyFormField.parts.field({
    factory: { sketch: renderField }
  });

  return renderFormFieldWith(pLabel, pField, [ 'tox-form__group--stretched' ], [ ]);
};
