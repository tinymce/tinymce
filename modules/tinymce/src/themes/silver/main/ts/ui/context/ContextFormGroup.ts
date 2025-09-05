import { type AlloySpec, Behaviour, Disabling, FormField, type SketchSpec } from '@ephox/alloy';
import type { Optional } from '@ephox/katamari';

import type { UiFactoryBackstageProviders } from '../../backstage/Backstage';

import * as ContextToolbarFocus from './ContextToolbarFocus';

export const createContextFormFieldFromParts = (
  pLabel: Optional<AlloySpec>,
  pField: AlloySpec,
  providers: UiFactoryBackstageProviders
): SketchSpec => FormField.sketch({
  dom: {
    tag: 'div',
    classes: [ 'tox-context-form__group' ]
  },
  components: [ ...pLabel.toArray(), pField ],
  fieldBehaviours: Behaviour.derive([
    Disabling.config({
      disabled: () => providers.checkUiComponentContext('mode:design').shouldDisable,
      onDisabled: (comp) => {
        ContextToolbarFocus.focusParent(comp);
        FormField.getField(comp).each(Disabling.disable);
      },
      onEnabled: (comp) => {
        FormField.getField(comp).each(Disabling.enable);
      }
    }),
  ])
});

