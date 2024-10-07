import { AlloyComponent, AlloySpec, AlloyTriggers, Memento, SketchSpec } from '@ephox/alloy';
import { InlineContent } from '@ephox/bridge';
import { Arr, Id, Optional } from '@ephox/katamari';

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
    return startCommands.findPrimary(input).orThunk(() => endCommands.findPrimary(input)).map((primary) => {
      AlloyTriggers.emitExecute(primary);
      return true;
    });
  };

  const memInput = Memento.record(renderInput(ctx, providers, onEnter));
  // TODO: This any cast is needed since it somehow always picks the first type Type<string> from Type<string> | Type<number> | Type<SizeData>
  const commandParts = Arr.partition(ctx.commands, (command: InlineContent.ContextFormCommand<any>) => command.align as string === 'start');
  const startCommands = generate(memInput, commandParts.pass, providers);
  const endCommands = generate(memInput, commandParts.fail, providers);

  return Arr.filter([
    {
      title: Optional.none(),
      label: Optional.none(),
      items: startCommands.asSpecs() as AlloySpec[]
    },
    {
      title: Optional.none(),
      label: Optional.none(),
      items: [ memInput.asSpec() ]
    },
    {
      title: Optional.none(),
      label: Optional.none(),
      items: endCommands.asSpecs() as AlloySpec[]
    }
  ], (group) => group.items.length > 0);
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
