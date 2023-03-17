import { Arr, Fun, Obj, Optional, Type } from '@ephox/katamari';

import { AddOnConstructor } from '../api/AddOnManager';
import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import IconManager from '../api/IconManager';
import ModelManager, { Model } from '../api/ModelManager';
import * as Options from '../api/Options';
import { ThemeInitFunc } from '../api/OptionTypes';
import PluginManager from '../api/PluginManager';
import ThemeManager, { Theme } from '../api/ThemeManager';
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
    if (editor.plugins[plugin]) {
      return;
    }

    try {
      const pluginInstance = Plugin(editor, pluginUrl) || {};

      editor.plugins[plugin] = pluginInstance;

      if (Type.isFunction(pluginInstance.init)) {
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
  const initializedPlugins: string[] = [];

  Arr.each(Options.getPlugins(editor), (name) => {
    initPlugin(editor, initializedPlugins, trimLegacyPrefix(name));
  });
};

const initIcons = (editor: Editor) => {
  const iconPackName: string = Tools.trim(Options.getIconPackName(editor));
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
  const theme = Options.getTheme(editor);

  if (Type.isString(theme)) {
    const Theme = ThemeManager.get(theme) as AddOnConstructor<Theme>;
    editor.theme = Theme(editor, ThemeManager.urls[theme]) || {};

    if (Type.isFunction(editor.theme.init)) {
      editor.theme.init(editor, ThemeManager.urls[theme] || editor.documentBaseUrl.replace(/\/$/, ''));
    }
  } else {
    // Theme set to false or null doesn't produce a theme api
    editor.theme = {};
  }
};

const initModel = (editor: Editor) => {
  const model = Options.getModel(editor);
  const Model = ModelManager.get(model) as AddOnConstructor<Model>;
  editor.model = Model(editor, ModelManager.urls[model]);
};

const renderFromLoadedTheme = (editor: Editor) => {
  // Render UI
  const render = editor.theme.renderUI;
  return render ? render() : renderThemeFalse(editor);
};

const renderFromThemeFunc = (editor: Editor) => {
  const elm = editor.getElement();
  const theme = Options.getTheme(editor) as ThemeInitFunc;
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

const createThemeFalseResult = (element: HTMLElement | null, iframe?: HTMLElement) => {
  return {
    editorContainer: element,
    iframeContainer: iframe,
    api: {}
  };
};

const renderThemeFalseIframe = (targetElement: Element) => {
  const iframeContainer = DOM.create('div');

  DOM.insertAfter(iframeContainer, targetElement);

  return createThemeFalseResult(iframeContainer, iframeContainer);
};

const renderThemeFalse = (editor: Editor) => {
  const targetElement = editor.getElement();
  return editor.inline ? createThemeFalseResult(null) : renderThemeFalseIframe(targetElement);
};

const renderThemeUi = (editor: Editor) => {
  const elm = editor.getElement();

  editor.orgDisplay = elm.style.display;

  if (Type.isString(Options.getTheme(editor))) {
    return renderFromLoadedTheme(editor);
  } else if (Type.isFunction(Options.getTheme(editor))) {
    return renderFromThemeFunc(editor);
  } else {
    return renderThemeFalse(editor);
  }
};

const augmentEditorUiApi = (editor: Editor, api: Partial<EditorUiApi>) => {
  const uiApiFacade: EditorUiApi = {
    show: Optional.from(api.show).getOr(Fun.noop),
    hide: Optional.from(api.hide).getOr(Fun.noop),
    isEnabled: Optional.from(api.isEnabled).getOr(Fun.always),
    setEnabled: (state) => {
      if (!editor.mode.isReadOnly()) {
        Optional.from(api.setEnabled).each((f) => f(state));
      }
    }
  };
  editor.ui = { ...editor.ui, ...uiApiFacade };
};

const init = async (editor: Editor): Promise<void> => {
  editor.dispatch('ScriptsLoaded');

  initIcons(editor);
  initTheme(editor);
  initModel(editor);
  initPlugins(editor);
  const renderInfo = await renderThemeUi(editor);
  augmentEditorUiApi(editor, Optional.from(renderInfo.api).getOr({}));
  editor.editorContainer = renderInfo.editorContainer as HTMLElement;
  appendContentCssFromSettings(editor);

  if (editor.inline) {
    InitContentBody.contentBodyLoaded(editor);
  } else {
    InitIframe.init(editor, {
      editorContainer: renderInfo.editorContainer,
      iframeContainer: renderInfo.iframeContainer as HTMLElement
    });
  }
};

export {
  init
};
