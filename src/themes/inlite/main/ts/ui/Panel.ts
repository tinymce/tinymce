/**
 * Panel.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Factory from 'tinymce/core/api/ui/Factory';
import Tools from 'tinymce/core/api/util/Tools';
import UiContainer from '../alien/UiContainer';
import Events from '../api/Events';
import Settings from '../api/Settings';
import Layout from '../core/Layout';
import Measure from '../core/Measure';
import Forms from './Forms';
import Toolbar from './Toolbar';
import { Editor } from 'tinymce/core/api/Editor';
import { ContextToolbar } from 'tinymce/themes/inlite/core/Render';

export interface InlitePanel {
  show: (editor: Editor, id: string, targetRect, toolbars: ContextToolbar[]) => void;
  showForm: (editor: Editor, id: string) => void;
  reposition: (editor: Editor, id: string, targetRect) => void;
  inForm: () => boolean;
  hide: () => void;
  focus: () => void;
  remove: () => void;
}

export const create = (): InlitePanel => {
  let panel, currentRect;

  const createToolbars = function (editor: Editor, toolbars: ContextToolbar[]) {
    return Tools.map(toolbars, function (toolbar: ContextToolbar) {
      return Toolbar.create(editor, toolbar.id, toolbar.items);
    });
  };

  const hasToolbarItems = function (toolbar) {
    return toolbar.items().length > 0;
  };

  const create = function (editor: Editor, toolbars: ContextToolbar[]) {
    const items = createToolbars(editor, toolbars).concat([
      Toolbar.create(editor, 'text', Settings.getTextSelectionToolbarItems(editor)),
      Toolbar.create(editor, 'insert', Settings.getInsertToolbarItems(editor)),
      Forms.createQuickLinkForm(editor, hide)
    ]);

    return Factory.create({
      type: 'floatpanel',
      role: 'dialog',
      classes: 'tinymce tinymce-inline arrow',
      ariaLabel: 'Inline toolbar',
      layout: 'flex',
      direction: 'column',
      align: 'stretch',
      autohide: false,
      autofix: true,
      fixed: true,
      border: 1,
      items: Tools.grep(items, hasToolbarItems),
      oncancel () {
        editor.focus();
      }
    });
  };

  const showPanel = function (panel) {
    if (panel) {
      panel.show();
    }
  };

  const movePanelTo = function (panel, pos) {
    panel.moveTo(pos.x, pos.y);
  };

  const togglePositionClass = function (panel, relPos) {
    relPos = relPos ? relPos.substr(0, 2) : '';

    Tools.each({
      t: 'down',
      b: 'up',
      c: 'center'
    }, function (cls, pos) {
      panel.classes.toggle('arrow-' + cls, pos === relPos.substr(0, 1));
    });

    if (relPos === 'cr') {
      panel.classes.toggle('arrow-left', true);
      panel.classes.toggle('arrow-right', false);
    } else if (relPos === 'cl') {
      panel.classes.toggle('arrow-left', false);
      panel.classes.toggle('arrow-right', true);
    } else {
      Tools.each({
        l: 'left',
        r: 'right'
      }, function (cls, pos) {
        panel.classes.toggle('arrow-' + cls, pos === relPos.substr(1, 1));
      });
    }
  };

  const showToolbar = function (panel, id) {
    const toolbars = panel.items().filter('#' + id);

    if (toolbars.length > 0) {
      toolbars[0].show();
      panel.reflow();
      return true;
    }

    return false;
  };

  const repositionPanelAt = function (panel, id, editor, targetRect) {
    let contentAreaRect, panelRect, result, userConstainHandler;

    userConstainHandler = Settings.getPositionHandler(editor);
    contentAreaRect = Measure.getContentAreaRect(editor);
    panelRect = DOMUtils.DOM.getRect(panel.getEl());

    if (id === 'insert') {
      result = Layout.calcInsert(targetRect, contentAreaRect, panelRect);
    } else {
      result = Layout.calc(targetRect, contentAreaRect, panelRect);
    }

    if (result) {
      const delta = UiContainer.getUiContainerDelta().getOr({ x: 0, y: 0 });
      const transposedPanelRect = { x: result.rect.x - delta.x, y: result.rect.y - delta.y, w: result.rect.w, h: result.rect.h };
      currentRect = targetRect;
      movePanelTo(panel, Layout.userConstrain(userConstainHandler, targetRect, contentAreaRect, transposedPanelRect));
      togglePositionClass(panel, result.position);
      return true;
    } else {
      return false;
    }
  };

  const showPanelAt = function (panel, id, editor, targetRect) {
    showPanel(panel);
    panel.items().hide();

    if (!showToolbar(panel, id)) {
      hide();
      return;
    }

    if (repositionPanelAt(panel, id, editor, targetRect) === false) {
      hide();
    }
  };

  const hasFormVisible = function () {
    return panel.items().filter('form:visible').length > 0;
  };

  const showForm = function (editor: Editor, id) {
    if (panel) {
      panel.items().hide();

      if (!showToolbar(panel, id)) {
        hide();
        return;
      }

      let contentAreaRect, panelRect, result, userConstainHandler;

      showPanel(panel);
      panel.items().hide();
      showToolbar(panel, id);

      userConstainHandler = Settings.getPositionHandler(editor);
      contentAreaRect = Measure.getContentAreaRect(editor);
      panelRect = DOMUtils.DOM.getRect(panel.getEl());

      result = Layout.calc(currentRect, contentAreaRect, panelRect);

      if (result) {
        panelRect = result.rect;
        movePanelTo(panel, Layout.userConstrain(userConstainHandler, currentRect, contentAreaRect, panelRect));
        togglePositionClass(panel, result.position);
      }
    }
  };

  const show = function (editor: Editor, id: string, targetRect, toolbars) {
    if (!panel) {
      Events.fireBeforeRenderUI(editor);
      panel = create(editor, toolbars);
      panel.renderTo().reflow().moveTo(targetRect.x, targetRect.y);
      editor.nodeChanged();
    }

    showPanelAt(panel, id, editor, targetRect);
  };

  const reposition = function (editor: Editor, id: string, targetRect) {
    if (panel) {
      repositionPanelAt(panel, id, editor, targetRect);
    }
  };

  const hide = function () {
    if (panel) {
      panel.hide();
    }
  };

  const focus = function () {
    if (panel) {
      panel.find('toolbar:visible').eq(0).each(function (item) {
        item.focus(true);
      });
    }
  };

  const remove = function () {
    if (panel) {
      panel.remove();
      panel = null;
    }
  };

  const inForm = function () {
    return panel && panel.visible() && hasFormVisible();
  };

  return {
    show,
    showForm,
    reposition,
    inForm,
    hide,
    focus,
    remove
  };
};