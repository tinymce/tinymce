/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, Attachment, Boxes, Channels, Docking } from '@ephox/alloy';
import { Cell, Option } from '@ephox/katamari';
import { Body, Css, Element, Height, Width } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';
import { getMaxWidthSetting, getToolbarMode, getUiContainer, isStickyToolbar, isToolbarLocationTop, useFixedContainer, ToolbarMode } from '../api/Settings';
import { UiFactoryBackstage } from '../backstage/Backstage';
import { setupReadonlyModeSwitch } from '../ReadOnly';
import { ModeRenderInfo, RenderArgs, RenderUiComponents, RenderUiConfig } from '../Render';
import OuterContainer from '../ui/general/OuterContainer';
import { identifyMenus } from '../ui/menus/menubar/Integration';
import * as EditorSize from '../ui/sizing/EditorSize';
import Utils from '../ui/sizing/Utils';
import { inline as loadInlineSkin } from './../ui/skin/Loader';
import { setToolbar } from './Toolbars';

const getTargetPosAndHeight = (targetElm: Element, isToolbarTop: boolean) => {
  const pos = Boxes.box(targetElm);
  return {
    pos: isToolbarTop ? pos.y() : pos.bottom(),
    height: pos.height()
  };
};

const render = (editor: Editor, uiComponents: RenderUiComponents, rawUiConfig: RenderUiConfig, backstage: UiFactoryBackstage, args: RenderArgs): ModeRenderInfo => {
  const { mothership, uiMothership, outerContainer } = uiComponents;
  let floatContainer;
  const DOM = DOMUtils.DOM;
  const useFixedToolbarContainer = useFixedContainer(editor);
  const isSticky = isStickyToolbar(editor);
  const targetElm = Element.fromDom(args.targetNode);
  const editorMaxWidthOpt = getMaxWidthSetting(editor).or(EditorSize.getWidth(editor));

  const toolbarMode = getToolbarMode(editor);
  const isSplitToolbar = toolbarMode === ToolbarMode.sliding || toolbarMode === ToolbarMode.floating;
  const isToolbarTop = isToolbarLocationTop(editor);

  const prevPosAndHeight = Cell(getTargetPosAndHeight(targetElm, isToolbarTop));
  const visible = Cell(false);

  loadInlineSkin(editor);

  const updateChromePosition = (toolbar: Option<AlloyComponent>) => {
    // Calculate the toolbar offset when using a split toolbar drawer
    const offset = isSplitToolbar ? toolbar.fold(() => 0, (tbar) => {
      // If we have an overflow toolbar, we need to offset the positioning by the height of the overflow toolbar
      return tbar.components().length > 1 ? Height.get(tbar.components()[1].element()) : 0;
    }) : 0;

    // The float container/editor may not have been rendered yet, which will cause it to have a non integer based positions
    // so we need to round this to account for that.
    const targetBounds = Boxes.box(targetElm);
    const top = isToolbarTop ?
      targetBounds.y() - Height.get(floatContainer.element()) + offset :
      targetBounds.bottom();

    Css.setAll(outerContainer.element(), {
      position: 'absolute',
      top: Math.round(top) + 'px',
      left: Math.round(targetBounds.x()) + 'px'
    });

    // Update the max width of the inline toolbar
    const maxWidth = editorMaxWidthOpt.getOrThunk(() => {
      // No max width, so use the body width, minus the left pos as the maximum
      const bodyMargin = Utils.parseToInt(Css.get(Body.body(), 'margin-left')).getOr(0);
      return Width.get(Body.body()) - targetBounds.x() + bodyMargin;
    });
    Css.set(floatContainer.element(), 'max-width', maxWidth + 'px');
  };

  const repositionFloatingUiComponents = () => {
    uiMothership.broadcastOn([ Channels.repositionPopups() ], { });
  };

  const updateChromeUi = (resetDocking: boolean = false) => {
    // Handles positioning, docking and SplitToolbar (more drawer) behaviour. Modes:
    // 1. Basic inline: does positioning and docking
    // 2. Inline + more drawer: does positioning, docking and SplitToolbar
    // 3. Inline + fixed_toolbar_container: does nothing
    // 4. Inline + fixed_toolbar_container + more drawer: does SplitToolbar

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
      resetDocking ? Docking.reset(floatContainer) : Docking.refresh(floatContainer);
    }

    // Floating toolbar
    repositionFloatingUiComponents();
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

  const render = () => {
    if (floatContainer) {
      show();
      return;
    }

    floatContainer = OuterContainer.getHeader(outerContainer).getOrDie();

    const uiContainer = getUiContainer(editor);
    Attachment.attachSystem(uiContainer, mothership);
    Attachment.attachSystem(uiContainer, uiMothership);

    setToolbar(editor, uiComponents, rawUiConfig, backstage);

    OuterContainer.setMenubar(
      outerContainer,
      identifyMenus(editor, rawUiConfig)
    );

    // Initialise the toolbar - set initial positioning then show
    show();

    editor.on('activate', show);
    editor.on('deactivate', hide);

    editor.on('SkinLoaded ResizeWindow', () => {
      if (visible.get()) {
        updateChromeUi(true);
      }
    });

    editor.on('NodeChange keydown', () => {
      Delay.requestAnimationFrame(() => {
        const posAndHeight = getTargetPosAndHeight(targetElm, isToolbarTop);
        const prev = prevPosAndHeight.get();

        if (visible.get()) {
          if (posAndHeight.pos !== prev.pos) {
            updateChromeUi(true);
            prevPosAndHeight.set(posAndHeight);
          } else if (posAndHeight.height !== prev.height) {
            repositionFloatingUiComponents();
            prevPosAndHeight.set(posAndHeight);
          }
        }
      });
    });

    editor.nodeChanged();
  };

  editor.on('focus', render);
  editor.on('blur hide', hide);

  editor.on('init', () => {
    if (editor.hasFocus()) {
      render();
    }
  });

  setupReadonlyModeSwitch(editor, uiComponents);

  return {
    editorContainer: outerContainer.element().dom()
  };
};

export default { render };
