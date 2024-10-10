import { AlloyComponent, SketchSpec } from '@ephox/alloy';
import { InlineContent } from '@ephox/bridge';
import { Optional } from '@ephox/katamari';
import { Focus } from '@ephox/sugar';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as SizeInput from '../sizeinput/SizeInput';
import * as ContextFormApi from './ContextFormApi';

export const renderContextFormSizeInput = (
  ctx: InlineContent.ContextSizeInputForm,
  providersBackstage: UiFactoryBackstageProviders,
  onEnter: (input: AlloyComponent) => Optional<boolean>
): SketchSpec => {
  const { width, height } = ctx.initValue();

  return SizeInput.renderSizeInput({
    inDialog: false,
    label: ctx.label,
    enabled: true,
    context: Optional.none(),
    name: Optional.none(),
    width,
    height,
    onEnter: Optional.some(onEnter),
    onInput: Optional.some((input) => ctx.onInput(ContextFormApi.getFormApi(input))),
    onAttachField1: (comp) => Focus.focus(comp.element),
  }, providersBackstage);
};
