/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloySpec, Behaviour, FormField as AlloyFormField, RawDomSchema, SketchSpec } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';

const renderFormFieldWith = (uid: string, pLabel: Optional<AlloySpec>, pField: AlloySpec, extraClasses: string[], extraBehaviours: Behaviour.NamedConfiguredBehaviour<any, any>[]): SketchSpec => {
  const spec = renderFormFieldSpecWith(uid, pLabel, pField, extraClasses, extraBehaviours);
  return AlloyFormField.sketch(spec);
};

const renderFormField = (uid: string, pLabel: Optional<AlloySpec>, pField: AlloySpec): SketchSpec => renderFormFieldWith(uid, pLabel, pField, [ ], [ ]);

const renderFormFieldSpec = (uid: string, pLabel: Optional<AlloySpec>, pField: AlloySpec) => ({
  uid,
  dom: renderFormFieldDom(),
  components: pLabel.toArray().concat([ pField ])
});

const renderFormFieldSpecWith = (uid: string, pLabel: Optional<AlloySpec>, pField: AlloySpec, extraClasses: string[], extraBehaviours: Behaviour.NamedConfiguredBehaviour<any, any>[]) => ({
  uid,
  dom: renderFormFieldDomWith(extraClasses),
  components: pLabel.toArray().concat([ pField ]),
  fieldBehaviours: Behaviour.derive(extraBehaviours)
});

const renderFormFieldDom = (): RawDomSchema => renderFormFieldDomWith([ ]);

const renderFormFieldDomWith = (extraClasses: string[]): RawDomSchema => ({
  tag: 'div',
  classes: [ 'tox-form__group' ].concat(extraClasses)
});

const renderLabel = (label: string, providersBackstage: UiFactoryBackstageProviders): AlloySpec => AlloyFormField.parts.label({
  dom: {
    tag: 'label',
    classes: [ 'tox-label' ],
    innerHtml: providersBackstage.translate(label)
  }
});

export {
  renderFormField,
  renderFormFieldWith,
  renderFormFieldSpec,
  renderFormFieldDom,
  renderLabel
};
