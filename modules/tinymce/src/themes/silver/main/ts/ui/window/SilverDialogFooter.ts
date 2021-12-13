/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AlloyComponent, AlloySpec, Behaviour, Container, DomFactory, GuiFactory, Memento, ModalDialog, Reflecting, Replacing, SketchSpec
} from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Arr, Optional } from '@ephox/katamari';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { renderFooterButton } from '../general/Button';
import { footerChannel } from './DialogChannels';
import * as Diff from './DialogDiff';

const DiffType = Diff.DiffType;

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

const lookupFromSpec = (compInSystem: AlloyComponent, spec: Dialog.DialogFooterButton): Optional<AlloyComponent> =>
  compInSystem.getSystem().getByUid(spec.uid).toOptional();

const lookupByName = (compInSystem: AlloyComponent, footerButtons: Dialog.DialogFooterButton[], buttonName: string): Optional<AlloyComponent> =>
  Arr.find(footerButtons, (spec) => spec.name === buttonName)
    .bind((spec) => lookupFromSpec(compInSystem, spec));

const makeButton = (spec: Dialog.DialogFooterButton, backstage: UiFactoryBackstage): FooterButton => ({
  spec,
  detail: renderFooterButton(spec, spec.type, backstage)
});

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

const replaceButtons = (buttons: FooterButton[]) => (comp: AlloyComponent) =>
  Replacing.set(comp, Arr.map(buttons, (button) => button.detail));

const renderFooter = (initSpec: WindowFooterSpec, dialogId: string, backstage: UiFactoryBackstage) => {
  const updateState = (comp: AlloyComponent, data: WindowFooterSpec, state: Optional<FooterState>) => {
    // Generate the alloy specs, making sure to re-use any unchanged buttons
    const prevButtons = state.map((s) => s.buttons).getOr([]);
    const diffs = Diff.diffItems(data.buttons, prevButtons);
    const footerButtons = Arr.map(diffs, (diff) => {
      const spec = diff.item;
      if (diff.type === DiffType.Unchanged) {
        // mutate the spec uid to re-use the old uid
        spec.uid = diff.oldItem.uid;
        return lookupFromSpec(comp, spec)
          .map((buttonComp) => ({ spec, detail: GuiFactory.premade(buttonComp) }))
          .getOrThunk(() => makeButton(spec, backstage));
      } else {
        return makeButton(spec, backstage);
      }
    });

    // Replace/render the buttons
    const buttonGroups = Arr.partition(footerButtons, ({ spec }) => spec.align === 'start');
    memStartContainer.getOpt(comp).each(replaceButtons(buttonGroups.pass));
    memEndContainer.getOpt(comp).each(replaceButtons(buttonGroups.fail));

    return Optional.some<FooterState>({
      lookupByName: (buttonName) => lookupByName(comp, data.buttons, buttonName),
      buttons: data.buttons
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
