/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Type } from '@ephox/katamari';
import PluginManager from '../api/PluginManager';
import ThemeManager from '../api/ThemeManager';
import DOMUtils from '../api/dom/DOMUtils';
import InitContentBody from './InitContentBody';
import InitIframe from './InitIframe';
import Tools from '../api/util/Tools';

const DOM = DOMUtils.DOM;

const initPlugin = function (editor, initializedPlugins, plugin) {
  const Plugin = PluginManager.get(plugin);
  let pluginUrl, pluginInstance;

  pluginUrl = PluginManager.urls[plugin] || editor.documentBaseUrl.replace(/\/$/, '');
  plugin = Tools.trim(plugin);
  if (Plugin && Tools.inArray(initializedPlugins, plugin) === -1) {
    Tools.each(PluginManager.dependencies(plugin), function (dep) {
      initPlugin(editor, initializedPlugins, dep);
    });

    if (editor.plugins[plugin]) {
      return;
    }

    pluginInstance = new Plugin(editor, pluginUrl, editor.$);

    editor.plugins[plugin] = pluginInstance;

    if (pluginInstance.init) {
      pluginInstance.init(editor, pluginUrl);
      initializedPlugins.push(plugin);
    }
  }
};

const trimLegacyPrefix = function (name) {
  // Themes and plugins can be prefixed with - to prevent them from being lazy loaded
  return name.replace(/^\-/, '');
};

const initPlugins = function (editor) {
  const initializedPlugins = [];

  Tools.each(editor.settings.plugins.split(/[ ,]/), function (name) {
    initPlugin(editor, initializedPlugins, trimLegacyPrefix(name));
  });
};

const initTheme = function (editor) {
  let Theme;
  const theme = editor.settings.theme;

  if (Type.isString(theme)) {
    editor.settings.theme = trimLegacyPrefix(theme);

    Theme = ThemeManager.get(theme);
    editor.theme = new Theme(editor, ThemeManager.urls[theme]);

    if (editor.theme.init) {
      editor.theme.init(editor, ThemeManager.urls[theme] || editor.documentBaseUrl.replace(/\/$/, ''), editor.$);
    }
  } else {
    // Theme set to false or null doesn't produce a theme api
    editor.theme = {};
  }
};

const renderFromLoadedTheme = function (editor) {
  let w, h, minHeight, re, info;
  const settings = editor.settings;
  const elm = editor.getElement();

  w = settings.width || DOM.getStyle(elm, 'width') || '100%';
  h = settings.height || DOM.getStyle(elm, 'height') || elm.offsetHeight;
  minHeight = settings.min_height || 100;
  re = /^[0-9\.]+(|px)$/i;

  if (re.test('' + w)) {
    w = Math.max(parseInt(w, 10), 100);
  }

  if (re.test('' + h)) {
    h = Math.max(parseInt(h, 10), minHeight);
  }

  // Render UI
  info = editor.theme.renderUI({
    targetNode: elm,
    width: w,
    height: h,
    deltaWidth: settings.delta_width,
    deltaHeight: settings.delta_height
  });

  // Resize editor
  if (!settings.content_editable) {
    h = (info.iframeHeight || h) + (typeof h === 'number' ? (info.deltaHeight || 0) : '');
    if (h < minHeight) {
      h = minHeight;
    }
  }

  info.height = h;

  return info;
};

const renderFromThemeFunc = function (editor) {
  let info;
  const elm = editor.getElement();

  info = editor.settings.theme(editor, elm);

  if (info.editorContainer.nodeType) {
    info.editorContainer.id = info.editorContainer.id || editor.id + '_parent';
  }

  if (info.iframeContainer && info.iframeContainer.nodeType) {
    info.iframeContainer.id = info.iframeContainer.id || editor.id + '_iframecontainer';
  }

  info.height = info.iframeHeight ? info.iframeHeight : elm.offsetHeight;

  return info;
};

const createThemeFalseResult = function (element) {
  return {
    editorContainer: element,
    iframeContainer: element
  };
};

const renderThemeFalseIframe = function (targetElement) {
  const iframeContainer = DOM.create('div');

  DOM.insertAfter(iframeContainer, targetElement);

  return createThemeFalseResult(iframeContainer);
};

const renderThemeFalse = function (editor) {
  const targetElement = editor.getElement();
  return editor.inline ? createThemeFalseResult(null) : renderThemeFalseIframe(targetElement);
};

const renderThemeUi = function (editor) {
  const settings = editor.settings, elm = editor.getElement();

  editor.orgDisplay = elm.style.display;

  if (Type.isString(settings.theme)) {
    return renderFromLoadedTheme(editor);
  } else if (Type.isFunction(settings.theme)) {
    return renderFromThemeFunc(editor);
  } else {
    return renderThemeFalse(editor);
  }
};

const init = function (editor) {
  const settings = editor.settings;
  const elm = editor.getElement();
  let boxInfo;

  editor.rtl = settings.rtl_ui || editor.editorManager.i18n.rtl;
  editor.editorManager.i18n.setCode(settings.language);
  settings.aria_label = settings.aria_label || DOM.getAttrib(elm, 'aria-label', editor.getLang('aria.rich_text_area'));

  editor.fire('ScriptsLoaded');

  initTheme(editor);
  initPlugins(editor);
  boxInfo = renderThemeUi(editor);
  editor.editorContainer = boxInfo.editorContainer ? boxInfo.editorContainer : null;

  // Load specified content CSS last
  if (settings.content_css) {
    Tools.each(Tools.explode(settings.content_css), function (u) {
      editor.contentCSS.push(editor.documentBaseURI.toAbsolute(u));
    });
  }

  // Content editable mode ends here
  if (settings.content_editable) {
    return InitContentBody.initContentBody(editor);
  } else {
    return InitIframe.init(editor, boxInfo);
  }
};

export default {
  init
};