/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AlloyComponent, AlloySpec, Behaviour, Composing, Focusing, Form, Keying, ModalDialog, Reflecting, Replacing, SketchSpec, Tabstopping
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
    } else if (result.type === DiffType.ChildrenChanged) {
      return { ...acc, ...getChangedComponents(result) };
    } else {
      return acc;
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

  const partialRenderComponents = (comp: AlloyComponent, body: Body, diff: Diff.GenericDiffResult<Body, Dialog.BodyComponent | Dialog.Tab>) => {
    const form = Composing.getCurrent(comp).bind(Composing.getCurrent).getOr(comp);
    const changed = getChangedComponents(diff);

    const withNamedItem = (item: Dialog.BodyComponent, f: (name: string) => void) =>
      Obj.get(item as Record<string, any>, 'name').each(f);

    const interpreter = (spec: Dialog.BodyComponent) => {
      const alloySpec = backstage.shared.interpreter(spec) as SketchSpec;
      withNamedItem(spec, (name) => Form.addField(form, name, alloySpec));
      return alloySpec;
    };

    // TODO: This logic won't work as we need to rebuild the tree by merging the changes
    // mutate the spec uid to re-use the old uid
    body.uid = diff.oldItem.uid;
    Obj.each(changed, (detail, uid) => {
      lookupByUid(comp, uid).each((container) => {
        const composed = container.hasConfigured(Composing) ? Composing.getCurrent(container).getOr(container) : container;
        const newItems = Arr.bind(detail.parent.items, (d, index) => {
          // Deregister the form component if being removed
          if (d.type === DiffType.Removed) {
            withNamedItem(d.item, (name) => Form.removeField(form, name));
          }
          return Diff.applyDiff(composed, d, index, interpreter);
        });
        console.log(newItems);
      });
    });

    return body;
  };

  const updateState = (comp: AlloyComponent, data: WindowBodySpec, state: Optional<BodyState>) => {
    const body = data.body;

    const render = () => {
      Replacing.set(comp, [ renderComponents(body) ]);
      return body;
    };

    const newBody = state.fold(render, (s) => {
      const diff = Diff.diffBody(body, s.body);
      if (diff.type === DiffType.Unchanged) {
        return diff.oldItem;
      } else if (diff.type === DiffType.ChildrenChanged) {
        return partialRenderComponents(comp, body, diff);
      } else {
        return render();
      }
    });

    return Optional.some({
      body: newBody,
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
        ...contentId.map((x): { id?: string } => ({ id: x })).getOr({}),
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
              Tabstopping.config({}),
              Focusing.config({})
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
