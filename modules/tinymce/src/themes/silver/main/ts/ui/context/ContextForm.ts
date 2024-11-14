import { AlloyComponent, AlloySpec, AlloyTriggers, Memento, SketchSpec } from '@ephox/alloy';
import { InlineContent } from '@ephox/bridge';
import { Arr, Fun, Id, Optional } from '@ephox/katamari';

import { ToolbarMode } from '../../api/Options';
import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { renderToolbar, ToolbarGroup } from '../toolbar/CommonToolbar';
import { generate } from './ContextFormButtons';
import * as ContextFormSizeInput from './ContextFormSizeInput';
import * as ContextFormSlider from './ContextFormSlider';
import * as ContextFormTextInput from './ContextFormTextInput';

const buildInitGroup = <T>(
  f: (providers: UiFactoryBackstageProviders, onEnter: (input: AlloyComponent) => Optional<boolean>) => SketchSpec,
  ctx: InlineContent.BaseContextForm<T>,
  providers: UiFactoryBackstageProviders
): ToolbarGroup[] => {
  const onEnter = (input: AlloyComponent) => {
    return startCommands.findPrimary(input).orThunk(() => endCommands.findPrimary(input)).map((primary) => {
      AlloyTriggers.emitExecute(primary);
      return true;
    });
  };

  const memInput = Memento.record(f(providers, onEnter));
  const commandParts = Arr.partition(ctx.commands, (command) => command.align === 'start');
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

const buildInitGroups = (ctx: InlineContent.ContextForm, providers: UiFactoryBackstageProviders): ToolbarGroup[] => {
  switch (ctx.type) {
    case 'contextform': return buildInitGroup(Fun.curry(ContextFormTextInput.renderContextFormTextInput, ctx), ctx, providers);
    case 'contextsliderform': return buildInitGroup(Fun.curry(ContextFormSlider.renderContextFormSliderInput, ctx), ctx, providers);
    case 'contextsizeinputform': return buildInitGroup(Fun.curry(ContextFormSizeInput.renderContextFormSizeInput, ctx), ctx, providers);
  }
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
