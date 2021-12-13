/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AlloySpec, AlloyTriggers, Behaviour, Button, Container, DomFactory, Dragging, GuiFactory, ModalDialog, Reflecting, Replacing
} from '@ephox/alloy';
import { Optional, Optionals } from '@ephox/katamari';
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
  components: [
    Icons.render('close', { tag: 'div', classes: [ 'tox-icon' ] }, providersBackstage.icons)
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
      Replacing.config({}),
      Reflecting.config({
        channel: `${titleChannel}-${dialogId}`,
        initialData: spec,
        updateState: (comp, data, state) => {
          // Only update the components if the title has changed
          if (!Optionals.is(state, data, (a, b) => a.title === b.title)) {
            Replacing.set(comp, renderComponents(data));
          }
          return Optional.some(data);
        }
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
): AlloySpec => Container.sketch({
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
