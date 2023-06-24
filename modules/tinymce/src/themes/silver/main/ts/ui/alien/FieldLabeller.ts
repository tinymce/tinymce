import { AlloySpec, Behaviour, FormField as AlloyFormField, GuiFactory, RawDomSchema, SketchSpec } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';

type FormFieldSpec = Parameters<typeof AlloyFormField['sketch']>[0];

const renderFormFieldWith = (pLabel: Optional<AlloySpec>, pField: AlloySpec, pValidation: Optional<AlloySpec>, extraClasses: string[], extraBehaviours: Behaviour.NamedConfiguredBehaviour<any, any>[]): SketchSpec => {
  const spec = renderFormFieldSpecWith(pLabel, pField, pValidation, extraClasses, extraBehaviours);
  return AlloyFormField.sketch(spec);
};

const renderFormField = (pLabel: Optional<AlloySpec>, pField: AlloySpec): SketchSpec =>
  renderFormFieldWith(pLabel, pField, Optional.none(), [ ], [ ]);

const renderFormFieldSpec = (pLabel: Optional<AlloySpec>, pField: AlloySpec): FormFieldSpec => ({
  dom: renderFormFieldDom(),
  components: pLabel.toArray().concat([ pField ])
});

const renderFormFieldSpecWith = (
  pLabel: Optional<AlloySpec>,
  pField: AlloySpec,
  pValidation: Optional<AlloySpec>,
  extraClasses: string[],
  extraBehaviours: Behaviour.NamedConfiguredBehaviour<any, any>[]
): FormFieldSpec => ({
  dom: renderFormFieldDomWith(extraClasses),
  components: pLabel.toArray().concat([ pField ]).concat(pValidation.toArray()),
  fieldBehaviours: Behaviour.derive(extraBehaviours)
});

const renderFormFieldDom = (): RawDomSchema => renderFormFieldDomWith([ ]);

const renderFormFieldDomWith = (extraClasses: string[]): RawDomSchema => ({
  tag: 'div',
  classes: [ 'tox-form__group' ].concat(extraClasses)
});

const renderLabel = (label: string, providersBackstage: UiFactoryBackstageProviders): AlloySpec =>
  AlloyFormField.parts.label({
    dom: {
      tag: 'label',
      classes: [ 'tox-label' ]
    },
    components: [
      GuiFactory.text(providersBackstage.translate(label))
    ]
  });

export {
  renderFormField,
  renderFormFieldWith,
  renderFormFieldSpec,
  renderFormFieldDom,
  renderLabel
};
