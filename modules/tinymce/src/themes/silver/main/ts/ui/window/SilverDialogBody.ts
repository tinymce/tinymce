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

const withNamedItem = (item: Dialog.BodyComponent | Dialog.Tab, f: (name: string) => void) =>
  Obj.get(item as Record<string, any>, 'name').each(f);

const isChangedDiff = (diff: Diff.DiffResult<unknown>) =>
  diff.type === DiffType.Changed || diff.type === DiffType.Removed || diff.type === DiffType.Added;

const getComposedContainer = (comp: AlloyComponent, uid: string) => {
  // TODO: Should this die if we can't find the container or do something else? maybe it should trigger a full re-render?
  const container = comp.getSystem().getByUid(uid).getOrDie();
  return container.hasConfigured(Composing) ? Composing.getCurrent(container).getOr(container) : container;
};

const isSketchSpec = (spec: AlloySpec): spec is SketchSpec =>
  Type.isString((spec as SketchSpec).uid);

const patchComponent = (
  comp: AlloyComponent,
  form: AlloyComponent,
  diff: Diff.DiffResult<Dialog.BodyComponent>,
  index: number,
  interpreter: (spec: Dialog.BodyComponent) => AlloySpec
): Dialog.BodyComponent[] => {
  const patchChildren = (parentComp: AlloyComponent) =>
    Arr.bind(diff.items, (d, index) => patchComponent(parentComp, form, d, index, interpreter));

  if (diff.type === DiffType.ChildrenChanged) {
    const oldItem = diff.oldItem;
    const hasChangedChild = Arr.exists(diff.items, isChangedDiff);
    const composed = hasChangedChild ? getComposedContainer(comp, oldItem.uid) : comp;
    return [{ ...oldItem, items: patchChildren(composed) }] as Dialog.BodyComponent[];
  } else {
    // Deregister the form component if being removed
    if (diff.type === DiffType.Removed) {
      // TODO: This should also clean up child form components when removing
      withNamedItem(diff.item, (name) => Form.removeField(form, name));
    }
    return Diff.applyDiff(comp, diff, index, interpreter);
  }
};

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

    const interpreter = (spec: Dialog.BodyComponent): AlloySpec => {
      const alloySpec = backstage.shared.interpreter(spec);
      if (isSketchSpec(alloySpec)) {
        withNamedItem(spec, (name) => Form.addField(form, name, alloySpec));
      }
      return alloySpec;
    };

    const patchChildren = (childDiff: Diff.GenericDiffResult<Dialog.Panel | Dialog.Tab>): Dialog.BodyComponent[] => {
      const composed = getComposedContainer(comp, childDiff.oldItem.uid);
      return Arr.bind(childDiff.items, (d, index) => {
        return patchComponent(composed, form, d, index, interpreter);
      });
    };

    const oldBody = diff.oldItem;
    switch (oldBody.type) {
      case 'tabpanel': {
        // If a tab has changed we can't currently replace a single tab so we need to rerender the whole lot
        // TODO: Look at adding a way for tab views to be added/removed/updated
        const hasChangedTab = Arr.exists(diff.items, isChangedDiff);
        if (hasChangedTab) {
          Replacing.set(comp, [ renderComponents(body) ]);
          return body;
        } else {
          return {
            ...oldBody, tabs: Arr.map(diff.items, (tabDiff) => {
              const castTabDiff = tabDiff as Diff.GenericDiffResult<Dialog.Tab>;
              return { ...castTabDiff.oldItem, items: patchChildren(castTabDiff) };
            })
          };
        }
      }

      case 'panel': {
        return { ...oldBody, items: patchChildren(diff as Diff.GenericDiffResult<Dialog.Panel>) };
      }
    }
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
