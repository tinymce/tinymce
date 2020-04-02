/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, Boxes, Channels, Docking } from '@ephox/alloy';
import { Cell, Option } from '@ephox/katamari';
import { Body, Css, Element, Height, Location, Width } from '@ephox/sugar';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import {
  getMaxWidthSetting,
  getToolbarMode,
  isStickyToolbar,
  isToolbarLocationTop,
  ToolbarMode,
  useFixedContainer
} from '../../api/Settings';
import { RenderUiComponents } from '../../Render';
import OuterContainer from '../general/OuterContainer';
import * as EditorSize from '../sizing/EditorSize';
import * as Utils from '../sizing/Utils';

export interface InlineHeader {
  isVisible: () => boolean;
  show: () => void;
  hide: () => void;
  update: (resetDocking?: boolean) => void;
  repositionPopups: () => void;
}

export const InlineHeader = (
  editor: Editor,
  targetElm: Element,
  uiComponents: RenderUiComponents,
  floatContainer: Cell<AlloyComponent>
): InlineHeader => {
  const { uiMothership, outerContainer } = uiComponents;
  const DOM = DOMUtils.DOM;
  const useFixedToolbarContainer = useFixedContainer(editor);
  const isSticky = isStickyToolbar(editor);
  const editorMaxWidthOpt = getMaxWidthSetting(editor).or(
    EditorSize.getWidth(editor)
  );

  const toolbarMode = getToolbarMode(editor);
  const isSplitToolbar =
    toolbarMode === ToolbarMode.sliding || toolbarMode === ToolbarMode.floating;
  const isToolbarTop = isToolbarLocationTop(editor);

  const visible = Cell(false);

  const updateChromeWidth = () => {
    // Update the max width of the inline toolbar
    const maxWidth = editorMaxWidthOpt.getOrThunk(() => {
      // No max width, so use the body width, minus the left pos as the maximum
      const bodyMargin = Utils.parseToInt(
        Css.get(Body.body(), 'margin-left')
      ).getOr(0);
      return (
        Width.get(Body.body()) -
        Location.absolute(targetElm).left() +
        bodyMargin
      );
    });
    Css.set(floatContainer.get().element(), 'max-width', maxWidth + 'px');
  };

  const updateChromePosition = (toolbar: Option<AlloyComponent>) => {
    // Calculate the toolbar offset when using a split toolbar drawer
    const offset = isSplitToolbar
      ? toolbar.fold(
          () => 0,
          (tbar) =>
            // If we have an overflow toolbar, we need to offset the positioning by the height of the overflow toolbar
            tbar.components().length > 1
              ? Height.get(tbar.components()[1].element())
              : 0
        )
      : 0;

    // The float container/editor may not have been rendered yet, which will cause it to have a non integer based positions
    // so we need to round this to account for that.
    const targetBounds = Boxes.box(targetElm);
    const top = isToolbarTop
      ? targetBounds.y - Height.get(floatContainer.get().element()) + offset
      : targetBounds.bottom;

    Css.setAll(outerContainer.element(), {
      position: 'absolute',
      top: Math.round(top) + 'px',
      left: Math.round(targetBounds.x) + 'px'
    });
  };

  const repositionPopups = () => {
    uiMothership.broadcastOn([Channels.repositionPopups()], {});
  };

  const updateChromeUi = (resetDocking: boolean = false) => {
    // Handles positioning, docking and SplitToolbar (more drawer) behaviour. Modes:
    // 1. Basic inline: does positioning and docking
    // 2. Inline + more drawer: does positioning, docking and SplitToolbar
    // 3. Inline + fixed_toolbar_container: does nothing
    // 4. Inline + fixed_toolbar_container + more drawer: does SplitToolbar

    // Update the max width, as the body width may have changed
    updateChromeWidth();

    // Refresh split toolbar
    if (isSplitToolbar) {
      OuterContainer.refreshToolbar(outerContainer);
    }

    // Positioning
    if (!useFixedToolbarContainer) {
      const toolbar = OuterContainer.getToolbar(outerContainer);
      updateChromePosition(toolbar);
    }

    // Docking
    if (isSticky) {
      const floatContainerComp = floatContainer.get();
      resetDocking
        ? Docking.reset(floatContainerComp)
        : Docking.refresh(floatContainerComp);
    }

    // Floating toolbar
    repositionPopups();
  };

  const show = () => {
    visible.set(true);
    Css.set(outerContainer.element(), 'display', 'flex');
    DOM.addClass(editor.getBody(), 'mce-edit-focus');
    Css.remove(uiMothership.element(), 'display');
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
    show,
    hide,
    update: updateChromeUi,
    repositionPopups
  };
};
