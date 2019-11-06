/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloySpec, AlloyTriggers, Behaviour, Input, Keying, Memento } from '@ephox/alloy';
import { Toolbar } from '@ephox/bridge';
import { Id, Option, Result } from '@ephox/katamari';

import { ToolbarDrawer } from '../../api/Settings';
import { UiFactoryBackstage } from '../../backstage/Backstage';
import { renderToolbar } from '../toolbar/CommonToolbar';
import { generate } from './ContextFormButtons';

const renderContextForm = (toolbarType: ToolbarDrawer, ctx: Toolbar.ContextForm, backstage: UiFactoryBackstage) => {
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
          onEnter: (input) => {
            return commands.findPrimary(input).map((primary) => {
              AlloyTriggers.emitExecute(primary);
              return true;
            });
          },
          // These two lines need to be tested. They are about left and right bypassing
          // any keyboard handling, and allowing left and right to be processed by the input
          // Maybe this should go in an alloy sketch for Input?
          onLeft: (comp, se) => {
            se.cut();
            return Option.none();
          },
          onRight: (comp, se) => {
            se.cut();
            return Option.none();
          }
        })
      ])
    })
  );

  const commands = generate(memInput, ctx.commands, backstage.shared.providers);

  return renderToolbar({
    type: toolbarType,
    uid: Id.generate('context-toolbar'),
    initGroups: [
      {
        title: Option.none(),
        items: [ memInput.asSpec() ]
      },
      {
        title: Option.none(),
        items: commands.asSpecs() as AlloySpec[]
      }
    ],
    onEscape: Option.none,
    cyclicKeying: true,
    backstage,
    getSink: () => Result.error('')
  });
};

export const ContextForm = {
  renderContextForm
};
