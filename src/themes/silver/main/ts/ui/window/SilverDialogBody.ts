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

const renderBody = (foo: WindowBodyFoo, backstage: UiFactoryBackstage): AlloySpec => {
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

  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-dialog__content-js' ]
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

const renderInlineBody = (foo: WindowBodyFoo, backstage: UiFactoryBackstage) => {
  return renderBody(foo, backstage);
};

const renderModalBody = (foo: WindowBodyFoo, backstage: UiFactoryBackstage) => {
  return ModalDialog.parts().body(
    renderBody(foo, backstage)
  );
};

export {
  renderInlineBody,
  renderModalBody
};