import { AlloyComponent, AlloySpec, AlloyTriggers, Memento, SketchSpec } from '@ephox/alloy';
import { InlineContent } from '@ephox/bridge';
import { Id, Optional } from '@ephox/katamari';

import { ToolbarMode } from '../../api/Options';
import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { renderToolbar, ToolbarGroup } from '../toolbar/CommonToolbar';
import { generate } from './ContextFormButtons';
import * as ContextFormSizeInput from './ContextFormSizeInput';
import * as ContextFormSlider from './ContextFormSlider';
import * as ContextFormTextInput from './ContextFormTextInput';

const renderInput = (ctx: InlineContent.ContextForm, providers: UiFactoryBackstageProviders, onEnter: (input: AlloyComponent) => Optional<boolean>) => {
  switch (ctx.type) {
    case 'contextform': return ContextFormTextInput.renderContextFormTextInput(ctx, providers, onEnter);
    case 'contextsliderform': return ContextFormSlider.renderContextFormSliderInput(ctx, providers, onEnter);
    case 'contextsizeinputform': return ContextFormSizeInput.renderContextFormSizeInput(ctx, providers, onEnter);
  }
};

const buildInitGroups = (ctx: InlineContent.ContextForm, providers: UiFactoryBackstageProviders): ToolbarGroup[] => {
  const onEnter = (input: AlloyComponent) => {
    return commands.findPrimary(input).map((primary) => {
      AlloyTriggers.emitExecute(primary);
      return true;
    });
  };

  const memInput = Memento.record(renderInput(ctx, providers, onEnter));
  const commands = generate(memInput, ctx.commands, providers);

  return [
    {
      title: Optional.none(),
      label: Optional.none(),
      items: [ memInput.asSpec() ]
    },
    {
      title: Optional.none(),
      label: Optional.none(),
      items: commands.asSpecs() as AlloySpec[]
    }
  ];
};

const renderContextForm = (toolbarType: ToolbarMode, ctx: InlineContent.ContextForm, providers: UiFactoryBackstageProviders): SketchSpec =>
  renderToolbar({
    type: toolbarType,
    uid: Id.generate('context-toolbar'),
    initGroups: buildInitGroups(ctx, providers),
    onEscape: Optional.none,
    cyclicKeying: true,
    providers
  });

export const ContextForm = {
  renderContextForm,
  buildInitGroups
};
