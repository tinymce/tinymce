import { AddEventsBehaviour, AlloyComponent, AlloyEvents, Behaviour, Disabling, FormField, GuiFactory, Input, Keying, NativeEvents, SketchSpec } from '@ephox/alloy';
import { InlineContent } from '@ephox/bridge';
import { Optional } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as UiState from '../../UiState';
import * as ContextFormApi from './ContextFormApi';
import * as ContextFormGroup from './ContextFormGroup';

export const renderContextFormTextInput = (
  ctx: InlineContent.ContextInputForm,
  providers: UiFactoryBackstageProviders,
  onEnter: (input: AlloyComponent) => Optional<boolean>
): SketchSpec => {
  const pLabel = ctx.label.map((label) => FormField.parts.label({
    dom: { tag: 'label', classes: [ 'tox-label' ] },
    components: [ GuiFactory.text(label) ]
  }));

  const pField = FormField.parts.field({
    factory: Input,
    inputClasses: [ 'tox-toolbar-textfield', 'tox-toolbar-nav-js' ],
    data: ctx.initValue(),
    selectOnFocus: true,
    inputBehaviours: Behaviour.derive([
      Disabling.config({
        disabled: () => providers.checkUiComponentContext('mode:design').shouldDisable
      }),
      UiState.toggleOnReceive(() => providers.checkUiComponentContext('mode:design')),
      Keying.config({
        mode: 'special',
        onEnter,
        // These two lines need to be tested. They are about left and right bypassing
        // any keyboard handling, and allowing left and right to be processed by the input
        // Maybe this should go in an alloy sketch for Input?
        onLeft: (comp, se) => {
          se.cut();
          return Optional.none();
        },
        onRight: (comp, se) => {
          se.cut();
          return Optional.none();
        }
      }),
      AddEventsBehaviour.config('input-events', [
        AlloyEvents.run(NativeEvents.input(), (comp) => {
          ctx.onInput(ContextFormApi.getFormApi(comp));
        })
      ])
    ])
  });

  return ContextFormGroup.createContextFormFieldFromParts(pLabel, pField);
};
