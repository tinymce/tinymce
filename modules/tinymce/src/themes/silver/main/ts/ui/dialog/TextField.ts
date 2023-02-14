import {
  AddEventsBehaviour, AlloyEvents, AlloyTriggers, Behaviour, Disabling, FormField as AlloyFormField, Input as AlloyInput, Invalidating, Keying,
  NativeEvents, Representing, SketchSpec, SystemEvents, Tabstopping
} from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Arr, Fun, Future, Optional, Result } from '@ephox/katamari';
import { Traverse } from '@ephox/sugar';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as ReadOnly from '../../ReadOnly';
import { renderFormFieldWith, renderLabel } from '../alien/FieldLabeller';
import { formChangeEvent, formSubmitEvent } from '../general/FormEvents';

export type Validator = (v: string) => true | string;

export interface TextField {
  readonly multiline: boolean;
  readonly name: string;
  readonly classname: string;
  readonly flex: boolean;
  readonly label: Optional<string>;
  readonly inputMode: Optional<string>;
  readonly placeholder: Optional<string>;
  readonly disabled: boolean;
  readonly validation: Optional<{
    readonly validator: Validator;
    readonly validateOnLoad?: boolean;
  }>;
  readonly maximized: boolean;
  readonly data: Optional<string>;
}

type InputSpec = Omit<Dialog.Input, 'type'>;
type TextAreaSpec = Omit<Dialog.TextArea, 'type'>;

const renderTextField = (spec: TextField, providersBackstage: UiFactoryBackstageProviders) => {
  const pLabel = spec.label.map((label) => renderLabel(label, providersBackstage));

  const baseInputBehaviours: Behaviour.NamedConfiguredBehaviour<any, any, any>[] = [
    Disabling.config({
      disabled: () => spec.disabled || providersBackstage.isDisabled()
    }),
    ReadOnly.receivingConfig(),
    Keying.config({
      mode: 'execution',
      useEnter: spec.multiline !== true,
      useControlEnter: spec.multiline === true,
      execute: (comp) => {
        AlloyTriggers.emit(comp, formSubmitEvent);
        return Optional.some(true);
      }
    }),
    AddEventsBehaviour.config('textfield-change', [
      AlloyEvents.run(NativeEvents.input(), (component, _) => {
        AlloyTriggers.emitWith(component, formChangeEvent, { name: spec.name } );
      }),
      AlloyEvents.run(SystemEvents.postPaste(), (component, _) => {
        AlloyTriggers.emitWith(component, formChangeEvent, { name: spec.name } );
      })
    ]),
    Tabstopping.config({})
  ];

  const validatingBehaviours = spec.validation.map((vl) => Invalidating.config({
    getRoot: (input) => {
      return Traverse.parentElement(input.element);
    },
    invalidClass: 'tox-invalid',
    validator: {
      validate: (input) => {
        const v = Representing.getValue(input);
        const result = vl.validator(v);
        return Future.pure(result === true ? Result.value(v) : Result.error(result));
      },
      validateOnLoad: vl.validateOnLoad
    }
  })).toArray();

  const placeholder = spec.placeholder.fold( Fun.constant({}), (p) => ({ placeholder: providersBackstage.translate(p) }));
  const inputMode = spec.inputMode.fold(Fun.constant({}), (mode) => ({ inputmode: mode }));

  const inputAttributes = {
    ...placeholder,
    ...inputMode
  };

  const pField = AlloyFormField.parts.field({
    tag: spec.multiline === true ? 'textarea' : 'input',
    ...spec.data.map((data) => ({ data })).getOr({}),
    inputAttributes,
    inputClasses: [ spec.classname ],
    inputBehaviours: Behaviour.derive(
      Arr.flatten([
        baseInputBehaviours,
        validatingBehaviours
      ])
    ),
    selectOnFocus: false,
    factory: AlloyInput
  });

  // TINY-9331: This wrapper is needed to avoid border-radius rendering issues when the textarea has a scrollbar
  const pTextField = spec.multiline ? {
    dom: {
      tag: 'div',
      classes: [ 'tox-textarea-wrap' ]
    },
    components: [ pField ]
  } : pField;

  const extraClasses = spec.flex ? [ 'tox-form__group--stretched' ] : [];
  const extraClasses2 = extraClasses.concat(spec.maximized ? [ 'tox-form-group--maximize' ] : []);

  const extraBehaviours = [
    Disabling.config({
      disabled: () => spec.disabled || providersBackstage.isDisabled(),
      onDisabled: (comp) => {
        AlloyFormField.getField(comp).each(Disabling.disable);
      },
      onEnabled: (comp) => {
        AlloyFormField.getField(comp).each(Disabling.enable);
      }
    }),
    ReadOnly.receivingConfig()
  ];

  return renderFormFieldWith(pLabel, pTextField, extraClasses2, extraBehaviours);
};

const renderInput = (spec: InputSpec, providersBackstage: UiFactoryBackstageProviders, initialData: Optional<string>): SketchSpec => renderTextField({
  name: spec.name,
  multiline: false,
  label: spec.label,
  inputMode: spec.inputMode,
  placeholder: spec.placeholder,
  flex: false,
  disabled: !spec.enabled,
  classname: 'tox-textfield',
  validation: Optional.none(),
  maximized: spec.maximized,
  data: initialData
}, providersBackstage);

const renderTextarea = (spec: TextAreaSpec, providersBackstage: UiFactoryBackstageProviders, initialData: Optional<string>): SketchSpec => renderTextField({
  name: spec.name,
  multiline: true,
  label: spec.label,
  inputMode: Optional.none(), // type attribute is not valid for textareas
  placeholder: spec.placeholder,
  flex: true,
  disabled: !spec.enabled,
  classname: 'tox-textarea',
  validation: Optional.none(),
  maximized: spec.maximized,
  data: initialData
}, providersBackstage);

export {
  renderInput,
  renderTextarea
};
