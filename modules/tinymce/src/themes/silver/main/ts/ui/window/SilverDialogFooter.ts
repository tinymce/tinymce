/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, Behaviour, Container, DomFactory, GuiFactory, ModalDialog, Reflecting, SketchSpec } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Arr, Optional } from '@ephox/katamari';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { renderFooterButton } from '../general/Button';
import { footerChannel } from './DialogChannels';
import * as Diff from './DialogDiff';

const DiffType = Diff.DiffType;

export interface BuiltDialogButton {
  readonly comp: AlloyComponent;
  readonly spec: Dialog.DialogFooterButton;
}

export interface WindowFooterSpec {
  buttons: Dialog.DialogFooterButton[];
}

export interface FooterState {
  readonly lookupByName: (buttonName: string) => Optional<AlloyComponent>;
  readonly footerButtons: BuiltDialogButton[];
}

const makeButton = (button: Dialog.DialogFooterButton, backstage: UiFactoryBackstage) =>
  renderFooterButton(button, button.type, backstage);

const lookup = (footerButtons: BuiltDialogButton[], buttonName: string) =>
  Arr.find(footerButtons, ({ spec }) => spec.name === buttonName);

const renderComponents = (_data: WindowFooterSpec, state: Optional<FooterState>) => {
  // default group is 'end'
  const footerButtons: BuiltDialogButton[] = state.map((s) => s.footerButtons).getOr([]);
  const buttonGroups = Arr.partition(footerButtons, ({ spec }) => spec.align === 'start');

  const makeGroup = (edge: string, buttons: BuiltDialogButton[]): SketchSpec => Container.sketch({
    dom: {
      tag: 'div',
      classes: [ `tox-dialog__footer-${edge}` ]
    },
    components: Arr.map(buttons, (button) => GuiFactory.premade(button.comp))
  });

  const startButtons = makeGroup('start', buttonGroups.pass);
  const endButtons = makeGroup('end', buttonGroups.fail);
  return [ startButtons, endButtons ];
};

const compileButton = (spec: Dialog.DialogFooterButton, backstage: UiFactoryBackstage): BuiltDialogButton => {
  const comp = GuiFactory.build(makeButton(spec, backstage));
  return {
    spec,
    comp
  };
};

const renderFooter = (initSpec: WindowFooterSpec, dialogId: string, backstage: UiFactoryBackstage) => {
  const updateState = (comp: AlloyComponent, data: WindowFooterSpec, state: Optional<FooterState>) => {
    const oldButtons = state.map((s) => s.footerButtons).getOr([]);
    const diffs = Diff.diffItems(data.buttons, Arr.map(oldButtons, (button) => button.spec));
    const footerButtons = Arr.map(diffs, (diff) => {
      const item = diff.item;
      if (diff.type === DiffType.Unchanged) {
        return lookup(oldButtons, item.name).getOrThunk(() => compileButton(item, backstage));
      } else {
        return compileButton(item, backstage);
      }
    });

    const lookupByName = (buttonName: string) =>
      lookup(footerButtons, buttonName).map((button) => button.comp);

    return Optional.some<FooterState>({
      lookupByName,
      footerButtons
    });
  };

  return {
    dom: DomFactory.fromHtml('<div class="tox-dialog__footer"></div>'),
    components: [],
    behaviours: Behaviour.derive([
      Reflecting.config({
        channel: `${footerChannel}-${dialogId}`,
        initialData: initSpec,
        updateState,
        renderComponents
      })
    ])
  };
};

const renderInlineFooter = (initSpec: WindowFooterSpec, dialogId: string, backstage: UiFactoryBackstage) =>
  renderFooter(initSpec, dialogId, backstage);

const renderModalFooter = (initSpec: WindowFooterSpec, dialogId: string, backstage: UiFactoryBackstage) => ModalDialog.parts.footer(
  renderFooter(initSpec, dialogId, backstage)
);

export {
  renderInlineFooter,
  renderModalFooter
};
