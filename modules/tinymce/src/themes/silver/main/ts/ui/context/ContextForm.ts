import { AlloySpec, AlloyTriggers, Behaviour, Input, Keying, Memento, SketchSpec } from '@ephox/alloy';
import { InlineContent } from '@ephox/bridge';
import { Id, Optional } from '@ephox/katamari';

import { ToolbarMode } from '../../api/Options';
import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { renderToolbar, ToolbarGroup } from '../toolbar/CommonToolbar';
import { generate } from './ContextFormButtons';

const buildInitGroups = (ctx: InlineContent.ContextForm, providers: UiFactoryBackstageProviders): ToolbarGroup[] => {
  // Cannot use the FormField.sketch, because the DOM structure doesn't have a wrapping group
  const inputAttributes = ctx.label.fold(
    () => ({ }),
    (label) => ({ 'aria-label': label })
  );

  const memInput = Memento.record(
    Input.sketch({
      inputClasses: [ 'tox-toolbar-textfield', 'tox-toolbar-nav-js' ],
      data: ctx.initValue(),
      inputAttributes,
      selectOnFocus: true,
      inputBehaviours: Behaviour.derive([
        Keying.config({
          mode: 'special',
          onEnter: (input) => commands.findPrimary(input).map((primary) => {
            AlloyTriggers.emitExecute(primary);
            return true;
          }),
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
        })
      ])
    })
  );

  const commands = generate(memInput, ctx.commands, providers);

  return [
    {
      title: Optional.none(),
      items: [ memInput.asSpec() ]
    },
    {
      title: Optional.none(),
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
