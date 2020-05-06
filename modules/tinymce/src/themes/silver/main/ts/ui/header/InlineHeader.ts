/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, Boxes, Channels, Docking, VerticalDir } from '@ephox/alloy';
import { Cell, Option } from '@ephox/katamari';
import { Attr, Body, Css, Element, Height, Location, Width } from '@ephox/sugar';

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

  // Calculate the toolbar offset when using a split toolbar drawer
  const calcToolbarOffset = (toolbar: Option<AlloyComponent>) => isSplitToolbar ?
    toolbar.fold(() => 0, (tbar) =>
      // If we have an overflow toolbar, we need to offset the positioning by the height of the overflow toolbar
      tbar.components().length > 1 ? Height.get(tbar.components()[1].element()) : 0
    ) : 0;

  const calcMode = (container: AlloyComponent): 'top' | 'bottom' => {
    const toolbar = OuterContainer.getToolbar(outerContainer);
    const offset = calcToolbarOffset(toolbar);
    const targetBounds = Boxes.box(targetElm);

    switch (getToolbarLocation(editor)) {
      case ToolbarLocation.auto:
        const toolbarHeight = Height.get(container.element()) - offset;

        // If there isn't ever room to add the toolbar above the target element, then place the toolbar at the bottom
        // Make sure to exclude scroll position, as we want to still show at the top if the user can scroll up to undock
        if (toolbarHeight > targetBounds.y) {
          return 'bottom';
        } else {
          return 'top';
        }
      case ToolbarLocation.bottom:
        return 'bottom';
      case ToolbarLocation.top:
      default:
        return 'top';
    }
  };

  const initMode = () => {
    // Ignore setting up the mode if using a fixed container or sticky toolbars is disabled
    if (useFixedToolbarContainer || !isSticky) {
      return;
    }

    const container = floatContainer.get();
    const mode = calcMode(container);

    // Update the docking mode
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
      targetBounds.y - Height.get(floatContainer.get().element()) + offset :
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

  const show = () => {
    visible.set(true);
    Css.set(outerContainer.element(), 'display', 'flex');
    DOM.addClass(editor.getBody(), 'mce-edit-focus');
    Css.remove(uiMothership.element(), 'display');
    initMode();
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
    isVisible: () => visible.get() && !editor.removed,
    isPositionedAtTop,
    show,
    hide,
    update: updateChromeUi,
    repositionPopups
  };
};
