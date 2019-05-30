/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element, HTMLElement } from '@ephox/dom-globals';
import { Obj, Type } from '@ephox/katamari';
import { getAll as getAllOxide } from '@tinymce/oxide-icons-default';
import Editor from '../api/Editor';
import IconManager from '../api/IconManager';
import PluginManager from '../api/PluginManager';
import ThemeManager from '../api/ThemeManager';
import DOMUtils from '../api/dom/DOMUtils';
import Tools from '../api/util/Tools';
import ErrorReporter from '../ErrorReporter';
import InitContentBody from './InitContentBody';
import InitIframe from './InitIframe';
import { appendContentCssFromSettings } from './ContentCss';
import { ThemeInitFunc } from '../api/SettingsTypes';

const DOM = DOMUtils.DOM;

const initPlugin = function (editor: Editor, initializedPlugins, plugin) {
  const Plugin = PluginManager.get(plugin);

  const pluginUrl = PluginManager.urls[plugin] || editor.documentBaseUrl.replace(/\/$/, '');
  plugin = Tools.trim(plugin);
  if (Plugin && Tools.inArray(initializedPlugins, plugin) === -1) {
    Tools.each(PluginManager.dependencies(plugin), function (dep) {
      initPlugin(editor, initializedPlugins, dep);
    });

    if (editor.plugins[plugin]) {
      return;
    }

    try {
      const pluginInstance = new Plugin(editor, pluginUrl, editor.$);

      editor.plugins[plugin] = pluginInstance;

      if (pluginInstance.init) {
        pluginInstance.init(editor, pluginUrl);
        initializedPlugins.push(plugin);
      }
    } catch (e) {
      ErrorReporter.pluginInitError(editor, plugin, e);
    }
  }
};

const trimLegacyPrefix = function (name: string) {
  // Themes and plugins can be prefixed with - to prevent them from being lazy loaded
  return name.replace(/^\-/, '');
};

const initPlugins = function (editor: Editor) {
  const initializedPlugins = [];

  Tools.each(editor.settings.plugins.split(/[ ,]/), function (name) {
    initPlugin(editor, initializedPlugins, trimLegacyPrefix(name));
  });
};

const initIcons = (editor: Editor) => {
  const iconPackName: string = Tools.trim(editor.settings.icons);
  const currentIcons = editor.ui.registry.getAll().icons;

  const defaultIcons = getAllOxide();
  const loadIcons = {
    ...defaultIcons,
    ...IconManager.get(iconPackName).icons
  };

  Obj.each(loadIcons, (svgData, icon) => {
    // Don't override an icon registered manually
    if (!Obj.has(currentIcons, icon)) {
      editor.ui.registry.addIcon(icon, svgData);
    }
  });
};

const initTheme = function (editor: Editor) {
  const theme = editor.settings.theme;

  if (Type.isString(theme)) {
    editor.settings.theme = trimLegacyPrefix(theme);

    const Theme = ThemeManager.get(theme);
    editor.theme = new Theme(editor, ThemeManager.urls[theme]);

    if (editor.theme.init) {
      editor.theme.init(editor, ThemeManager.urls[theme] || editor.documentBaseUrl.replace(/\/$/, ''), editor.$);
    }
  } else {
    // Theme set to false or null doesn't produce a theme api
    editor.theme = {};
  }
};

const renderFromLoadedTheme = function (editor: Editor) {
  // Render UI
  return editor.theme.renderUI();
};

const renderFromThemeFunc = function (editor: Editor) {
  const elm = editor.getElement();
  const theme = editor.settings.theme as ThemeInitFunc;
  const info = theme(editor, elm);

  if (info.editorContainer.nodeType) {
    info.editorContainer.id = info.editorContainer.id || editor.id + '_parent';
  }

  if (info.iframeContainer && info.iframeContainer.nodeType) {
    info.iframeContainer.id = info.iframeContainer.id || editor.id + '_iframecontainer';
  }

  info.height = info.iframeHeight ? info.iframeHeight : elm.offsetHeight;

  return info;
};

const createThemeFalseResult = function (element: HTMLElement) {
  return {
    editorContainer: element,
    iframeContainer: element
  };
};

const renderThemeFalseIframe = function (targetElement: Element) {
  const iframeContainer = DOM.create('div');

  DOM.insertAfter(iframeContainer, targetElement);

  return createThemeFalseResult(iframeContainer);
};

const renderThemeFalse = function (editor: Editor) {
  const targetElement = editor.getElement();
  return editor.inline ? createThemeFalseResult(null) : renderThemeFalseIframe(targetElement);
};

const renderThemeUi = function (editor: Editor) {
  const elm = editor.getElement();

  editor.orgDisplay = elm.style.display;

  if (Type.isString(editor.settings.theme)) {
    return renderFromLoadedTheme(editor);
  } else if (Type.isFunction(editor.settings.theme)) {
    return renderFromThemeFunc(editor);
  } else {
    return renderThemeFalse(editor);
  }
};

const init = function (editor: Editor) {
  editor.fire('ScriptsLoaded');

  initIcons(editor);
  initTheme(editor);
  initPlugins(editor);
  const boxInfo = renderThemeUi(editor);
  editor.editorContainer = boxInfo.editorContainer ? boxInfo.editorContainer : null;
  appendContentCssFromSettings(editor);

  // Content editable mode ends here
  if (editor.inline) {
    return InitContentBody.initContentBody(editor);
  } else {
    return InitIframe.init(editor, boxInfo);
  }
};

export default {
  init
};