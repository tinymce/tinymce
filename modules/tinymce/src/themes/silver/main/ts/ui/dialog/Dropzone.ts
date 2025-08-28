import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloyTriggers, Behaviour, Button, Disabling,
  FormField as AlloyFormField, GuiFactory, Memento, NativeEvents, Representing, SimpleSpec, SimulatedEvent,
  SystemEvents, Tabstopping, Toggling,
  CustomEvent
} from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Arr, Id, Optional, Strings } from '@ephox/katamari';
import { EventArgs } from '@ephox/sugar';

import Tools from 'tinymce/core/api/util/Tools';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as UiState from '../../UiState';
import { ComposingConfigs } from '../alien/ComposingConfigs';
import { DisablingConfigs } from '../alien/DisablingConfigs';
import { renderFormFieldWith, renderLabel } from '../alien/FieldLabeller';
import * as RepresentingConfigs from '../alien/RepresentingConfigs';
import { formChangeEvent } from '../general/FormEvents';

const browseFilesEvent = Id.generate('browse.files.event');

const filterByExtension = (files: FileList, providersBackstage: UiFactoryBackstageProviders) => {
  const allowedImageFileTypes = Tools.explode(providersBackstage.getOption('images_file_types'));
  const isFileInAllowedTypes = (file: File) => Arr.exists(allowedImageFileTypes, (type) => Strings.endsWith(file.name.toLowerCase(), `.${type.toLowerCase()}`));

  return Arr.filter(Arr.from(files), isFileInAllowedTypes);
};

type DropZoneSpec = Omit<Dialog.DropZone, 'type'>;

export const renderDropZone = (spec: DropZoneSpec, providersBackstage: UiFactoryBackstageProviders, initialData: Optional<string[]>): SimpleSpec => {

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
      AlloyTriggers.emitWith(comp, browseFilesEvent, { files: transferEvent.dataTransfer?.files });
    }
  };

  const onSelect = (component: AlloyComponent, simulatedEvent: SimulatedEvent<EventArgs>) => {
    const input = simulatedEvent.event.raw.target as HTMLInputElement;
    AlloyTriggers.emitWith(component, browseFilesEvent, { files: input.files });
  };

  const handleFiles = (component: AlloyComponent, files: FileList | null | undefined) => {
    if (files) {
      Representing.setValue(component, filterByExtension(files, providersBackstage));
      AlloyTriggers.emitWith(component, formChangeEvent, { name: spec.name });
    }
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

  const pLabel = spec.label.map((label) => renderLabel(label, providersBackstage));
  const pField = AlloyFormField.parts.field(
    {
      factory: Button,
      dom: {
        tag: 'button',
        styles: {
          position: 'relative'
        },
        classes: [ 'tox-button', 'tox-button--secondary' ]
      },
      components: [
        GuiFactory.text(providersBackstage.translate('Browse for an image')),
        memInput.asSpec()
      ],
      action: (comp: AlloyComponent) => {
        const inputComp = memInput.get(comp);
        inputComp.element.dom.click();
      },
      buttonBehaviours: Behaviour.derive([
        ComposingConfigs.self(),
        RepresentingConfigs.memory(initialData.getOr([])),
        Tabstopping.config({ }),
        DisablingConfigs.button(() => providersBackstage.checkUiComponentContext(spec.context).shouldDisable),
        UiState.toggleOnReceive(() => providersBackstage.checkUiComponentContext(spec.context))
      ])
    }
  );

  const wrapper: SimpleSpec = {
    dom: {
      tag: 'div',
      classes: [ 'tox-dropzone-container' ]
    },
    behaviours: Behaviour.derive([
      Disabling.config({
        disabled: () => providersBackstage.checkUiComponentContext(spec.context).shouldDisable
      }),
      UiState.toggleOnReceive(() => providersBackstage.checkUiComponentContext(spec.context)),
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
              tag: 'p'
            },
            components: [
              GuiFactory.text(providersBackstage.translate('Drop an image here'))
            ]
          },
          pField
        ]
      }
    ]

  };

  return renderFormFieldWith(pLabel, wrapper, [ 'tox-form__group--stretched' ], [ AddEventsBehaviour.config('handle-files', [
    AlloyEvents.run<CustomEvent>(browseFilesEvent, (comp, se) => {
      AlloyFormField.getField(comp).each((field) => {
        handleFiles(field, se.event.files);
      });
    })
  ]) ]);
};
