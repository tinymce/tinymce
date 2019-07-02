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
  FormField as AlloyFormField,
  Input as AlloyInput,
  Invalidating,
  Keying,
  NativeEvents,
  Representing,
  SketchSpec,
  Tabstopping,
  SystemEvents,
} from '@ephox/alloy';
import { Arr, Future, Option, Result } from '@ephox/katamari';
import { Traverse } from '@ephox/sugar';
import { renderFormFieldWith, renderLabel } from 'tinymce/themes/silver/ui/alien/FieldLabeller';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { formChangeEvent, formSubmitEvent } from '../general/FormEvents';
import { Types } from '@ephox/bridge';
import { Omit } from '../Omit';

const renderTextField = function (spec: TextField, providersBackstage: UiFactoryBackstageProviders) {
  const pLabel = spec.label.map((label) => renderLabel(label, providersBackstage));

  const baseInputBehaviours = [
    Keying.config({
      mode: 'execution',
      useEnter: spec.multiline !== true,
      useControlEnter: spec.multiline === true,
      execute: (comp) => {
        AlloyTriggers.emit(comp, formSubmitEvent);
        return Option.some(true);
      },
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

  const validatingBehaviours = spec.validation.map((vl) => {
    return Invalidating.config({
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
    });
  }).toArray();

  const pField = AlloyFormField.parts().field({
    tag: spec.multiline === true ? 'textarea' : 'input',
    inputAttributes: spec.placeholder.fold(
      () => {},
      (placeholder) => ({ placeholder: providersBackstage.translate(placeholder) })
    ),
    inputClasses: [spec.classname],
    inputBehaviours: Behaviour.derive(
      Arr.flatten<Behaviour.NamedConfiguredBehaviour<Behaviour.BehaviourConfigSpec, Behaviour.BehaviourConfigDetail>>([
        baseInputBehaviours,
        validatingBehaviours
      ])
    ),
    selectOnFocus: false,
    factory: AlloyInput
  });

  const extraClasses = spec.flex ? ['tox-form__group--stretched'] : [];

  return renderFormFieldWith(pLabel, pField, extraClasses);
};

export type Validator = (v: string) => true | string;

export interface TextField {
  multiline: boolean;
  name: string;
  classname: string;
  flex: boolean;
  label: Option<string>;
  placeholder: Option<string>;
  validation: Option<{
    validator: Validator;
    validateOnLoad?: boolean
  }>;
}

type InputSpec = Omit<Types.Input.Input, 'type'>;

type TextAreaSpec = Omit<Types.TextArea.TextArea, 'type'>;

const renderInput = (spec: InputSpec, providersBackstage: UiFactoryBackstageProviders): SketchSpec => {
  return renderTextField({
    name: spec.name,
    multiline: false,
    label: spec.label,
    placeholder: spec.placeholder,
    flex: false,
    classname: 'tox-textfield',
    validation: Option.none()
  }, providersBackstage);
};

const renderTextarea = (spec: TextAreaSpec, providersBackstage: UiFactoryBackstageProviders): SketchSpec => {
  return renderTextField({
    name: spec.name,
    multiline: true,
    label: spec.label,
    placeholder: spec.placeholder,
    flex: true,
    classname: 'tox-textarea',
    validation: Option.none(),
  }, providersBackstage);
};

export {
  renderInput,
  renderTextarea
};