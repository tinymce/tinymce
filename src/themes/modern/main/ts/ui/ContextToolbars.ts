/**
 * ContextToolbars.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Rect from 'tinymce/core/api/geom/Rect';
import Factory from 'tinymce/core/api/ui/Factory';
import Delay from 'tinymce/core/api/util/Delay';
import Tools from 'tinymce/core/api/util/Tools';
import UiContainer from 'tinymce/ui/UiContainer';
import * as Settings from '../api/Settings';
import Toolbar from './Toolbar';

const DOM = DOMUtils.DOM;

const toClientRect = function (geomRect) {
  return {
    left: geomRect.x,
    top: geomRect.y,
    width: geomRect.w,
    height: geomRect.h,
    right: geomRect.x + geomRect.w,
    bottom: geomRect.y + geomRect.h
  };
};

const hideAllFloatingPanels = function (editor) {
  Tools.each(editor.contextToolbars, function (toolbar) {
    if (toolbar.panel) {
      toolbar.panel.hide();
    }
  });
};

const movePanelTo = function (panel, pos) {
  panel.moveTo(pos.left, pos.top);
};

const togglePositionClass = function (panel, relPos, predicate) {
  relPos = relPos ? relPos.substr(0, 2) : '';

  Tools.each({
    t: 'down',
    b: 'up'
  }, function (cls, pos) {
    panel.classes.toggle('arrow-' + cls, predicate(pos, relPos.substr(0, 1)));
  });

  Tools.each({
    l: 'left',
    r: 'right'
  }, function (cls, pos) {
    panel.classes.toggle('arrow-' + cls, predicate(pos, relPos.substr(1, 1)));
  });
};

const userConstrain = function (handler, x, y, elementRect, contentAreaRect, panelRect) {
  panelRect = toClientRect({ x, y, w: panelRect.w, h: panelRect.h });

  if (handler) {
    panelRect = handler({
      elementRect: toClientRect(elementRect),
      contentAreaRect: toClientRect(contentAreaRect),
      panelRect
    });
  }

  return panelRect;
};

const addContextualToolbars = function (editor) {
  let scrollContainer;

  const getContextToolbars = function () {
    return editor.contextToolbars || [];
  };

  const getElementRect = function (elm) {
    let pos, targetRect, root;

    pos = DOM.getPos(editor.getContentAreaContainer());
    targetRect = editor.dom.getRect(elm);
    root = editor.dom.getRoot();

    // Adjust targetPos for scrolling in the editor
    if (root.nodeName === 'BODY') {
      targetRect.x -= root.ownerDocument.documentElement.scrollLeft || root.scrollLeft;
      targetRect.y -= root.ownerDocument.documentElement.scrollTop || root.scrollTop;
    }

    targetRect.x += pos.x;
    targetRect.y += pos.y;

    return targetRect;
  };

  const reposition = function (match, shouldShow?) {
    let relPos, panelRect, elementRect, contentAreaRect, panel, relRect, testPositions, smallElementWidthThreshold;
    const handler = Settings.getInlineToolbarPositionHandler(editor);

    if (editor.removed) {
      return;
    }

    if (!match || !match.toolbar.panel) {
      hideAllFloatingPanels(editor);
      return;
    }

    testPositions = [
      'bc-tc', 'tc-bc',
      'tl-bl', 'bl-tl',
      'tr-br', 'br-tr'
    ];

    panel = match.toolbar.panel;

    // Only show the panel on some events not for example nodeChange since that fires when context menu is opened
    if (shouldShow) {
      panel.show();
    }

    elementRect = getElementRect(match.element);
    panelRect = DOM.getRect(panel.getEl());
    contentAreaRect = DOM.getRect(editor.getContentAreaContainer() || editor.getBody());

    const delta = UiContainer.getUiContainerDelta(panel).getOr({ x: 0, y: 0 });
    elementRect.x += delta.x;
    elementRect.y += delta.y;
    panelRect.x += delta.x;
    panelRect.y += delta.y;
    contentAreaRect.x += delta.x;
    contentAreaRect.y += delta.y;

    smallElementWidthThreshold = 25;

    if (DOM.getStyle(match.element, 'display', true) !== 'inline') {
      // We need to use these instead of the rect values since the style
      // size properites might not be the same as the real size for a table if it has a caption
      const clientRect = match.element.getBoundingClientRect();
      elementRect.w = clientRect.width;
      elementRect.h = clientRect.height;
    }

    if (!editor.inline) {
      contentAreaRect.w = editor.getDoc().documentElement.offsetWidth;
    }

    // Inflate the elementRect so it doesn't get placed above resize handles
    if (editor.selection.controlSelection.isResizable(match.element) && elementRect.w < smallElementWidthThreshold) {
      elementRect = Rect.inflate(elementRect, 0, 8);
    }

    relPos = Rect.findBestRelativePosition(panelRect, elementRect, contentAreaRect, testPositions);
    elementRect = Rect.clamp(elementRect, contentAreaRect);

    if (relPos) {
      relRect = Rect.relativePosition(panelRect, elementRect, relPos);
      movePanelTo(panel, userConstrain(handler, relRect.x, relRect.y, elementRect, contentAreaRect, panelRect));
    } else {
      // Allow overflow below the editor to avoid placing toolbars ontop of tables
      contentAreaRect.h += panelRect.h;

      elementRect = Rect.intersect(contentAreaRect, elementRect);
      if (elementRect) {
        relPos = Rect.findBestRelativePosition(panelRect, elementRect, contentAreaRect, [
          'bc-tc', 'bl-tl', 'br-tr'
        ]);

        if (relPos) {
          relRect = Rect.relativePosition(panelRect, elementRect, relPos);
          movePanelTo(panel, userConstrain(handler, relRect.x, relRect.y, elementRect, contentAreaRect, panelRect));
        } else {
          movePanelTo(panel, userConstrain(handler, elementRect.x, elementRect.y, elementRect, contentAreaRect, panelRect));
        }
      } else {
        panel.hide();
      }
    }

    togglePositionClass(panel, relPos, function (pos1, pos2) {
      return pos1 === pos2;
    });

    // drawRect(contentAreaRect, 'blue');
    // drawRect(elementRect, 'red');
    // drawRect(panelRect, 'green');
  };

  const repositionHandler = function (show) {
    return function () {
      const execute = function () {
        if (editor.selection) {
          reposition(findFrontMostMatch(editor.selection.getNode()), show);
        }
      };

      Delay.requestAnimationFrame(execute);
    };
  };

  const bindScrollEvent = function (panel) {
    if (!scrollContainer) {
      const reposition = repositionHandler(true);
      const uiContainer = UiContainer.getUiContainer(panel);

      scrollContainer = editor.selection.getScrollContainer() || editor.getWin();
      DOM.bind(scrollContainer, 'scroll', reposition);
      DOM.bind(uiContainer, 'scroll', reposition);

      editor.on('remove', function () {
        DOM.unbind(scrollContainer, 'scroll', reposition);
        DOM.unbind(uiContainer, 'scroll', reposition);
      });
    }
  };

  const showContextToolbar = function (match) {
    let panel;

    if (match.toolbar.panel) {
      match.toolbar.panel.show();
      reposition(match);
      return;
    }

    panel = Factory.create({
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
      items: Toolbar.createToolbar(editor, match.toolbar.items),
      oncancel () {
        editor.focus();
      }
    });

    UiContainer.setUiContainer(editor, panel);
    bindScrollEvent(panel);

    match.toolbar.panel = panel;
    panel.renderTo().reflow();
    reposition(match);
  };

  const hideAllContextToolbars = function () {
    Tools.each(getContextToolbars(), function (toolbar) {
      if (toolbar.panel) {
        toolbar.panel.hide();
      }
    });
  };

  const findFrontMostMatch = function (targetElm) {
    let i, y, parentsAndSelf;
    const toolbars = getContextToolbars();

    parentsAndSelf = editor.$(targetElm).parents().add(targetElm);
    for (i = parentsAndSelf.length - 1; i >= 0; i--) {
      for (y = toolbars.length - 1; y >= 0; y--) {
        if (toolbars[y].predicate(parentsAndSelf[i])) {
          return {
            toolbar: toolbars[y],
            element: parentsAndSelf[i]
          };
        }
      }
    }

    return null;
  };

  editor.on('click keyup setContent ObjectResized', function (e) {
    // Only act on partial inserts
    if (e.type === 'setcontent' && !e.selection) {
      return;
    }

    // Needs to be delayed to avoid Chrome img focus out bug
    Delay.setEditorTimeout(editor, function () {
      let match;

      match = findFrontMostMatch(editor.selection.getNode());
      if (match) {
        hideAllContextToolbars();
        showContextToolbar(match);
      } else {
        hideAllContextToolbars();
      }
    });
  });

  editor.on('blur hide contextmenu', hideAllContextToolbars);

  editor.on('ObjectResizeStart', function () {
    const match = findFrontMostMatch(editor.selection.getNode());

    if (match && match.toolbar.panel) {
      match.toolbar.panel.hide();
    }
  });

  editor.on('ResizeEditor ResizeWindow', repositionHandler(true));
  editor.on('nodeChange', repositionHandler(false));

  editor.on('remove', function () {
    Tools.each(getContextToolbars(), function (toolbar) {
      if (toolbar.panel) {
        toolbar.panel.remove();
      }
    });

    editor.contextToolbars = {};
  });

  editor.shortcuts.add('ctrl+shift+e > ctrl+shift+p', '', function () {
    const match = findFrontMostMatch(editor.selection.getNode());
    if (match && match.toolbar.panel) {
      match.toolbar.panel.items()[0].focus();
    }
  });
};

export default {
  addContextualToolbars
};