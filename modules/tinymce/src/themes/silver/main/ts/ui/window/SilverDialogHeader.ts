import {
  AlloySpec, AlloyTriggers, Behaviour, Button, Container, DomFactory, Dragging, GuiFactory, ModalDialog, Reflecting, SketchSpec, Tabstopping
} from '@ephox/alloy';
import { Optional } from '@ephox/katamari';
import { SelectorFind } from '@ephox/sugar';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { formCancelEvent } from '../general/FormEvents';
import * as Icons from '../icons/Icons';
import { titleChannel } from './DialogChannels';

/* eslint-enable max-len */

export interface WindowHeaderSpec {
  title: string;
  draggable: boolean;
}

const renderClose = (providersBackstage: UiFactoryBackstageProviders) => Button.sketch({
  dom: {
    tag: 'button',
    classes: [ 'tox-button', 'tox-button--icon', 'tox-button--naked' ],
    attributes: {
      'type': 'button',
      'aria-label': providersBackstage.translate('Close'),
      'title': providersBackstage.translate('Close') // TODO tooltips: AP-213
    }
  },
  buttonBehaviours: Behaviour.derive([
    Tabstopping.config({ })
  ]),
  components: [
    Icons.render('close', { tag: 'span', classes: [ 'tox-icon' ] }, providersBackstage.icons)
  ],
  action: (comp) => {
    AlloyTriggers.emit(comp, formCancelEvent);
  }
});

const renderTitle = (
  spec: WindowHeaderSpec,
  dialogId: string,
  titleId: Optional<string>,
  providersBackstage: UiFactoryBackstageProviders
): AlloySpec => {
  const renderComponents = (data: WindowHeaderSpec) => [ GuiFactory.text(providersBackstage.translate(data.title)) ];

  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-dialog__title' ],
      attributes: {
        ...titleId.map((x) => ({ id: x })).getOr({})
      }
    },
    components: [],
    behaviours: Behaviour.derive([
      Reflecting.config({
        channel: `${titleChannel}-${dialogId}`,
        initialData: spec,
        renderComponents
      })
    ])
  };
};

const renderDragHandle = () => ({
  dom: DomFactory.fromHtml('<div class="tox-dialog__draghandle"></div>')
});

const renderInlineHeader = (
  spec: WindowHeaderSpec,
  dialogId: string,
  titleId: string,
  providersBackstage: UiFactoryBackstageProviders
): SketchSpec => Container.sketch({
  dom: DomFactory.fromHtml('<div class="tox-dialog__header"></div>'),
  components: [
    renderTitle(spec, dialogId, Optional.some(titleId), providersBackstage),
    renderDragHandle(),
    renderClose(providersBackstage)
  ],
  containerBehaviours: Behaviour.derive([
    Dragging.config({
      mode: 'mouse',
      blockerClass: 'blocker',
      getTarget: (handle) => {
        return SelectorFind.closest<HTMLElement>(handle, '[role="dialog"]').getOrDie();
      },
      snaps: {
        getSnapPoints: () => [],
        leftAttr: 'data-drag-left',
        topAttr: 'data-drag-top'
      }
    })
  ])
});

const renderModalHeader = (spec: WindowHeaderSpec, dialogId: string, providersBackstage: UiFactoryBackstageProviders): AlloySpec => {
  const pTitle = ModalDialog.parts.title(
    renderTitle(spec, dialogId, Optional.none(), providersBackstage)
  );

  const pHandle = ModalDialog.parts.draghandle(
    renderDragHandle()
  );

  const pClose = ModalDialog.parts.close(
    renderClose(providersBackstage)
  );

  const components = [ pTitle ].concat(spec.draggable ? [ pHandle ] : []).concat([ pClose ]);
  return Container.sketch({
    dom: DomFactory.fromHtml('<div class="tox-dialog__header"></div>'),
    components
  });
};

export {
  renderInlineHeader,
  renderModalHeader
};
