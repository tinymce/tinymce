import {
  AlloyComponent, AlloyParts, Behaviour, Container, DomFactory, Memento, MementoRecord, ModalDialog, Reflecting, SimpleSpec, SketchSpec
} from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Arr, Optional } from '@ephox/katamari';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { renderFooterButton } from '../general/Button';
import { footerChannel } from './DialogChannels';

export interface DialogMemButton {
  readonly name: Dialog.DialogFooterButton['name'];
  readonly align: Dialog.DialogFooterButton['align'];
  readonly memento: MementoRecord;
}

export interface WindowFooterSpec {
  readonly buttons: Dialog.DialogFooterButton[];
}

export interface FooterState {
  readonly lookupByName: (buttonName: string) => Optional<AlloyComponent>;
  readonly footerButtons: DialogMemButton[];
}

const makeButton = (button: Dialog.DialogFooterButton, backstage: UiFactoryBackstage) =>
  renderFooterButton(button, button.type, backstage);

const lookup = (compInSystem: AlloyComponent, footerButtons: DialogMemButton[], buttonName: string) =>
  Arr.find(footerButtons, (button) => button.name === buttonName)
    .bind((memButton) => memButton.memento.getOpt(compInSystem));

const renderComponents = (_data: WindowFooterSpec, state: Optional<FooterState>): SketchSpec[] => {
  // default group is 'end'
  const footerButtons = state.map((s) => s.footerButtons).getOr([ ]);
  const buttonGroups = Arr.partition(footerButtons, (button) => button.align === 'start');

  const makeGroup = (edge: string, buttons: DialogMemButton[]): SketchSpec => Container.sketch({
    dom: {
      tag: 'div',
      classes: [ `tox-dialog__footer-${edge}` ]
    },
    components: Arr.map(buttons, (button) => button.memento.asSpec())
  });

  const startButtons = makeGroup('start', buttonGroups.pass);
  const endButtons = makeGroup('end', buttonGroups.fail);
  return [ startButtons, endButtons ];
};

const renderFooter = (initSpec: WindowFooterSpec, dialogId: string, backstage: UiFactoryBackstage): SimpleSpec => {
  const updateState = (comp: AlloyComponent, data: WindowFooterSpec) => {
    const footerButtons: DialogMemButton[] = Arr.map(data.buttons, (button) => {
      const memButton = Memento.record(makeButton(button, backstage));
      return {
        name: button.name,
        align: button.align,
        memento: memButton
      };
    });

    const lookupByName = (buttonName: string) =>
      lookup(comp, footerButtons, buttonName);

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

const renderInlineFooter = (initSpec: WindowFooterSpec, dialogId: string, backstage: UiFactoryBackstage): SimpleSpec =>
  renderFooter(initSpec, dialogId, backstage);

const renderModalFooter = (initSpec: WindowFooterSpec, dialogId: string, backstage: UiFactoryBackstage): AlloyParts.ConfiguredPart =>
  ModalDialog.parts.footer(renderFooter(initSpec, dialogId, backstage));

export {
  renderInlineFooter,
  renderModalFooter
};
