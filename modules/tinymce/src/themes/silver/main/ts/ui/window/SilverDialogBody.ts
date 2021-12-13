/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AlloySpec, Behaviour, Focusing, Keying, ModalDialog, Reflecting, Replacing, Tabstopping } from '@ephox/alloy';
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

interface BodyState {
  readonly isTabPanel: () => boolean;
}

// ariaAttrs is being passed through to silver inline dialog
// from the WindowManager as a property of 'params'
const renderBody = (spec: WindowBodySpec, dialogId: string, contentId: Optional<string>, backstage: UiFactoryBackstage, ariaAttrs: boolean): AlloySpec => {
  const renderComponents = (body: Dialog.Dialog<unknown>['body']) => {
    switch (body.type) {
      case 'tabpanel': {
        return [
          renderTabPanel(body, backstage)
        ];
      }

      default: {
        return [
          renderBodyPanel(body, backstage)
        ];
      }
    }
  };

  const updateState = (comp: AlloyComponent, data: WindowBodySpec, _state: Optional<BodyState>) => {
    const body = data.body;

    // TODO: TINY-8334 Diff changes and re-render only what's needed
    Replacing.set(comp, renderComponents(body));

    return Optional.some({
      isTabPanel: () => body.type === 'tabpanel'
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
        ...contentId.map((x): {id?: string} => ({ id: x })).getOr({}),
        ...ariaAttrs ? ariaAttributes : {}
      }
    },
    components: [],
    behaviours: Behaviour.derive([
      ComposingConfigs.childAt(0),
      Replacing.config({}),
      Reflecting.config({
        channel: `${bodyChannel}-${dialogId}`,
        initialData: spec,
        updateState
      })
    ])
  };
};

const renderInlineBody = (spec: WindowBodySpec, dialogId: string, contentId: string, backstage: UiFactoryBackstage, ariaAttrs: boolean) =>
  renderBody(spec, dialogId, Optional.some(contentId), backstage, ariaAttrs);

const renderModalBody = (spec: WindowBodySpec, dialogId: string, backstage: UiFactoryBackstage) => {
  const bodySpec = renderBody(spec, dialogId, Optional.none(), backstage, false);
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
