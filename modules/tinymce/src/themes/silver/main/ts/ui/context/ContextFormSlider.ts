import { AddEventsBehaviour, AlloyComponent, AlloyEvents, Behaviour, Disabling, FormField, GuiFactory, Input, Keying, NativeEvents, SketchSpec } from '@ephox/alloy';
import { InlineContent } from '@ephox/bridge';
import { Cell, Fun, Optional, Strings } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as UiState from '../../UiState';
import { onControlAttached, onControlDetached } from '../controls/Controls';
import * as ContextFormApi from './ContextFormApi';
import * as ContextFormGroup from './ContextFormGroup';

export const renderContextFormSliderInput = (
  ctx: InlineContent.ContextSliderForm,
  providers: UiFactoryBackstageProviders,
  onEnter: (input: AlloyComponent) => Optional<boolean>
): SketchSpec => {
  const editorOffCell = Cell(Fun.noop);

  const pLabel = ctx.label.map((label) => FormField.parts.label({
    dom: { tag: 'label', classes: [ 'tox-label' ] },
    components: [ GuiFactory.text(label) ]
  }));

  const pField = FormField.parts.field({
    factory: Input,
    type: 'range',
    inputClasses: [ 'tox-toolbar-slider__input' ],
    inputAttributes: {
      min: String(ctx.min()),
      max: String(ctx.max())
    },
    data: ctx.initValue().toString(),
    fromInputValue: (value: string) => Strings.toFloat(value).getOr(ctx.min()),
    toInputValue: (value: number) => String(value),
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
      AddEventsBehaviour.config('slider-events', [
        onControlAttached<InlineContent.ContextFormInstanceApi<number>>({
          onSetup: ctx.onSetup,
          getApi: ContextFormApi.getFormApi,
          onBeforeSetup: Keying.focusIn
        }, editorOffCell),
        onControlDetached({ getApi: ContextFormApi.getFormApi }, editorOffCell),
        AlloyEvents.run(NativeEvents.input(), (comp) => {
          ctx.onInput(ContextFormApi.getFormApi(comp));
        })
      ])
    ])
  });

  return ContextFormGroup.createContextFormFieldFromParts(pLabel, pField, providers);
};

