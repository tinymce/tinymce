/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, Boxes, Channels, Docking, VerticalDir } from '@ephox/alloy';
import { Cell, Option } from '@ephox/katamari';
import { Attr, Body, Css, Element, Height, Location, Traverse, Width } from '@ephox/sugar';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import { getMaxWidthSetting, getToolbarLocation, getToolbarMode, isStickyToolbar, ToolbarLocation, ToolbarMode, useFixedContainer } from '../../api/Settings';
import { UiFactoryBackstage } from '../../backstage/Backstage';
import { RenderUiComponents } from '../../Render';
import OuterContainer from '../general/OuterContainer';
import * as EditorSize from '../sizing/EditorSize';
import * as Utils from '../sizing/Utils';

export interface InlineHeader {
  isVisible: () => boolean;
  isPositionedAtTop: () => boolean;
  show: () => void;
  hide: () => void;
  update: (resetDocking?: boolean) => void;
  updateMode: () => void;
  repositionPopups: () => void;
}

export const InlineHeader = (editor: Editor, targetElm: Element, uiComponents: RenderUiComponents, backstage: UiFactoryBackstage, floatContainer: Cell<AlloyComponent>): InlineHeader => {
  const { uiMothership, outerContainer } = uiComponents;
  const DOM = DOMUtils.DOM;
  const useFixedToolbarContainer = useFixedContainer(editor);
  const isSticky = isStickyToolbar(editor);
  const editorMaxWidthOpt = getMaxWidthSetting(editor).or(EditorSize.getWidth(editor));
  const headerBackstage = backstage.shared.header;
  const isPositionedAtTop = headerBackstage.isPositionedAtTop;

  const toolbarMode = getToolbarMode(editor);
  const isSplitToolbar = toolbarMode === ToolbarMode.sliding || toolbarMode === ToolbarMode.floating;

  const visible = Cell(false);

  const isVisible = () => visible.get() && !editor.removed;

  // Calculate the toolbar offset when using a split toolbar drawer
  const calcToolbarOffset = (toolbar: Option<AlloyComponent>) => isSplitToolbar ?
    toolbar.fold(() => 0, (tbar) =>
      // If we have an overflow toolbar, we need to offset the positioning by the height of the overflow toolbar
      tbar.components().length > 1 ? Height.get(tbar.components()[1].element()) : 0
    ) : 0;

  const calcMode = (container: AlloyComponent): 'top' | 'bottom' => {
    switch (getToolbarLocation(editor)) {
      case ToolbarLocation.auto:
        const toolbar = OuterContainer.getToolbar(outerContainer);
        const offset = calcToolbarOffset(toolbar);
        const toolbarHeight = Height.get(container.element()) - offset;
        const targetBounds = Boxes.box(targetElm);

        // Determine if the toolbar has room to render at the top/bottom of the document
        const roomAtTop = targetBounds.y > toolbarHeight;
        if (roomAtTop) {
          return 'top';
        } else {
          const doc = Traverse.documentElement(targetElm);
          const docHeight = Math.max(doc.dom().scrollHeight, Height.get(doc));
          const roomAtBottom = targetBounds.bottom < docHeight - toolbarHeight;

          // If there isn't ever room to add the toolbar above the target element, then place the toolbar at the bottom.
          // Likewise if there's no room at the bottom, then we should show at the top. If there's no room at the bottom
          // or top, then prefer the bottom except when it'll prevent accessing the content at the bottom.
          // Make sure to exclude scroll position, as we want to still show at the top if the user can scroll up to undock
          if (roomAtBottom) {
            return 'bottom';
          } else {
            const winBounds = Boxes.win();
            const isRoomAtBottomViewport = winBounds.bottom < targetBounds.bottom - toolbarHeight;
            return isRoomAtBottomViewport ? 'bottom' : 'top';
          }
        }
      case ToolbarLocation.bottom:
        return 'bottom';
      case ToolbarLocation.top:
      default:
        return 'top';
    }
  };

  const setupMode = (mode: 'top' | 'bottom') => {
    // Update the docking mode
    const container = floatContainer.get();
    Docking.setModes(container, [ mode ]);
    headerBackstage.setDockingMode(mode);

    // Update the vertical menu direction
    const verticalDir = isPositionedAtTop() ? VerticalDir.AttributeValue.TopToBottom : VerticalDir.AttributeValue.BottomToTop;
    Attr.set(container.element(), VerticalDir.Attribute, verticalDir);
  };

  const updateChromeWidth = () => {
    // Update the max width of the inline toolbar
    const maxWidth = editorMaxWidthOpt.getOrThunk(() => {
      // No max width, so use the body width, minus the left pos as the maximum
      const bodyMargin = Utils.parseToInt(Css.get(Body.body(), 'margin-left')).getOr(0);
      return Width.get(Body.body()) - Location.absolute(targetElm).left() + bodyMargin;
    });
    Css.set(floatContainer.get().element(), 'max-width', maxWidth + 'px');
  };

  const updateChromePosition = () => {
    const toolbar = OuterContainer.getToolbar(outerContainer);
    const offset = calcToolbarOffset(toolbar);

    // The float container/editor may not have been rendered yet, which will cause it to have a non integer based positions
    // so we need to round this to account for that.
    const targetBounds = Boxes.box(targetElm);
    const top = isPositionedAtTop() ?
      Math.max(targetBounds.y - Height.get(floatContainer.get().element()) + offset, 0) :
      targetBounds.bottom;

    Css.setAll(outerContainer.element(), {
      position: 'absolute',
      top: Math.round(top) + 'px',
      left: Math.round(targetBounds.x) + 'px'
    });
  };

  const repositionPopups = () => {
    uiMothership.broadcastOn([ Channels.repositionPopups() ], { });
  };

  const updateChromeUi = (resetDocking: boolean = false) => {
    // Skip updating the ui if it's hidden
    if (!isVisible()) {
      return;
    }

    // Handles positioning, docking and SplitToolbar (more drawer) behaviour. Modes:
    // 1. Basic inline: does positioning and docking
    // 2. Inline + more drawer: does positioning, docking and SplitToolbar
    // 3. Inline + fixed_toolbar_container: does nothing
    // 4. Inline + fixed_toolbar_container + more drawer: does SplitToolbar

    // Update the max width, as the body width may have changed
    if (!useFixedToolbarContainer) {
      updateChromeWidth();
    }

    // Refresh split toolbar
    if (isSplitToolbar) {
      OuterContainer.refreshToolbar(outerContainer);
    }

    // Positioning
    if (!useFixedToolbarContainer) {
      updateChromePosition();
    }

    // Docking
    if (isSticky) {
      const floatContainerComp = floatContainer.get();
      resetDocking ? Docking.reset(floatContainerComp) : Docking.refresh(floatContainerComp);
    }

    // Floating toolbar
    repositionPopups();
  };

  const updateMode = (updateUi: boolean = true) => {
    // Skip updating the mode if the toolbar is hidden, is
    // using a fixed container or has sticky toolbars disabled
    if (useFixedToolbarContainer || !isSticky || !isVisible()) {
      return;
    }

    const currentMode = headerBackstage.getDockingMode();
    const newMode = calcMode(floatContainer.get());
    if (newMode !== currentMode) {
      setupMode(newMode);
      if (updateUi) {
        updateChromeUi(true);
      }
    }
  };

  const show = () => {
    visible.set(true);
    Css.set(outerContainer.element(), 'display', 'flex');
    DOM.addClass(editor.getBody(), 'mce-edit-focus');
    Css.remove(uiMothership.element(), 'display');
    updateMode(false);
    updateChromeUi();
  };

  const hide = () => {
    visible.set(false);
    if (uiComponents.outerContainer) {
      Css.set(outerContainer.element(), 'display', 'none');
      DOM.removeClass(editor.getBody(), 'mce-edit-focus');
    }
    Css.set(uiMothership.element(), 'display', 'none');
  };

  return {
    isVisible,
    isPositionedAtTop,
    show,
    hide,
    update: updateChromeUi,
    updateMode,
    repositionPopups
  };
};
