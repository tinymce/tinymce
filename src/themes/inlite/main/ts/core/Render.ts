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
import { Editor } from 'tinymce/core/api/Editor';
import { InlitePanel } from 'tinymce/themes/inlite/ui/Panel';
import { document } from '@ephox/dom-globals';

const getSelectionElements = function (editor: Editor) {
  const node = editor.selection.getNode();
  const elms = editor.dom.getParents(node, '*');
  return elms;
};

export interface ContextToolbar {
  predicate: (elm) => boolean;
  id: string;
  items: string | string[];
}

const createToolbar = function (editor: Editor, selector: string, id: string, items: string | string[]): ContextToolbar {
  const selectorPredicate = function (elm) {
    return editor.dom.is(elm, selector);
  };

  return {
    predicate: selectorPredicate,
    id,
    items
  };
};

const getToolbars = function (editor: Editor): ContextToolbar[] {
  const contextToolbars = editor.contextToolbars;

  return Arr.flatten([
    contextToolbars ? contextToolbars : [],
    createToolbar(editor, 'img', 'image', 'alignleft aligncenter alignright')
  ]);
};

const findMatchResult = function (editor: Editor, toolbars: ContextToolbar[]) {
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

const editorHasFocus = (editor: Editor) => document.activeElement === editor.getBody();

const togglePanel = function (editor: Editor, panel: InlitePanel) {
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
    if (!editor.removed && editorHasFocus(editor)) {
      toggle();
    }
  };
};

const repositionPanel = function (editor: Editor, panel: InlitePanel) {
  return function () {
    const toolbars = getToolbars(editor);
    const result = findMatchResult(editor, toolbars);

    if (result) {
      panel.reposition(editor, result.id, result.rect);
    }
  };
};

const ignoreWhenFormIsVisible = function (editor: Editor, panel: InlitePanel, f: () => void) {
  return function () {
    if (!editor.removed && !panel.inForm()) {
      f();
    }
  };
};

const bindContextualToolbarsEvents = function (editor: Editor, panel: InlitePanel) {
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

const overrideLinkShortcut = function (editor: Editor, panel: InlitePanel) {
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

const renderInlineUI = function (editor: Editor, panel: InlitePanel) {
  SkinLoader.load(editor, function () {
    bindContextualToolbarsEvents(editor, panel);
    overrideLinkShortcut(editor, panel);
  });

  return {};
};

const fail = function (message: string) {
  throw new Error(message);
};

const renderUI = function (editor: Editor, panel: InlitePanel) {
  return editor.inline ? renderInlineUI(editor, panel) : fail('inlite theme only supports inline mode.');
};

export default {
  renderUI
};