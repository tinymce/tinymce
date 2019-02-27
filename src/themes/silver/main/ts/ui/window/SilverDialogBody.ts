/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloySpec, Behaviour, ModalDialog, Reflecting } from '@ephox/alloy';
import { Option } from '@ephox/katamari';

import { ComposingConfigs } from '../alien/ComposingConfigs';
import { renderBodyPanel } from '../dialog/BodyPanel';
import { renderTabPanel } from '../dialog/TabPanel';
import { bodyChannel } from './DialogChannels';
import { UiFactoryBackstage } from '../../backstage/Backstage';
import { Types } from '@ephox/bridge';

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
  return ModalDialog.parts().body(
    renderBody(foo, Option.none(), backstage, false)
  );
};

export {
  renderInlineBody,
  renderModalBody
};