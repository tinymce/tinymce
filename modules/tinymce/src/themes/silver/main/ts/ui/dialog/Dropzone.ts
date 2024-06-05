import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloyTriggers, Behaviour, Button, Disabling,
  FormField as AlloyFormField, GuiFactory, Memento, NativeEvents, Representing, SimpleSpec, SimulatedEvent, SketchSpec,
  SystemEvents, Tabstopping, Toggling,
  Tooltipping
} from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Arr, Optional, Strings } from '@ephox/katamari';
import { EventArgs } from '@ephox/sugar';

import Tools from 'tinymce/core/api/util/Tools';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as ReadOnly from '../../ReadOnly';
import { ComposingConfigs } from '../alien/ComposingConfigs';
import { DisablingConfigs } from '../alien/DisablingConfigs';
import { renderFormFieldWith, renderLabel } from '../alien/FieldLabeller';
import * as RepresentingConfigs from '../alien/RepresentingConfigs';
import { formChangeEvent } from '../general/FormEvents';
import * as Icons from '../icons/Icons';

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
      handleFiles(comp, transferEvent.dataTransfer?.files);
    }
  };

  const onSelect = (component: AlloyComponent, simulatedEvent: SimulatedEvent<EventArgs>) => {
    const input = simulatedEvent.event.raw.target as HTMLInputElement;
    handleFiles(component, input.files);
  };

  const handleFiles = (component: AlloyComponent, files: FileList | null | undefined) => {
    if (files) {
      Representing.setValue(component, filterByExtension(files, providersBackstage));
      AlloyTriggers.emitWith(component, formChangeEvent, { name: spec.name });
    }
  };

  const makeIcon = (name: string, errId: Optional<string>, icon: string = name, label: string = name): SimpleSpec =>
    Icons.render(icon, {
      tag: 'div',
      classes: [ 'tox-icon', 'tox-control-wrap__status-icon-' + name ],
      attributes: {
        'title': providersBackstage.translate(label),
        'aria-live': 'polite',
        ...errId.fold(() => ({}), (id) => ({ id }))
      }
    }, providersBackstage.icons);

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

  const renderField = (s: SketchSpec) => ({
    uid: s.uid,
    dom: {
      tag: 'div',
      classes: [ 'tox-dropzone-container' ]
    },
    behaviours: Behaviour.derive([
      RepresentingConfigs.memory(initialData.getOr([])),
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
              tag: 'p'
            },
            components: [
              GuiFactory.text(providersBackstage.translate('Drop images here or'))
            ]
          },
          {
            dom: {
              tag: 'div',
              styles: {
                'display': 'flex',
                'justify-content': 'center',
                'align-items': 'center',
              }
            },
            components: [
              Button.sketch({
                dom: {
                  tag: 'button',
                  classes: [ 'tox-button', 'tox-button--icon', 'tox-button--naked' ],
                },
                components: [
                  memInput.asSpec(),
                  makeIcon('bomb', Optional.none(), 'bomb', providersBackstage.translate('Browse for an image'))
                ],
                action: (comp) => {
                  const inputComp = memInput.get(comp);
                  inputComp.element.dom.click();
                },
                buttonBehaviours: Behaviour.derive([
                  Tabstopping.config({ }),
                  DisablingConfigs.button(providersBackstage.isDisabled),
                  ReadOnly.receivingConfig(),
                  Tooltipping.config(
                    providersBackstage.tooltips.getConfig({
                      tooltipText: providersBackstage.translate(providersBackstage.translate('Browse for an image'))
                    })
                  )
                ])
              }),
              ...(spec.pickers.map((picker) => {
                return Button.sketch({
                  dom: {
                    tag: 'button',
                    styles: {
                      position: 'relative'
                    },
                    classes: [ 'tox-button', 'tox-button--icon', 'tox-button--naked' ],
                    attributes: {
                      'type': 'button',
                      'aria-label': providersBackstage.translate(picker.tooltip)
                    }
                  },
                  components: [ makeIcon(picker.icon, Optional.none(), picker.icon, picker.tooltip) ],
                  action: (comp) => {
                    picker.onPick((url) => {
                      comp.getSystem().getByUid(s.uid).each((dropComp) => {
                        Representing.setValue(dropComp, [ url ]);
                        AlloyTriggers.emitWith(dropComp, formChangeEvent, { name: spec.name });
                      });
                    });
                  },
                  buttonBehaviours: Behaviour.derive([
                    Tabstopping.config({ }),
                    DisablingConfigs.button(providersBackstage.isDisabled),
                    ReadOnly.receivingConfig(),
                    Tooltipping.config(
                      providersBackstage.tooltips.getConfig({
                        tooltipText: providersBackstage.translate(providersBackstage.translate(picker.tooltip))
                      })
                    )
                  ])
                });
              }))
            ]
          },
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
