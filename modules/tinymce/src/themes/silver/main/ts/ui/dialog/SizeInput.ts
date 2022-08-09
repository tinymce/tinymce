import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloySpec, AlloyTriggers, Behaviour, CustomEvent, Disabling,
  FormCoupledInputs as AlloyFormCoupledInputs,
  FormField as AlloyFormField, GuiFactory, Input as AlloyInput, NativeEvents, Representing, SketchSpec, Tabstopping
} from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Id, Unicode } from '@ephox/katamari';

import { formChangeEvent } from 'tinymce/themes/silver/ui/general/FormEvents';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as ReadOnly from '../../ReadOnly';
import * as Icons from '../icons/Icons';
import { formatSize, makeRatioConverter, noSizeConversion, parseSize, SizeConversion } from '../sizeinput/SizeInputModel';

interface RatioEvent extends CustomEvent {
  readonly isField1: boolean;
}

type SizeInputSpec = Omit<Dialog.SizeInput, 'type'>;

export const renderSizeInput = (spec: SizeInputSpec, providersBackstage: UiFactoryBackstageProviders): SketchSpec => {
  let converter: SizeConversion = noSizeConversion;

  const ratioEvent = Id.generate('ratio-event');

  const makeIcon = (iconName: string) =>
    Icons.render(iconName, { tag: 'span', classes: [ 'tox-icon', 'tox-lock-icon__' + iconName ] }, providersBackstage.icons);

  const pLock = AlloyFormCoupledInputs.parts.lock({
    dom: {
      tag: 'button',
      classes: [ 'tox-lock', 'tox-button', 'tox-button--naked', 'tox-button--icon' ],
      attributes: {
        title: providersBackstage.translate(spec.label.getOr('Constrain proportions'))  // TODO: tooltips AP-213
      }
    },
    components: [
      makeIcon('lock'),
      makeIcon('unlock')
    ],
    buttonBehaviours: Behaviour.derive([
      Disabling.config({
        disabled: () => !spec.enabled || providersBackstage.isDisabled()
      }),
      ReadOnly.receivingConfig(),
      Tabstopping.config({})
    ])
  });

  const formGroup = (components: AlloySpec[]) => ({
    dom: {
      tag: 'div',
      classes: [ 'tox-form__group' ]
    },
    components
  });

  const getFieldPart = (isField1: boolean) => AlloyFormField.parts.field({
    factory: AlloyInput,
    inputClasses: [ 'tox-textfield' ],
    inputBehaviours: Behaviour.derive([
      Disabling.config({
        disabled: () => !spec.enabled || providersBackstage.isDisabled()
      }),
      ReadOnly.receivingConfig(),
      Tabstopping.config({}),
      AddEventsBehaviour.config('size-input-events', [
        AlloyEvents.run(NativeEvents.focusin(), (component, _simulatedEvent) => {
          AlloyTriggers.emitWith(component, ratioEvent, { isField1 });
        }),
        AlloyEvents.run(NativeEvents.change(), (component, _simulatedEvent) => {
          AlloyTriggers.emitWith(component, formChangeEvent, { name: spec.name });
        })
      ])
    ]),
    selectOnFocus: false
  });

  const getLabel = (label: string) => ({
    dom: {
      tag: 'label',
      classes: [ 'tox-label' ]
    },
    components: [
      GuiFactory.text(providersBackstage.translate(label))
    ]
  });

  const widthField = AlloyFormCoupledInputs.parts.field1(
    formGroup([ AlloyFormField.parts.label(getLabel('Width')), getFieldPart(true) ])
  );

  const heightField = AlloyFormCoupledInputs.parts.field2(
    formGroup([ AlloyFormField.parts.label(getLabel('Height')), getFieldPart(false) ])
  );

  return AlloyFormCoupledInputs.sketch({
    dom: {
      tag: 'div',
      classes: [ 'tox-form__group' ]
    },
    components: [
      {
        dom: {
          tag: 'div',
          classes: [ 'tox-form__controls-h-stack' ]
        },
        components: [
          // NOTE: Form coupled inputs to the FormField.sketch themselves.
          widthField,
          heightField,
          formGroup([
            getLabel(Unicode.nbsp),
            pLock
          ])
        ]
      }
    ],
    field1Name: 'width',
    field2Name: 'height',
    locked: true,

    markers: {
      lockClass: 'tox-locked'
    },
    onLockedChange: (current: AlloyComponent, other: AlloyComponent, _lock: AlloyComponent) => {
      parseSize(Representing.getValue(current)).each((size) => {
        converter(size).each((newSize) => {
          Representing.setValue(other, formatSize(newSize));
        });
      });
    },
    coupledFieldBehaviours: Behaviour.derive([
      Disabling.config({
        disabled: () => !spec.enabled || providersBackstage.isDisabled(),
        onDisabled: (comp) => {
          AlloyFormCoupledInputs.getField1(comp).bind(AlloyFormField.getField).each(Disabling.disable);
          AlloyFormCoupledInputs.getField2(comp).bind(AlloyFormField.getField).each(Disabling.disable);
          AlloyFormCoupledInputs.getLock(comp).each(Disabling.disable);
        },
        onEnabled: (comp) => {
          AlloyFormCoupledInputs.getField1(comp).bind(AlloyFormField.getField).each(Disabling.enable);
          AlloyFormCoupledInputs.getField2(comp).bind(AlloyFormField.getField).each(Disabling.enable);
          AlloyFormCoupledInputs.getLock(comp).each(Disabling.enable);
        }
      }),
      ReadOnly.receivingConfig(),
      AddEventsBehaviour.config('size-input-events2', [
        AlloyEvents.run<RatioEvent>(ratioEvent, (component, simulatedEvent) => {
          const isField1 = simulatedEvent.event.isField1;
          const optCurrent = isField1 ? AlloyFormCoupledInputs.getField1(component) : AlloyFormCoupledInputs.getField2(component);
          const optOther = isField1 ? AlloyFormCoupledInputs.getField2(component) : AlloyFormCoupledInputs.getField1(component);
          const value1 = optCurrent.map<string>(Representing.getValue).getOr('');
          const value2 = optOther.map<string>(Representing.getValue).getOr('');
          converter = makeRatioConverter(value1, value2);
        })
      ])
    ])
  });
};
