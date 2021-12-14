/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AlloyComponent, AlloySpec, Behaviour, Composing, Focusing, Form, GuiFactory, Keying, ModalDialog, Reflecting, Replacing, Tabstopping
} from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Arr, Fun, Obj, Optional, Type } from '@ephox/katamari';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { ComposingConfigs } from '../alien/ComposingConfigs';
import { renderBodyPanel } from '../dialog/BodyPanel';
import { renderTabPanel } from '../dialog/TabPanel';
import * as NavigableObject from '../general/NavigableObject';
import { bodyChannel } from './DialogChannels';
import * as Diff from './DialogDiff';

const DiffType = Diff.DiffType;

type Body = Dialog.Dialog<unknown>['body'];

interface WindowBodySpec {
  body: Body;
}

interface BodyState {
  readonly body: Body;
  readonly isTabPanel: () => boolean;
}

const lookupByUid = (compInSystem: AlloyComponent, uid: string): Optional<AlloyComponent> =>
  compInSystem.getSystem().getByUid(uid).toOptional();

const getChangedComponents = (diff: Diff.DiffResult<any, any>): Record<string, { parent: Diff.GenericDiffResult<any>; items: Diff.DiffResult<any>[] }> =>
  Arr.foldl(diff.items, (acc, result) => {
    const parent = result.parent;
    if (Type.isNonNullable(parent) && (result.type === DiffType.Changed || result.type === DiffType.Removed || result.type === DiffType.Added)) {
      const containerUid = parent.oldItem.uid;
      const current = acc[containerUid] ?? { parent, items: [] };
      current.items = current.items.concat([ result ]);
      acc[containerUid] = current;
      return acc;
    } else {
      return { ...acc, ...getChangedComponents(result) };
    }
  }, {});

// ariaAttrs is being passed through to silver inline dialog
// from the WindowManager as a property of 'params'
const renderBody = (spec: WindowBodySpec, dialogId: string, contentId: Optional<string>, backstage: UiFactoryBackstage, ariaAttrs: boolean): AlloySpec => {
  const renderComponents = (body: Body) => {
    switch (body.type) {
      case 'tabpanel': {
        return renderTabPanel(body, backstage);
      }

      default: {
        return renderBodyPanel(body, backstage);
      }
    }
  };

  const updateFormState = (form: AlloyComponent, items: Diff.DiffResult<any>[]) => {
    // TODO: This needs to handle adding child components to the form as well
    Form.clearFields(form);
    const remainingItems = Arr.filter(items, (item) => item.type !== DiffType.Removed);
    // Process added/updated fields
    Arr.each(remainingItems, ({ item }) => {
      Form.addField(form, item.name, item);
    });
  };

  const partialRenderComponents = (comp: AlloyComponent, diff: Diff.DiffResult<Body, Dialog.BodyComponent | Dialog.Tab>) => {
    const form = Composing.getCurrent(comp).bind(Composing.getCurrent).getOr(comp);
    const changed = getChangedComponents(diff);

    const interpreter = backstage.shared.interpreter;

    Obj.each(changed, (detail, uid) => {
      lookupByUid(comp, uid).each((container) => {
        const newItems = Arr.bind(detail.parent.items, (item) => {
          if (item.type === DiffType.Unchanged) {
            // mutate the spec uid to re-use the old uid
            item.item.uid = item.oldItem.uid;
            // TODO: This lookup doesn't really work because named fields get their uid overwritten by the form parts
            return [ lookupByUid(comp, item.item.uid).map(GuiFactory.premade).getOrThunk(() => interpreter(item.item)) ];
          } else if (item.type === DiffType.Removed) {
            return [];
          } else {
            return [ interpreter(item.item) ];
          }
        });
        Replacing.set(container, newItems);
        // TODO: Should these just be added when rendered by the interpreter instead?
        updateFormState(form, detail.items);
      });
    });
  };

  const updateState = (comp: AlloyComponent, data: WindowBodySpec, state: Optional<BodyState>) => {
    const body = data.body;

    const render = () => Replacing.set(comp, [ renderComponents(body) ]);
    state.fold(render, (s) => {
      const diff = Diff.diffBody(body, s.body);
      if (diff.type === DiffType.Unchanged) {
        // mutate the spec uid to re-use the old uid
        body.uid = diff.oldItem.uid;
        lookupByUid(comp, body.uid).fold(render, Fun.noop);
      } else if (diff.type === DiffType.ChildrenChanged) {
        partialRenderComponents(comp, diff);
      } else {
        render();
      }
    });

    return Optional.some({
      body,
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
