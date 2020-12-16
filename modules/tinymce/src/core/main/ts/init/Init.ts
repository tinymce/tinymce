/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Obj, Optional, Type } from '@ephox/katamari';
import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import IconManager from '../api/IconManager';
import PluginManager from '../api/PluginManager';
import * as Settings from '../api/Settings';
import { ThemeInitFunc } from '../api/SettingsTypes';
import ThemeManager from '../api/ThemeManager';
import { EditorUiApi } from '../api/ui/Ui';
import Tools from '../api/util/Tools';
import * as ErrorReporter from '../ErrorReporter';
import { appendContentCssFromSettings } from './ContentCss';
import * as InitContentBody from './InitContentBody';
import * as InitIframe from './InitIframe';

const DOM = DOMUtils.DOM;

const initPlugin = (editor: Editor, initializedPlugins: string[], plugin: string) => {
  const Plugin = PluginManager.get(plugin);

  const pluginUrl = PluginManager.urls[plugin] || editor.documentBaseUrl.replace(/\/$/, '');
  plugin = Tools.trim(plugin);
  if (Plugin && Tools.inArray(initializedPlugins, plugin) === -1) {
    Tools.each(PluginManager.dependencies(plugin), (dep) => {
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

const trimLegacyPrefix = (name: string) => {
  // Themes and plugins can be prefixed with - to prevent them from being lazy loaded
  return name.replace(/^\-/, '');
};

const initPlugins = (editor: Editor) => {
  const initializedPlugins = [];

  Tools.each(Settings.getPlugins(editor).split(/[ ,]/), (name) => {
    initPlugin(editor, initializedPlugins, trimLegacyPrefix(name));
  });
};

const initIcons = (editor: Editor) => {
  const iconPackName: string = Tools.trim(Settings.getIconPackName(editor));
  const currentIcons = editor.ui.registry.getAll().icons;

  const loadIcons = {
    ...IconManager.get('default').icons,
    ...IconManager.get(iconPackName).icons
  };

  Obj.each(loadIcons, (svgData, icon) => {
    // Don't override an icon registered manually
    if (!Obj.has(currentIcons, icon)) {
      editor.ui.registry.addIcon(icon, svgData);
    }
  });
};

const initTheme = (editor: Editor) => {
  const theme = Settings.getTheme(editor);

  if (Type.isString(theme)) {
    editor.settings.theme = trimLegacyPrefix(theme); // Kept until a proper API can be made. TINY-6142

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

const renderFromLoadedTheme = (editor: Editor) => {
  // Render UI
  return editor.theme.renderUI();
};

const renderFromThemeFunc = (editor: Editor) => {
  const elm = editor.getElement();
  const theme = Settings.getTheme(editor) as ThemeInitFunc;
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

const createThemeFalseResult = (element: HTMLElement) => {
  return {
    editorContainer: element,
    iframeContainer: element,
    api: {}
  };
};

const renderThemeFalseIframe = (targetElement: Element) => {
  const iframeContainer = DOM.create('div');

  DOM.insertAfter(iframeContainer, targetElement);

  return createThemeFalseResult(iframeContainer);
};

const renderThemeFalse = (editor: Editor) => {
  const targetElement = editor.getElement();
  return editor.inline ? createThemeFalseResult(null) : renderThemeFalseIframe(targetElement);
};

const renderThemeUi = (editor: Editor) => {
  const elm = editor.getElement();

  editor.orgDisplay = elm.style.display;

  if (Type.isString(Settings.getTheme(editor))) {
    return renderFromLoadedTheme(editor);
  } else if (Type.isFunction(Settings.getTheme(editor))) {
    return renderFromThemeFunc(editor);
  } else {
    return renderThemeFalse(editor);
  }
};

const augmentEditorUiApi = (editor: Editor, api: Partial<EditorUiApi>) => {
  const uiApiFacade: EditorUiApi = {
    show: Optional.from(api.show).getOr(Fun.noop),
    hide: Optional.from(api.hide).getOr(Fun.noop),
    disable: Optional.from(api.disable).getOr(Fun.noop),
    isDisabled: Optional.from(api.isDisabled).getOr(Fun.never),
    enable: () => {
      if (!editor.mode.isReadOnly()) {
        Optional.from(api.enable).map(Fun.call);
      }
    }
  };
  editor.ui = { ...editor.ui, ...uiApiFacade };
};

const init = (editor: Editor) => {
  editor.fire('ScriptsLoaded');

  initIcons(editor);
  initTheme(editor);
  initPlugins(editor);
  const renderInfo = renderThemeUi(editor);
  augmentEditorUiApi(editor, Optional.from(renderInfo.api).getOr({}));
  const boxInfo = {
    editorContainer: renderInfo.editorContainer,
    iframeContainer: renderInfo.iframeContainer
  };
  editor.editorContainer = boxInfo.editorContainer ? boxInfo.editorContainer : null;
  appendContentCssFromSettings(editor);

  // Content editable mode ends here
  if (editor.inline) {
    return InitContentBody.initContentBody(editor);
  } else {
    return InitIframe.init(editor, boxInfo);
  }
};

export {
  init
};
