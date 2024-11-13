import { AlloySpec, Behaviour, Disabling, FormField, SketchSpec } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';
import { Focus, SelectorFind } from '@ephox/sugar';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';

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
        // TODO: Is this really the best way to move focus out of the input when it gets disabled #TINY-11527
        Focus.search(comp.element).each((focus) => {
          SelectorFind.ancestor<HTMLElement>(focus, '[tabindex="-1"]').each((parent) => {
            Focus.focus(parent);
          });
        });

        FormField.getField(comp).each(Disabling.disable);
      },
      onEnabled: (comp) => {
        FormField.getField(comp).each(Disabling.enable);
      }
    }),
  ])
});

