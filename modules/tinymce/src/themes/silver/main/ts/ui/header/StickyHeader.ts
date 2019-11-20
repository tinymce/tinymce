/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, Boxes, Channels, Docking, Focusing, Receiving } from '@ephox/alloy';
import { HTMLElement } from '@ephox/dom-globals';
import { Cell, Option, Result } from '@ephox/katamari';
import { Class, Classes, Compare, Css, Element, Focus, Height, Traverse, Width } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import * as EditorChannels from '../../Channels';

const visibility = {
  fadeInClass: 'tox-editor-dock-fadein',
  fadeOutClass: 'tox-editor-dock-fadeout',
  transitionClass: 'tox-editor-dock-transition'
};

const editorStickyOnClass = 'tox-tinymce--toolbar-sticky-on';
const editorStickyOffClass = 'tox-tinymce--toolbar-sticky-off';

const updateIframeContentFlow = (header: AlloyComponent): void => {
  const elm = header.element();
  Traverse.parent(elm).each((parentElem: Element<HTMLElement>) => {
    if (Docking.isDocked(header)) {
      const parentWidth = Width.get(parentElem);
      Css.set(elm, 'width', parentWidth + 'px');
      const headerHeight = Height.getOuter(elm);
      Css.set(parentElem, 'padding-top', headerHeight + 'px');
    } else {
      Css.remove(elm, 'width');
      Css.remove(parentElem, 'padding-top');
    }
  });
};

const updateSinkVisibility = (sinkElem: Element<HTMLElement>, visible: boolean): void => {
  if (visible) {
    Class.remove(sinkElem, visibility.fadeOutClass);
    Classes.add(sinkElem, [ visibility.transitionClass, visibility.fadeInClass ]);
  } else {
    Class.remove(sinkElem, visibility.fadeInClass);
    Classes.add(sinkElem, [ visibility.fadeOutClass, visibility.transitionClass ]);
  }
};

const updateEditorClasses = (editor: Editor, docked: boolean) => {
  const editorContainer = Element.fromDom(editor.getContainer());
  if (docked) {
    Class.add(editorContainer, editorStickyOnClass);
    Class.remove(editorContainer, editorStickyOffClass);
  } else {
    Class.add(editorContainer, editorStickyOffClass);
    Class.remove(editorContainer, editorStickyOnClass);
  }
};

const restoreFocus = (headerElem: Element, focusedElem: Element) => {
  // When the header is hidden, then the element that was focused will be lost
  // so we need to restore it if nothing else has already been focused (eg anything other than the body)
  const ownerDoc = Traverse.owner(focusedElem);
  Focus.active(ownerDoc).filter((activeElm) => {
    // Don't try to refocus the same element
    return !Compare.eq(focusedElem, activeElm);
  }).filter((activeElm) => {
    // Only attempt to refocus if the current focus is the body or is in the header element
    return Compare.eq(activeElm, Element.fromDom(ownerDoc.dom().body)) || Compare.contains(headerElem, activeElm);
  }).each(() => Focus.focus(focusedElem));
};

const findFocusedElem = (rootElm: Element, lazySink: () => Result<AlloyComponent, Error>): Option<Element> => {
  // Check to see if an element is focused inside the header or inside the sink
  // and if so store the element so we can restore it later
  return Focus.search(rootElm).orThunk(() => {
    return lazySink().toOption().bind((sink) => Focus.search(sink.element()));
  });
};

const setup = (editor: Editor, lazyHeader: () => Option<AlloyComponent>): void => {
  if (!editor.inline) {
    // No need to update the content flow in inline mode as the header always floats
    editor.on('ResizeWindow ResizeEditor ResizeContent', () => {
      lazyHeader().each(updateIframeContentFlow);
    });

    // Need to reset the docking position on skin loaded as the original position will have
    // changed due the skins styles being applied.
    // Note: Inline handles it's own skin loading, as it needs to do other initial positioning
    editor.on('SkinLoaded', () => {
      lazyHeader().each(Docking.reset);
    });

    // Need to refresh when we go fullscreen so that if the header is docked,
    // then it'll undock and viceversa
    editor.on('FullscreenStateChanged', () => {
      lazyHeader().each(Docking.refresh);
    });
  }

  // Update the editor classes once initial rendering has completed
  editor.on('PostRender', () => {
    updateEditorClasses(editor, false);
  });
};

const isDocked = (lazyHeader: () => Option<AlloyComponent>): boolean => {
  return lazyHeader().map(Docking.isDocked).getOr(false);
};

const getIframeBehaviours = () => {
  return [
    Receiving.config({
      channels: {
        [ EditorChannels.toolbarHeightChange() ]: {
          onReceive: updateIframeContentFlow
        }
      }
    })
  ];
};

const getBehaviours = (editor: Editor, lazySink: () => Result<AlloyComponent, Error>) => {
  const focusedElm = Cell<Option<Element>>(Option.none());

  const runOnSinkElement = (f: (sink: Element) => void) => {
    lazySink().each((sink) => f(sink.element()));
  };

  const onDockingSwitch = (comp: AlloyComponent) => {
    if (!editor.inline) {
      updateIframeContentFlow(comp);
    }
    updateEditorClasses(editor, Docking.isDocked(comp));
    comp.getSystem().broadcastOn( [ Channels.repositionPopups() ], { });
    lazySink().each((sink) => sink.getSystem().broadcastOn( [ Channels.repositionPopups() ], { }));
  };

  const additionalBehaviours = editor.inline ? [ ] : getIframeBehaviours();

  return [
    Focusing.config({ }),
    Docking.config({
      leftAttr: 'data-dock-left',
      topAttr: 'data-dock-top',
      positionAttr: 'data-dock-pos',
      contextual: {
        lazyContext (comp) {
          const headerHeight = Height.getOuter(comp.element());
          const container = editor.inline ? editor.getContentAreaContainer() : editor.getContainer();
          const box = Boxes.box(Element.fromDom(container));
          // Force the header to hide before it overflows outside the container
          const boxHeight = box.height() - headerHeight;
          return Option.some(Boxes.bounds(box.x(), box.y(), box.width(), boxHeight));
        },
        onShow: () => {
          runOnSinkElement((elem) => updateSinkVisibility(elem, true));
        },
        onShown: (comp) => {
          runOnSinkElement((elem) => Classes.remove(elem, [ visibility.transitionClass, visibility.fadeInClass ]));
          // Restore focus and reset the stored focused element
          focusedElm.get().each((elem) => {
            restoreFocus(comp.element(), elem);
            focusedElm.set(Option.none());
          });
        },
        onHide: (comp) => {
          focusedElm.set(findFocusedElem(comp.element(), lazySink));
          runOnSinkElement((elem) => updateSinkVisibility(elem, false));
        },
        onHidden: () => {
          runOnSinkElement((elem) => Classes.remove(elem, [ visibility.transitionClass ]));
        },
        ...visibility
      },
      modes: [ 'top' ],
      onDocked: onDockingSwitch,
      onUndocked: onDockingSwitch
    }),

    ...additionalBehaviours
  ];
};

export {
  setup,
  isDocked,
  getBehaviours
};
