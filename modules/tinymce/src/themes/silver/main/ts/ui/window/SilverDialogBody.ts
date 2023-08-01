import { AlloyComponent, AlloyParts, Behaviour, Focusing, Keying, ModalDialog, Reflecting, SimpleSpec, Tabstopping } from '@ephox/alloy';
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
  readonly body: Dialog.Dialog<Record<string, unknown>>['body'];
  readonly initialData: Dialog.DialogData;
}

// ariaAttrs is being passed through to silver inline dialog
// from the WindowManager as a property of 'params'
const renderBody = (spec: WindowBodySpec, dialogId: string, contentId: Optional<string>, backstage: UiFactoryBackstage, ariaAttrs: boolean): SimpleSpec => {
  const renderComponents = (incoming: WindowBodySpec) => {
    const body = incoming.body;
    switch (body.type) {
      case 'tabpanel': {
        return [
          renderTabPanel(body, incoming.initialData, backstage)
        ];
      }

      default: {
        return [
          renderBodyPanel(body, incoming.initialData, backstage)
        ];
      }
    }
  };

  const updateState = (_comp: AlloyComponent, incoming: WindowBodySpec) => Optional.some({
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
        ...contentId.map((x): { id?: string } => ({ id: x })).getOr({}),
        ...ariaAttrs ? ariaAttributes : {}
      }
    },
    components: [],
    behaviours: Behaviour.derive([
      ComposingConfigs.childAt(0),
      Reflecting.config({
        channel: `${bodyChannel}-${dialogId}`,
        updateState,
        renderComponents,
        initialData: spec
      })
    ])
  };
};

const renderInlineBody = (spec: WindowBodySpec, dialogId: string, contentId: string, backstage: UiFactoryBackstage, ariaAttrs: boolean): SimpleSpec =>
  renderBody(spec, dialogId, Optional.some(contentId), backstage, ariaAttrs);

const renderModalBody = (spec: WindowBodySpec, dialogId: string, backstage: UiFactoryBackstage): AlloyParts.ConfiguredPart => {
  const bodySpec = renderBody(spec, dialogId, Optional.none(), backstage, false);
  return ModalDialog.parts.body(bodySpec);
};

const renderIframeBody = (spec: Dialog.UrlDialog): AlloyParts.ConfiguredPart => {
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
          NavigableObject.craft(
            Optional.none(),
            {
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

  return ModalDialog.parts.body(bodySpec);
};

export {
  renderInlineBody,
  renderModalBody,
  renderIframeBody
};
