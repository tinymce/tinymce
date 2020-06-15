/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

/* eslint-disable max-len */
import {
  AlloySpec, AlloyTriggers, Behaviour, Button, Container, DomFactory, Dragging, GuiFactory, ModalDialog, Reflecting
} from '@ephox/alloy';
import { Option } from '@ephox/katamari';
import { SelectorFind } from '@ephox/sugar';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { formCancelEvent } from '../general/FormEvents';
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
        innerHtml: '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">' +
                   '<path d="M17.953 7.453L13.422 12l4.531 4.547-1.406 1.406L12 ' +
                   '13.422l-4.547 4.531-1.406-1.406L10.578 12 6.047 ' +
                   '7.453l1.406-1.406L12 10.578l4.547-4.531z" ' +
                   'fill-rule="evenodd"></path></svg>'
      }
    }
  ],
  action: (comp) => {
    AlloyTriggers.emit(comp, formCancelEvent);
  }
});

const renderTitle = (
  spec: WindowHeaderSpec,
  id: Option<string>,
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
    renderTitle(spec, Option.some(titleId), providersBackstage),
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
  const pTitle = ModalDialog.parts().title(
    renderTitle(spec, Option.none(), providersBackstage)
  );

  const pHandle = ModalDialog.parts().draghandle(
    renderDragHandle()
  );

  const pClose = ModalDialog.parts().close(
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
