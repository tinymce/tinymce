/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, Boxes, Channels, Docking, Focusing, Receiving } from '@ephox/alloy';
import { HTMLElement } from '@ephox/dom-globals';
import { Cell, Option, Result } from '@ephox/katamari';
import { Class, Classes, Compare, Css, Element, Focus, Height, Location, Scroll, Traverse, Visibility, Width } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { ScrollIntoViewEvent } from 'tinymce/core/api/EventTypes';
import { isToolbarLocationTop } from '../../api/Settings';
import * as EditorChannels from '../../Channels';

const visibility = {
  fadeInClass: 'tox-editor-dock-fadein',
  fadeOutClass: 'tox-editor-dock-fadeout',
  transitionClass: 'tox-editor-dock-transition'
};

const editorStickyOnClass = 'tox-tinymce--toolbar-sticky-on';
const editorStickyOffClass = 'tox-tinymce--toolbar-sticky-off';

const scrollFromBehindHeader = (e: ScrollIntoViewEvent, containerHeader: Element) => {
  const doc = Traverse.owner(containerHeader);
  const viewHeight = doc.dom().defaultView.innerHeight;
  const scrollPos = Scroll.get(doc);

  const markerElement = Element.fromDom(e.elm);
  const markerPos = Boxes.absolute(markerElement);
  const markerHeight = Height.get(markerElement);
  const markerTop = markerPos.y();
  const markerBottom = markerTop + markerHeight;

  const editorHeaderPos = Location.absolute(containerHeader);
  const editorHeaderHeight = Height.get(containerHeader);
  const editorHeaderTop = editorHeaderPos.top();
  const editorHeaderBottom = editorHeaderTop + editorHeaderHeight;

  // Check to see if the header is docked to the top/bottom of the page (eg is floating)
  const editorHeaderDockedAtTop = Math.abs(editorHeaderTop - scrollPos.top()) < 2;
  const editorHeaderDockedAtBottom = Math.abs(editorHeaderBottom - (scrollPos.top() + viewHeight)) < 2;

  // If the element is behind the header at the top of the page, then
  // scroll the element down by the header height
  if (editorHeaderDockedAtTop && markerTop < editorHeaderBottom) {
    Scroll.to(scrollPos.left(), markerTop - editorHeaderHeight, doc);
    // If the element is behind the header at the bottom of the page, then
    // scroll the element up by the header height
  } else if (editorHeaderDockedAtBottom && markerBottom > editorHeaderTop) {
    const y = (markerTop - viewHeight) + markerHeight + editorHeaderHeight;
    Scroll.to(scrollPos.left(), y, doc);
  }
};

const updateIframeContentFlow = (header: AlloyComponent, isToolbarTop: boolean): void => {
  const getOccupiedHeight = (elm: Element<HTMLElement>) => {
    return Height.getOuter(elm) +
      (parseInt(Css.get(elm, 'margin-top'), 10) || 0) +
      (parseInt(Css.get(elm, 'margin-bottom'), 10) || 0) ;
  };

  const elm = header.element();
  Traverse.parent(elm).each((parentElem: Element<HTMLElement>) => {
    const padding = 'padding-' + (isToolbarTop ? 'top' : 'bottom');

    if (Docking.isDocked(header)) {
      const parentWidth = Width.get(parentElem);
      Css.set(elm, 'width', parentWidth + 'px');
      Css.set(parentElem, padding, getOccupiedHeight(elm) + 'px');
    } else {
      Css.remove(elm, 'width');
      Css.remove(parentElem, padding);
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
    // If using bottom toolbar then when the editor resizes we need to reset docking
    // otherwise it won't know the original toolbar position has moved
    if (!isToolbarLocationTop(editor)) {
      editor.on('ResizeEditor', () => {
        lazyHeader().each(Docking.reset);
      });
    }

    // No need to update the content flow in inline mode as the header always floats
    editor.on('ResizeWindow ResizeEditor', () => {
      lazyHeader().each((header) => updateIframeContentFlow(header, isToolbarLocationTop(editor)));
    });

    // Need to reset the docking position on skin loaded as the original position will have
    // changed due the skins styles being applied.
    // Note: Inline handles it's own skin loading, as it needs to do other initial positioning
    editor.on('SkinLoaded', () => {
      lazyHeader().each((comp) => {
        Docking.isDocked(comp) ? Docking.reset(comp) : Docking.refresh(comp);
      });
    });

    // Need to reset when we go fullscreen so that if the header is docked,
    // then it'll undock and viceversa
    editor.on('FullscreenStateChanged', () => {
      lazyHeader().each(Docking.reset);
    });
  }

  // If inline or sticky toolbars is enabled, then when scrolling into view we may still be
  // behind the editor header so we need to adjust the scroll position to account for that
  editor.on('AfterScrollIntoView', (e) => {
    lazyHeader().each((header) => {
      // We need to make sure the header docking has refreshed, otherwise if a large scroll occurred
      // the header may have gone off page and need to be docked before doing calculations
      Docking.refresh(header);

      // If the header element is still visible, then adjust the scroll position if required
      const headerElem = header.element();
      if (Visibility.isVisible(headerElem)) {
        scrollFromBehindHeader(e, headerElem);
      }
    });
  });

  // Update the editor classes once initial rendering has completed
  editor.on('PostRender', () => {
    updateEditorClasses(editor, false);
  });
};

const isDocked = (lazyHeader: () => Option<AlloyComponent>): boolean => {
  return lazyHeader().map(Docking.isDocked).getOr(false);
};

const getIframeBehaviours = (isToolbarTop: boolean) => {
  return [
    Receiving.config({
      channels: {
        [ EditorChannels.toolbarHeightChange() ]: {
          onReceive: (comp) => {
            updateIframeContentFlow(comp, isToolbarTop);
          }
        }
      }
    })
  ];
};

const getBehaviours = (editor: Editor, lazySink: () => Result<AlloyComponent, Error>) => {
  const focusedElm = Cell<Option<Element>>(Option.none());
  const isToolbarTop = isToolbarLocationTop(editor);

  const runOnSinkElement = (f: (sink: Element) => void) => {
    lazySink().each((sink) => f(sink.element()));
  };

  const onDockingSwitch = (comp: AlloyComponent) => {
    if (!editor.inline) {
      updateIframeContentFlow(comp, isToolbarTop);
    }
    updateEditorClasses(editor, Docking.isDocked(comp));
    comp.getSystem().broadcastOn( [ Channels.repositionPopups() ], { });
    lazySink().each((sink) => sink.getSystem().broadcastOn( [ Channels.repositionPopups() ], { }));
  };

  const additionalBehaviours = editor.inline ? [ ] : getIframeBehaviours(isToolbarTop);

  return [
    Focusing.config({ }),
    Docking.config({
      contextual: {
        lazyContext (comp) {
          const headerHeight = Height.getOuter(comp.element());
          const container = editor.inline ? editor.getContentAreaContainer() : editor.getContainer();
          const box = Boxes.box(Element.fromDom(container));
          // Force the header to hide before it overflows outside the container
          const boxHeight = box.height() - headerHeight;
          const topBound = box.y() + (isToolbarTop ? 0 : headerHeight);
          return Option.some(Boxes.bounds(box.x(), topBound, box.width(), boxHeight));
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
      modes: [ isToolbarTop ? 'top' : 'bottom' ],
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
