/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Factory from 'tinymce/core/api/ui/Factory';
import Events from '../api/Events';
import * as Settings from '../api/Settings';
import A11y from '../ui/A11y';
import ContextToolbars from '../ui/ContextToolbars';
import Menubar from '../ui/Menubar';
import SkinLoaded from '../ui/SkinLoaded';
import Toolbar from '../ui/Toolbar';
import FloatPanel from 'tinymce/ui/FloatPanel';
import UiContainer from 'tinymce/ui/UiContainer';

const isFixed = function (inlineToolbarContainer, editor) {
  return !!(inlineToolbarContainer && !editor.settings.ui_container);
};

const render = function (editor, theme, args) {
  let panel, inlineToolbarContainer;
  const DOM = DOMUtils.DOM;

  const fixedToolbarContainer = Settings.getFixedToolbarContainer(editor);
  if (fixedToolbarContainer) {
    inlineToolbarContainer = DOM.select(fixedToolbarContainer)[0];
  }

  const reposition = function () {
    if (panel && panel.moveRel && panel.visible() && !panel._fixed) {
      // TODO: This is kind of ugly and doesn't handle multiple scrollable elements
      const scrollContainer = editor.selection.getScrollContainer(), body = editor.getBody();
      let deltaX = 0, deltaY = 0;

      if (scrollContainer) {
        const bodyPos = DOM.getPos(body), scrollContainerPos = DOM.getPos(scrollContainer);

        deltaX = Math.max(0, scrollContainerPos.x - bodyPos.x);
        deltaY = Math.max(0, scrollContainerPos.y - bodyPos.y);
      }

      panel.fixed(false).moveRel(body, editor.rtl ? ['tr-br', 'br-tr'] : ['tl-bl', 'bl-tl', 'tr-br']).moveBy(deltaX, deltaY);
    }
  };

  const show = function () {
    if (panel) {
      panel.show();
      reposition();
      DOM.addClass(editor.getBody(), 'mce-edit-focus');
    }
  };

  const hide = function () {
    if (panel) {
      // We require two events as the inline float panel based toolbar does not have autohide=true
      panel.hide();

      // All other autohidden float panels will be closed below.
      FloatPanel.hideAll();

      DOM.removeClass(editor.getBody(), 'mce-edit-focus');
    }
  };

  const render = function () {
    if (panel) {
      if (!panel.visible()) {
        show();
      }

      return;
    }

    // Render a plain panel inside the inlineToolbarContainer if it's defined
    panel = theme.panel = Factory.create({
      type: inlineToolbarContainer ? 'panel' : 'floatpanel',
      role: 'application',
      classes: 'tinymce tinymce-inline',
      layout: 'flex',
      direction: 'column',
      align: 'stretch',
      autohide: false,
      autofix: true,
      fixed: isFixed(inlineToolbarContainer, editor),
      border: 1,
      items: [
        Settings.hasMenubar(editor) === false ? null : { type: 'menubar', border: '0 0 1 0', items: Menubar.createMenuButtons(editor) },
        Toolbar.createToolbars(editor, Settings.getToolbarSize(editor))
      ]
    });

    UiContainer.setUiContainer(editor, panel);

    // Add statusbar
    /*if (settings.statusbar !== false) {
      panel.add({type: 'panel', classes: 'statusbar', layout: 'flow', border: '1 0 0 0', items: [
        {type: 'elementpath'}
      ]});
    }*/

    Events.fireBeforeRenderUI(editor);

    if (inlineToolbarContainer) {
      panel.renderTo(inlineToolbarContainer).reflow();
    } else {
      panel.renderTo().reflow();
    }

    A11y.addKeys(editor, panel);
    show();
    ContextToolbars.addContextualToolbars(editor);

    editor.on('nodeChange', reposition);
    editor.on('ResizeWindow', reposition);
    editor.on('activate', show);
    editor.on('deactivate', hide);

    editor.nodeChanged();
  };

  editor.settings.content_editable = true;

  editor.on('focus', function () {
    // Render only when the CSS file has been loaded
    if (Settings.isSkinDisabled(editor) === false && args.skinUiCss) {
      DOM.styleSheetLoader.load(args.skinUiCss, render, render);
    } else {
      render();
    }
  });

  editor.on('blur hide', hide);

  // Remove the panel when the editor is removed
  editor.on('remove', function () {
    if (panel) {
      panel.remove();
      panel = null;
    }
  });

  // Preload skin css
  if (Settings.isSkinDisabled(editor) === false && args.skinUiCss) {
    DOM.styleSheetLoader.load(args.skinUiCss, SkinLoaded.fireSkinLoaded(editor));
  } else {
    SkinLoaded.fireSkinLoaded(editor)();
  }

  return {};
};

export default {
  render
};