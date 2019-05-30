/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloySpec, Behaviour, Focusing, Keying, ModalDialog, Reflecting, Tabstopping } from '@ephox/alloy';
import { Types } from '@ephox/bridge';
import { Fun, Option } from '@ephox/katamari';
import { UiFactoryBackstage } from '../../backstage/Backstage';
import { ComposingConfigs } from '../alien/ComposingConfigs';
import { renderBodyPanel } from '../dialog/BodyPanel';
import { renderTabPanel } from '../dialog/TabPanel';
import NavigableObject from '../general/NavigableObject';
import { bodyChannel } from './DialogChannels';

// TypeScript allows some pretty weird stuff.
type WindowBodyFoo = {
  body: Types.Dialog.Dialog<unknown>['body']
};

// ariaAttrs is being passed through to silver inline dialog
// from the WindowManager as a property of 'params'
const renderBody = (foo: WindowBodyFoo, id: Option<string>, backstage: UiFactoryBackstage, ariaAttrs: boolean): AlloySpec => {
  const renderComponents = (incoming: WindowBodyFoo) => {
    switch (incoming.body.type) {
      case 'tabpanel': {
        return [
          renderTabPanel({
            tabs: incoming.body.tabs
          }, backstage)
        ];
      }

      default: {
        return [
          renderBodyPanel({
            items: incoming.body.items
          }, backstage)
        ];
      }
    }
  };

  const updateState = (_comp, incoming: WindowBodyFoo) => {
    return Option.some({
      isTabPanel: () => incoming.body.type === 'tabpanel'
    });
  };

  const ariaAttributes = {
    'aria-live': 'polite'
  };

  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-dialog__content-js' ],
      attributes: {
        ...id.map((x): {id?: string} => ({id: x})).getOr({}),
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
        initialData: foo
      })
    ])
  };
};

const renderInlineBody = (foo: WindowBodyFoo, contentId: string, backstage: UiFactoryBackstage, ariaAttrs: boolean) => {
  return renderBody(foo, Option.some(contentId), backstage, ariaAttrs);
};

const renderModalBody = (foo: WindowBodyFoo, backstage: UiFactoryBackstage) => {
  const bodySpec = renderBody(foo, Option.none(), backstage, false);
  return ModalDialog.parts().body(
    bodySpec
  );
};

const renderIframeBody = (spec: Types.UrlDialog.UrlDialog) => {
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

  return ModalDialog.parts().body(
    bodySpec
  );
};

export {
  renderInlineBody,
  renderModalBody,
  renderIframeBody
};