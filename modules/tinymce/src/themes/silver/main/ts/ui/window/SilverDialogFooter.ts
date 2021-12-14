/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AlloySpec, Behaviour, Container, DomFactory, Memento, ModalDialog, Reflecting, Replacing, SketchSpec } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Arr, Optional } from '@ephox/katamari';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { renderFooterButton } from '../general/Button';
import { footerChannel } from './DialogChannels';
import * as Diff from './DialogDiff';

export interface FooterButton {
  readonly detail: AlloySpec;
  readonly spec: Dialog.DialogFooterButton;
}

export interface WindowFooterSpec {
  buttons: Dialog.DialogFooterButton[];
}

export interface FooterState {
  readonly lookupByName: (buttonName: string) => Optional<AlloyComponent>;
  readonly buttons: Dialog.DialogFooterButton[];
}

const lookupByName = (compInSystem: AlloyComponent, footerButtons: Dialog.DialogFooterButton[], buttonName: string): Optional<AlloyComponent> =>
  Arr.find(footerButtons, (spec) => spec.name === buttonName)
    .bind((spec) => compInSystem.getSystem().getByUid(spec.uid).toOptional());

const makeGroup = (edge: string): SketchSpec => Container.sketch({
  dom: {
    tag: 'div',
    classes: [ `tox-dialog__footer-${edge}` ]
  },
  components: [],
  containerBehaviours: Behaviour.derive([
    Replacing.config({})
  ])
});

const renderFooter = (initSpec: WindowFooterSpec, dialogId: string, backstage: UiFactoryBackstage) => {
  const patchGroup = (group: AlloyComponent, buttons: Dialog.DialogFooterButton[], prevButtons: Dialog.DialogFooterButton[]) => {
    const diffs = Diff.diffItems(buttons, prevButtons);
    return Arr.bind(diffs, (diff, index) => {
      return Diff.applyDiff(group, diff, index, (spec) => renderFooterButton(spec, spec.type, backstage));
    });
  };

  const updateState = (comp: AlloyComponent, data: WindowFooterSpec, state: Optional<FooterState>) => {
    const prevButtons: Dialog.DialogFooterButton[] = state.map((s) => s.buttons).getOr([]);

    const isStart = (button: Dialog.DialogFooterButton) => button.align === 'start';
    const groupButtons = Arr.partition(data.buttons, isStart);
    const prevGroupButtons = Arr.partition(prevButtons, isStart);

    // Determine what's changed and apply the changes
    const buttons = [
      ...patchGroup(memStartContainer.get(comp), groupButtons.pass, prevGroupButtons.pass),
      ...patchGroup(memEndContainer.get(comp), groupButtons.fail, prevGroupButtons.fail)
    ];

    return Optional.some<FooterState>({
      lookupByName: (buttonName) => lookupByName(comp, buttons, buttonName),
      buttons
    });
  };

  const memStartContainer = Memento.record(makeGroup('start'));
  const memEndContainer = Memento.record(makeGroup('end'));

  return {
    dom: DomFactory.fromHtml('<div class="tox-dialog__footer"></div>'),
    components: [
      memStartContainer.asSpec(),
      memEndContainer.asSpec()
    ],
    behaviours: Behaviour.derive([
      Reflecting.config({
        channel: `${footerChannel}-${dialogId}`,
        initialData: initSpec,
        updateState
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
