/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloySpec, Behaviour, Focusing, Keying, ModalDialog, Reflecting, Tabstopping } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Fun, Optional } from '@ephox/katamari';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { ComposingConfigs } from '../alien/ComposingConfigs';
import { renderBodyPanel } from '../dialog/BodyPanel';
import { renderTabPanel } from '../dialog/TabPanel';
import * as NavigableObject from '../general/NavigableObject';
import { bodyChannel } from './DialogChannels';

// TypeScript allows some pretty weird stuff.
interface WindowBodySpec {
  body: Dialog.Dialog<unknown>['body'];
}

// ariaAttrs is being passed through to silver inline dialog
// from the WindowManager as a property of 'params'
const renderBody = (spec: WindowBodySpec, id: Optional<string>, backstage: UiFactoryBackstage, ariaAttrs: boolean): AlloySpec => {
  const renderComponents = (incoming: WindowBodySpec) => {
    switch (incoming.body.type) {
      case 'tabpanel': {
        return [
          renderTabPanel(incoming.body, backstage)
        ];
      }

      default: {
        return [
          renderBodyPanel(incoming.body, backstage)
        ];
      }
    }
  };

  const updateState = (_comp, incoming: WindowBodySpec) => Optional.some({
    isTabPanel: () => incoming.body.type === 'tabpanel'
  });

  const ariaAttributes = {
    'aria-live': 'polite'
  };

  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-dialog__content-js' ],
      attributes: {
        ...id.map((x): {id?: string} => ({ id: x })).getOr({}),
        ...ariaAttrs ? ariaAttributes : {}
      }
    },
    components: [ ],
    behaviours: Behaviour.derive([
      ComposingConfigs.childAt(0),
      Reflecting.config({
        channel: bodyChannel,
        updateState,
        renderComponents,
        initialData: spec
      })
    ])
  };
};

const renderInlineBody = (spec: WindowBodySpec, contentId: string, backstage: UiFactoryBackstage, ariaAttrs: boolean) => renderBody(spec, Optional.some(contentId), backstage, ariaAttrs);

const renderModalBody = (spec: WindowBodySpec, backstage: UiFactoryBackstage) => {
  const bodySpec = renderBody(spec, Optional.none(), backstage, false);
  return ModalDialog.parts.body(
    bodySpec
  );
};

const renderIframeBody = (spec: Dialog.UrlDialog) => {
  const bodySpec = {
    dom: {
      tag: 'div',
      classes: [ 'tox-dialog__content-js' ]
    },
    components: [
      {
        dom: {
          tag: 'div',
          classes: [ 'tox-dialog__body-iframe' ]
        },
        components: [
          NavigableObject.craft({
            dom: {
              tag: 'iframe',
              attributes: {
                src: spec.url
              }
            },
            behaviours: Behaviour.derive([
              Tabstopping.config({ }),
              Focusing.config({ })
            ])
          })
        ]
      }
    ],
    behaviours: Behaviour.derive([
      Keying.config({
        mode: 'acyclic',
        useTabstopAt: Fun.not(NavigableObject.isPseudoStop)
      })
    ])
  };

  return ModalDialog.parts.body(
    bodySpec
  );
};

export {
  renderInlineBody,
  renderModalBody,
  renderIframeBody
};
