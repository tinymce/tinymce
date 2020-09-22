/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

/* eslint-disable max-len */
import { AlloySpec, AlloyTriggers, Behaviour, Button, Container, DomFactory, Dragging, GuiFactory, ModalDialog, Reflecting } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';
import { SelectorFind } from '@ephox/sugar';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { formCancelEvent } from '../general/FormEvents';
import { get as getIcon } from '../icons/Icons';
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
  components: [
    {
      dom: {
        tag: 'div',
        classes: [ 'tox-icon' ],
        innerHtml: getIcon('close', providersBackstage.icons)
      }
    }
  ],
  action: (comp) => {
    AlloyTriggers.emit(comp, formCancelEvent);
  }
});

const renderTitle = (
  spec: WindowHeaderSpec,
  id: Optional<string>,
  providersBackstage: UiFactoryBackstageProviders
): AlloySpec => {
  const renderComponents = (data: WindowHeaderSpec) => [ GuiFactory.text(providersBackstage.translate(data.title)) ];

  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-dialog__title' ],
      attributes: {
        ...id.map((x) => ({ id: x }) as {id?: string}).getOr({})
      }
    },
    components: renderComponents(spec),
    behaviours: Behaviour.derive([
      Reflecting.config({
        channel: titleChannel,
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
  titleId: string,
  providersBackstage: UiFactoryBackstageProviders
): AlloySpec => Container.sketch({
  dom: DomFactory.fromHtml('<div class="tox-dialog__header"></div>'),
  components: [
    renderTitle(spec, Optional.some(titleId), providersBackstage),
    renderDragHandle(),
    renderClose(providersBackstage)
  ],
  containerBehaviours: Behaviour.derive([
    Dragging.config({
      mode: 'mouse',
      blockerClass: 'blocker',
      getTarget(handle) {
        return SelectorFind.closest(handle, '[role="dialog"]').getOrDie();
      },
      snaps: {
        getSnapPoints: () => [ ],
        leftAttr: 'data-drag-left',
        topAttr: 'data-drag-top'
      }
    })
  ])
});

const renderModalHeader = (spec: WindowHeaderSpec, providersBackstage: UiFactoryBackstageProviders): AlloySpec => {
  const pTitle = ModalDialog.parts.title(
    renderTitle(spec, Optional.none(), providersBackstage)
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
