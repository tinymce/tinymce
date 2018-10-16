import { FormField as AlloyFormField, SketchSpec, RawDomSchema } from '@ephox/alloy';
// TODO: Export properly from alloy.
import { ConfiguredPart } from '@ephox/alloy/lib/main/ts/ephox/alloy/parts/AlloyParts';
import { Option } from '@ephox/katamari';
import { FormFieldSpec } from '@ephox/alloy/lib/main/ts/ephox/alloy/ui/types/FormFieldTypes';
import { UiFactoryBackstageShared } from '../../backstage/Backstage';

const renderFormFieldWith = (pLabel: Option<ConfiguredPart>, pField: ConfiguredPart, extraClasses: string[]): SketchSpec => {
  const spec = renderFormFieldSpecWith(pLabel, pField, extraClasses);
  return AlloyFormField.sketch(spec);
};

const renderFormField = (pLabel: Option<ConfiguredPart>, pField: ConfiguredPart): SketchSpec => {
  return renderFormFieldWith(pLabel, pField, [ ]);
};

const renderFormFieldSpec = (pLabel: Option<ConfiguredPart>, pField: ConfiguredPart): FormFieldSpec => {
  return {
    dom: renderFormFieldDom(),
    components: pLabel.toArray().concat([ pField ])
  };
};

const renderFormFieldSpecWith = (pLabel: Option<ConfiguredPart>, pField: ConfiguredPart, extraClasses: string[]): FormFieldSpec => {
  return {
    dom: renderFormFieldDomWith(extraClasses),
    components: pLabel.toArray().concat([ pField ])
  };
};

const renderFormFieldDom = (): RawDomSchema => {
  return renderFormFieldDomWith([ ]);
};

const renderFormFieldDomWith = (extraClasses): RawDomSchema => {
  return {
    tag: 'div',
    classes: ['tox-form__group'].concat(extraClasses)
  };
};

const renderLabel = (label: string, backstage: UiFactoryBackstageShared): ConfiguredPart => {
  return AlloyFormField.parts().label({
    dom: {
      tag: 'label',
      classes: ['tox-label'],
      innerHtml: label
    }
  });
};

export {
  renderFormField,
  renderFormFieldWith,
  renderFormFieldSpec,
  renderFormFieldDom,
  renderLabel
};