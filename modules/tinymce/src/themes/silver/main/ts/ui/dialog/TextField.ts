/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AddEventsBehaviour, AlloyEvents, AlloyTriggers, Behaviour, Disabling, FormField as AlloyFormField, Input as AlloyInput, Invalidating,
  Keying, NativeEvents, Representing, SketchSpec, SystemEvents, Tabstopping
} from '@ephox/alloy';
import { Types } from '@ephox/bridge';
import { Arr, Fun, Future, Option, Result } from '@ephox/katamari';
import { Traverse } from '@ephox/sugar';
import { renderFormFieldWith, renderLabel } from 'tinymce/themes/silver/ui/alien/FieldLabeller';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as ReadOnly from '../../ReadOnly';
import { formChangeEvent, formSubmitEvent } from '../general/FormEvents';
import { Omit } from '../Omit';

const renderTextField = function (spec: TextField, providersBackstage: UiFactoryBackstageProviders) {
  const pLabel = spec.label.map((label) => renderLabel(label, providersBackstage));

  const baseInputBehaviours = [
    Disabling.config({
      disabled: () => spec.disabled || providersBackstage.isReadOnly()
    }),
    ReadOnly.receivingConfig(),
    Keying.config({
      mode: 'execution',
      useEnter: spec.multiline !== true,
      useControlEnter: spec.multiline === true,
      execute: (comp) => {
        AlloyTriggers.emit(comp, formSubmitEvent);
        return Option.some(true);
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
    getRoot(input) {
      return Traverse.parent(input.element());
    },
    invalidClass: 'tox-invalid',
    validator: {
      validate(input) {
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

  const pField = AlloyFormField.parts().field({
    tag: spec.multiline === true ? 'textarea' : 'input',
    inputAttributes,
    inputClasses: [ spec.classname ],
    inputBehaviours: Behaviour.derive(
      Arr.flatten<Behaviour.NamedConfiguredBehaviour<Behaviour.BehaviourConfigSpec, Behaviour.BehaviourConfigDetail>>([
        baseInputBehaviours,
        validatingBehaviours
      ])
    ),
    selectOnFocus: false,
    factory: AlloyInput
  });

  const extraClasses = spec.flex ? [ 'tox-form__group--stretched' ] : [];
  const extraClasses2 = extraClasses.concat(spec.maximized ? [ 'tox-form-group--maximize' ] : []);

  const extraBehaviours = [
    Disabling.config({
      disabled: () => spec.disabled || providersBackstage.isReadOnly(),
      onDisabled: (comp) => {
        AlloyFormField.getField(comp).each(Disabling.disable);
      },
      onEnabled: (comp) => {
        AlloyFormField.getField(comp).each(Disabling.enable);
      }
    }),
    ReadOnly.receivingConfig()
  ];

  return renderFormFieldWith(pLabel, pField, extraClasses2, extraBehaviours);
};

export type Validator = (v: string) => true | string;

export interface TextField {
  multiline: boolean;
  name: string;
  classname: string;
  flex: boolean;
  label: Option<string>;
  inputMode: Option<string>;
  placeholder: Option<string>;
  disabled: boolean;
  validation: Option<{
    validator: Validator;
    validateOnLoad?: boolean;
  }>;
  maximized: boolean;
}

type InputSpec = Omit<Types.Input.Input, 'type'>;

type TextAreaSpec = Omit<Types.TextArea.TextArea, 'type'>;

const renderInput = (spec: InputSpec, providersBackstage: UiFactoryBackstageProviders): SketchSpec => renderTextField({
  name: spec.name,
  multiline: false,
  label: spec.label,
  inputMode: spec.inputMode,
  placeholder: spec.placeholder,
  flex: false,
  disabled: spec.disabled,
  classname: 'tox-textfield',
  validation: Option.none(),
  maximized: spec.maximized
}, providersBackstage);

const renderTextarea = (spec: TextAreaSpec, providersBackstage: UiFactoryBackstageProviders): SketchSpec => renderTextField({
  name: spec.name,
  multiline: true,
  label: spec.label,
  inputMode: Option.none(), // type attribute is not valid for textareas
  placeholder: spec.placeholder,
  flex: true,
  disabled: spec.disabled,
  classname: 'tox-textarea',
  validation: Option.none(),
  maximized: spec.maximized
}, providersBackstage);

export {
  renderInput,
  renderTextarea
};
