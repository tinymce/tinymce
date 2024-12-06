import { AlloyComponent, SketchSpec } from '@ephox/alloy';
import { InlineContent } from '@ephox/bridge';
import { Optional } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as SizeInput from '../sizeinput/SizeInputToolbar';
import * as ContextFormApi from './ContextFormApi';

export const renderContextFormSizeInput = (
  ctx: InlineContent.ContextSizeInputForm,
  providersBackstage: UiFactoryBackstageProviders,
  onEnter: (input: AlloyComponent) => Optional<boolean>
): SketchSpec => {
  const { width, height } = ctx.initValue();

  return SizeInput.renderSizeInput<InlineContent.ContextFormInstanceApi<InlineContent.SizeData>>({
    label: ctx.label,
    enabled: true,
    width,
    height,
    onEnter,
    onInput: (input) => ctx.onInput(ContextFormApi.getFormApi(input)),
    onSetup: ctx.onSetup,
    getApi: ContextFormApi.getFormApi<InlineContent.SizeData>
  }, providersBackstage);
};
