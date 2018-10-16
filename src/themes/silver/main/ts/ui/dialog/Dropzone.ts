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
  Tabstopping,
  Toggling,
} from '@ephox/alloy';
import { AlloyComponent } from '@ephox/alloy/lib/main/ts/ephox/alloy/api/component/ComponentApi';
import { EventRunHandler } from '@ephox/alloy/lib/main/ts/ephox/alloy/api/events/AlloyEvents';
import { Types } from '@ephox/bridge';
import { DragEvent, FileList } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';

import { ComposingConfigs } from '../alien/ComposingConfigs';
import { renderLabel, renderFormFieldWith } from '../alien/FieldLabeller';
import { RepresentingConfigs } from '../alien/RepresentingConfigs';
import { formChangeEvent } from '../general/FormEvents';
import { UiFactoryBackstageShared } from '../../backstage/Backstage';

const extensionsAccepted = '.jpg,.jpeg,.png,.gif';

const filterByExtension = function (files: FileList) {
  const re = new RegExp('(' + extensionsAccepted.split(/\s*,\s*/).join('|') + ')$', 'i');
  return Arr.filter(Arr.from(files), (file) => re.test(file.name));
};

export const renderDropZone = (spec: Types.DropZone.DropZone, sharedBackstage: UiFactoryBackstageShared): SimpleSpec => {

  // TODO: Consider moving to alloy
  const stopper: EventRunHandler<SugarEvent> = (_: AlloyComponent, se: SimulatedEvent<SugarEvent>): void => {
    se.stop();
  };

  // TODO: Consider moving to alloy
  const sequence = (actions: Array<EventRunHandler<SugarEvent>>): EventRunHandler<SugarEvent> => {
    return (comp, se) => {
      Arr.each(actions, (a) => {
        a(comp, se);
      });
    };
  };

  const onDrop: EventRunHandler<SugarEvent> = (comp, se) => {
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
          multiple: 'multiple'
        },
        styles: {
          // opacity: '0',
          display: 'none'
        }
      },
      behaviours: Behaviour.derive([
        AddEventsBehaviour.config('input-file-events', [
          AlloyEvents.cutter(NativeEvents.click())
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
                innerHtml: 'Drop Image Here'
              }
            },
            Button.sketch({
              dom: {
                tag: 'button',
                innerHtml: 'Browse',
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

  const pLabel = spec.label.map((label) => renderLabel(label, sharedBackstage));
  const pField = AlloyFormField.parts().field({
    factory: { sketch: renderField }
  });

  const extraClasses = spec.flex ? ['tox-form__group--stretched'] : [];

  return renderFormFieldWith(pLabel, pField, extraClasses);
};