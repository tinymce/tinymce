import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents,
  FormCoupledInputs as AlloyFormCoupledInputs,
  FormField as AlloyFormField,
  Input as AlloyInput,
  AlloySpec, AlloyTriggers, Behaviour, CustomEvent, Disabling,
  GuiFactory,
  Keying,
  NativeEvents, Representing, SketchSpec, Tabstopping, Tooltipping
} from '@ephox/alloy';
import { Cell, Fun, Id, Optional, Optionals, Unicode } from '@ephox/katamari';

import { formChangeEvent, formInputEvent } from 'tinymce/themes/silver/ui/general/FormEvents';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as UiState from '../../UiState';
import { onControlAttached, onControlDetached } from '../controls/Controls';
import * as Icons from '../icons/Icons';
import { formatSize, makeRatioConverter, noSizeConversion, parseSize, SizeConversion } from '../sizeinput/SizeInputModel';

interface RatioEvent extends CustomEvent {
  readonly isField1: boolean;
}

export interface SizeInputGenericSpec<ApiType = never> {
  readonly inDialog: boolean;
  readonly label: Optional<string>;
  readonly enabled: boolean;
  readonly context: Optional<string>;
  readonly name: Optional<string>;
  readonly width: string;
  readonly height: string;
  readonly onEnter: Optional<(input: AlloyComponent) => Optional<boolean>>;
  readonly onInput: Optional<(input: AlloyComponent) => void>;
  readonly onSetup: Optional<(api: ApiType) => (api: ApiType) => void>;
  readonly getApi: Optional<(input: AlloyComponent) => ApiType>;
}

export const renderSizeInput = <ApiType = never>(spec: SizeInputGenericSpec<ApiType>, providersBackstage: UiFactoryBackstageProviders): SketchSpec => {
  let converter: SizeConversion = noSizeConversion;

  const ratioEvent = Id.generate('ratio-event');

  const makeIcon = (iconName: string) =>
    Icons.render(iconName, { tag: 'span', classes: [ 'tox-icon', 'tox-lock-icon__' + iconName ] }, providersBackstage.icons);

  const disabled = () => !spec.enabled || spec.context.exists((context) => providersBackstage.checkUiComponentContext(context).shouldDisable);
  const toggleOnReceive = spec.context.map((context) => UiState.toggleOnReceive(() => providersBackstage.checkUiComponentContext(context)));

  const label = spec.label.getOr('Constrain proportions');
  const translatedLabel = providersBackstage.translate(label);
  const pLock = AlloyFormCoupledInputs.parts.lock({
    dom: {
      tag: 'button',
      classes: [ 'tox-lock', 'tox-button', 'tox-button--naked', 'tox-button--icon' ],
      attributes: {
        'aria-label': translatedLabel,
        'data-mce-name': label
      }
    },
    components: [
      makeIcon('lock'),
      makeIcon('unlock')
    ],
    buttonBehaviours: Behaviour.derive([
      Disabling.config({ disabled }),
      ...toggleOnReceive.toArray(),
      Tabstopping.config({}),
      Tooltipping.config(
        providersBackstage.tooltips.getConfig({
          tooltipText: translatedLabel
        })
      )
    ])
  });

  const formGroup = (components: AlloySpec[]) => ({
    dom: {
      tag: 'div',
      classes: [ spec.inDialog ? 'tox-form__group' : 'tox-context-form__group' ]
    },
    components
  });

  const getFieldPart = (isField1: boolean) => AlloyFormField.parts.field({
    factory: AlloyInput,
    inputClasses: spec.inDialog ? [ 'tox-textfield' ] : [ 'tox-textfield', 'tox-toolbar-textfield', 'tox-textfield-size' ],
    data: isField1 ? spec.width : spec.height,
    inputBehaviours: Behaviour.derive([
      Disabling.config({ disabled }),
      ...toggleOnReceive.toArray(),
      Tabstopping.config({}),
      AddEventsBehaviour.config('size-input-events', [
        AlloyEvents.run(NativeEvents.focusin(), (component, _simulatedEvent) => {
          AlloyTriggers.emitWith(component, ratioEvent, { isField1 });
        }),
        AlloyEvents.run(NativeEvents.change(), (component, _simulatedEvent) => {
          spec.name.each((name) => AlloyTriggers.emitWith(component, formChangeEvent, { name }));
        })
      ]),
      ...spec.onEnter.map((onEnter) => Keying.config({ mode: 'special', onEnter })).toArray()
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

  const editorOffCell = Cell(Fun.noop);

  const controlLifecycleHandlers = Optionals.lift2(spec.onSetup, spec.getApi, (onSetup, getApi) => [
    onControlAttached<ApiType>( { onSetup, getApi }, editorOffCell),
    onControlDetached<ApiType>( { getApi }, editorOffCell)
  ]).getOr([]);

  return AlloyFormCoupledInputs.sketch({
    dom: {
      tag: 'div',
      classes: [ spec.inDialog ? 'tox-form__group' : 'tox-context-form__group' ]
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
    onInput: (current) => AlloyTriggers.emit(current, formInputEvent),
    coupledFieldBehaviours: Behaviour.derive([
      Disabling.config({
        disabled,
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
      UiState.toggleOnReceive(() => providersBackstage.checkUiComponentContext('mode:design')),
      AddEventsBehaviour.config('size-input-events', [
        AlloyEvents.run<RatioEvent>(ratioEvent, (component, simulatedEvent) => {
          const isField1 = simulatedEvent.event.isField1;
          const optCurrent = isField1 ? AlloyFormCoupledInputs.getField1(component) : AlloyFormCoupledInputs.getField2(component);
          const optOther = isField1 ? AlloyFormCoupledInputs.getField2(component) : AlloyFormCoupledInputs.getField1(component);
          const value1 = optCurrent.map<string>(Representing.getValue).getOr('');
          const value2 = optOther.map<string>(Representing.getValue).getOr('');
          converter = makeRatioConverter(value1, value2);
        }),
        AlloyEvents.run(formInputEvent, (component) => {
          spec.onInput.each((onInput) => onInput(component));
        }),
        ...controlLifecycleHandlers,
      ])
    ])
  });
};

