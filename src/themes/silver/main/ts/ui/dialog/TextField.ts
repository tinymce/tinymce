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
} from '@ephox/alloy';
import {
  BehaviourConfigDetail,
  BehaviourConfigSpec,
  NamedConfiguredBehaviour,
} from '@ephox/alloy/lib/main/ts/ephox/alloy/api/behaviour/Behaviour';
import { Arr, Future, Option, Result } from '@ephox/katamari';
import { Traverse } from '@ephox/sugar';
import { renderFormFieldWith, renderLabel } from 'tinymce/themes/silver/ui/alien/FieldLabeller';

import { formChangeEvent, formSubmitEvent } from '../general/FormEvents';

const renderTextField = function (spec: TextFieldFoo) {
  const pLabel = spec.label.map(renderLabel);

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
      AlloyEvents.run(NativeEvents.paste(), (component, _) => {
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
    inputAttributes: {},
    inputClasses: [spec.classname],
    inputBehaviours: Behaviour.derive(
      Arr.flatten<NamedConfiguredBehaviour<BehaviourConfigSpec, BehaviourConfigDetail>>([
        baseInputBehaviours,
        validatingBehaviours
      ])
    ),
    factory: AlloyInput
  });

  const extraClasses = spec.flex ? ['tox-form__group--stretched'] : [];

  return renderFormFieldWith(pLabel, pField, extraClasses);
};

export type Validator = (v: string) => true | string;

export interface TextFieldFoo extends BaseTextFieldFoo {
  multiline: boolean;
  name: string;
  classname: string;
  flex: boolean;
}

export interface BaseTextFieldFoo {
  name: string;
  label: Option<string>;
  validation: Option<{
    validator: Validator;
    validateOnLoad?: boolean
  }>;
}

// tslint:disable-next-line:no-empty-interface
export interface InputFoo extends BaseTextFieldFoo {
  name: string;
}

// tslint:disable-next-line:no-empty-interface
export interface TextareaFoo extends BaseTextFieldFoo {
  name: string;
  flex: boolean;
}

const renderInput = (spec: InputFoo): SketchSpec => {
  return renderTextField({
    name: spec.name,
    multiline: false,
    label: spec.label,
    flex: false,
    classname: 'tox-textfield',
    validation: Option.none()
  });
};

const renderTextarea = (spec: TextareaFoo): SketchSpec => {
  return renderTextField({
    name: spec.name,
    multiline: true,
    label: spec.label,
    flex: spec.flex,
    classname: 'tox-textarea',
    validation: Option.none(),
  });
};

export {
  renderInput,
  renderTextarea
};