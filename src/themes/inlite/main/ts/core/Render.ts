/**
 * Render.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Env from 'tinymce/core/api/Env';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Delay from 'tinymce/core/api/util/Delay';
import Arr from '../alien/Arr';
import ElementMatcher from './ElementMatcher';
import Matcher from './Matcher';
import PredicateId from './PredicateId';
import SelectionMatcher from './SelectionMatcher';
import SkinLoader from './SkinLoader';

const getSelectionElements = function (editor) {
  const node = editor.selection.getNode();
  const elms = editor.dom.getParents(node);
  return elms;
};

const createToolbar = function (editor, selector, id, items) {
  const selectorPredicate = function (elm) {
    return editor.dom.is(elm, selector);
  };

  return {
    predicate: selectorPredicate,
    id,
    items
  };
};

const getToolbars = function (editor) {
  const contextToolbars = editor.contextToolbars;

  return Arr.flatten([
    contextToolbars ? contextToolbars : [],
    createToolbar(editor, 'img', 'image', 'alignleft aligncenter alignright')
  ]);
};

const findMatchResult = function (editor, toolbars) {
  let result, elements, contextToolbarsPredicateIds;

  elements = getSelectionElements(editor);
  contextToolbarsPredicateIds = PredicateId.fromContextToolbars(toolbars);

  result = Matcher.match(editor, [
    ElementMatcher.element(elements[0], contextToolbarsPredicateIds),
    SelectionMatcher.textSelection('text'),
    SelectionMatcher.emptyTextBlock(elements, 'insert'),
    ElementMatcher.parent(elements, contextToolbarsPredicateIds)
  ]);

  return result && result.rect ? result : null;
};

const togglePanel = function (editor, panel) {
  const toggle = function () {
    const toolbars = getToolbars(editor);
    const result = findMatchResult(editor, toolbars);

    if (result) {
      panel.show(editor, result.id, result.rect, toolbars);
    } else {
      panel.hide();
    }
  };

  return function () {
    if (!editor.removed) {
      toggle();
    }
  };
};

const repositionPanel = function (editor, panel) {
  return function () {
    const toolbars = getToolbars(editor);
    const result = findMatchResult(editor, toolbars);

    if (result) {
      panel.reposition(editor, result.id, result.rect);
    }
  };
};

const ignoreWhenFormIsVisible = function (editor, panel, f) {
  return function () {
    if (!editor.removed && !panel.inForm()) {
      f();
    }
  };
};

const bindContextualToolbarsEvents = function (editor, panel) {
  const throttledTogglePanel = Delay.throttle(togglePanel(editor, panel), 0);
  const throttledTogglePanelWhenNotInForm = Delay.throttle(ignoreWhenFormIsVisible(editor, panel, togglePanel(editor, panel)), 0);
  const reposition = repositionPanel(editor, panel);

  editor.on('blur hide ObjectResizeStart', panel.hide);
  editor.on('click', throttledTogglePanel);
  editor.on('nodeChange mouseup', throttledTogglePanelWhenNotInForm);
  editor.on('ResizeEditor keyup', throttledTogglePanel);
  editor.on('ResizeWindow', reposition);

  DOMUtils.DOM.bind(Env.container, 'scroll', reposition);
  editor.on('remove', function () {
    DOMUtils.DOM.unbind(Env.container, 'scroll', reposition);
    panel.remove();
  });

  editor.shortcuts.add('Alt+F10,F10', '', panel.focus);
};

const overrideLinkShortcut = function (editor, panel) {
  editor.shortcuts.remove('meta+k');
  editor.shortcuts.add('meta+k', '', function () {
    const toolbars = getToolbars(editor);
    const result = Matcher.match(editor, [
      SelectionMatcher.textSelection('quicklink')
    ]);

    if (result) {
      panel.show(editor, result.id, result.rect, toolbars);
    }
  });
};

const renderInlineUI = function (editor, panel) {
  SkinLoader.load(editor, function () {
    bindContextualToolbarsEvents(editor, panel);
    overrideLinkShortcut(editor, panel);
  });

  return {};
};

const fail = function (message) {
  throw new Error(message);
};

const renderUI = function (editor, panel) {
  return editor.inline ? renderInlineUI(editor, panel) : fail('inlite theme only supports inline mode.');
};

export default {
  renderUI
};