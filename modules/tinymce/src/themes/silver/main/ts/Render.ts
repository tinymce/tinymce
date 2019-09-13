/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AlloyComponent,
  AlloySpec,
  Behaviour,
  Gui,
  GuiFactory,
  Keying,
  Memento,
  Positioning,
  SimpleSpec
} from '@ephox/alloy';
import { HTMLElement, HTMLIFrameElement, console } from '@ephox/dom-globals';
import { Arr, Merger, Obj, Option, Result } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Css } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import I18n from 'tinymce/core/api/util/I18n';
import {
  getHeightSetting,
  getMinHeightSetting,
  getMinWidthSetting,
  getMultipleToolbarsSetting,
  getToolbarDrawer,
  isMenubarEnabled,
  isToolbarEnabled,
  useFixedContainer,
  isMultipleToolbars,
  ToolbarDrawer
} from './api/Settings';
import * as Backstage from './backstage/Backstage';
import ContextToolbar from './ContextToolbar';
import Events from './Events';
import Iframe from './modes/Iframe';
import Inline from './modes/Inline';
import FormatControls from './ui/core/FormatControls';
import OuterContainer, { OuterContainerSketchSpec } from './ui/general/OuterContainer';
import * as SilverContextMenu from './ui/menus/contextmenu/SilverContextMenu';
import * as Sidebar from './ui/sidebar/Sidebar';
import * as Throbber from './ui/throbber/Throbber';
import Utils from './ui/sizing/Utils';
import { renderStatusbar } from './ui/statusbar/Statusbar';

export interface RenderInfo {
  mothership: Gui.GuiSystem;
  uiMothership: Gui.GuiSystem;
  backstage: Backstage.UiFactoryBackstage;
  renderUI: () => ModeRenderInfo;
  getUi: () => ({ channels: UiChannels });
}

export interface ModeRenderInfo {
  iframeContainer?: HTMLIFrameElement;
  editorContainer: HTMLElement;
}

export interface UiChannels {
  broadcastAll: (message: Record<string, any>) => void;
  broadcastOn: (channels: string[], message: Record<string, any>) => void;
  register: () => void;
}

export interface RenderUiComponents {
  mothership: Gui.GuiSystem;
  uiMothership: Gui.GuiSystem;
  outerContainer: AlloyComponent;
}

type ToolbarConfig = Array<string | ToolbarGroupSetting> | string | boolean;

export interface RenderToolbarConfig {
  toolbar: ToolbarConfig;
  buttons: Record<string, any>;
}

export interface RenderUiConfig extends RenderToolbarConfig {
  menuItems: Record<string, any>;
  menus;
  menubar;
  sidebar: Sidebar.SidebarConfig;
}

export interface ToolbarGroupSetting {
  name?: string;
  items: string[];
}

export interface RenderArgs {
  targetNode: HTMLElement;
  height: number;
}

const setup = (editor: Editor): RenderInfo => {
  const isInline = editor.getParam('inline', false, 'boolean');
  const mode = isInline ? Inline : Iframe;
  let lazyOuterContainer: Option<AlloyComponent> = Option.none();

  const platform = PlatformDetection.detect();
  const isIE = platform.browser.isIE();
  const platformClasses = isIE ? ['tox-platform-ie'] : [];

  const dirAttributes = I18n.isRtl() ? {
    attributes: {
      dir: 'rtl'
    }
  } : {};

  const sink = GuiFactory.build({
    dom: {
      tag: 'div',
      classes: ['tox', 'tox-silver-sink', 'tox-tinymce-aux'].concat(platformClasses),
      ...dirAttributes
    },
    behaviours: Behaviour.derive([
      Positioning.config({
        useFixed: false // this allows menus to scroll with the outer page, we don't want position: fixed
      })
    ])
  });

  const memAnchorBar = Memento.record({
    dom: {
      tag: 'div',
      classes: [ 'tox-anchorbar']
    }
  });

  const lazyAnchorBar = () => lazyOuterContainer.bind((container) => {
    return memAnchorBar.getOpt(container);
  }).getOrDie('Could not find a anchor bar element');

  const lazyMoreButton = () => lazyOuterContainer.bind((container) => {
    return OuterContainer.getMoreButton(container);
  }).getOrDie('Could not find more button element');

  const lazyToolbar = () => lazyOuterContainer.bind((container) => {
    return OuterContainer.getToolbar(container);
  }).getOrDie('Could not find more toolbar element');

  const lazyThrobber = () => lazyOuterContainer.bind((container) => {
    return OuterContainer.getThrobber(container);
  }).getOrDie('Could not find throbber element');

  const backstage: Backstage.UiFactoryBackstage = Backstage.init(sink, editor, lazyAnchorBar, lazyMoreButton);

  const lazySink = () => Result.value<AlloyComponent, Error>(sink);

  const partMenubar: AlloySpec = OuterContainer.parts().menubar({
    dom: {
      tag: 'div',
      classes: [ 'tox-menubar' ]
    },
    backstage,
    onEscape () {
      editor.focus();
    }
  });

  const toolbarDrawer = (editor: Editor) => getToolbarDrawer(editor);

  const partToolbar: AlloySpec = OuterContainer.parts().toolbar({
    dom: {
      tag: 'div',
      classes: [ 'tox-toolbar' ]
    },
    getSink: lazySink,
    backstage,
    onEscape() {
      editor.focus();
    },
    split: toolbarDrawer(editor),
    lazyToolbar,
    lazyMoreButton
  });

  const partMultipleToolbar: AlloySpec = OuterContainer.parts()['multiple-toolbar']({
    dom: {
      tag: 'div',
      classes: [ 'tox-toolbar-overlord' ]
    },
    onEscape: () => { }
  });

  const partSocket: AlloySpec = OuterContainer.parts().socket({
    dom: {
      tag: 'div',
      classes: [ 'tox-edit-area' ]
    }
  });

  const partSidebar: AlloySpec = OuterContainer.parts().sidebar({
    dom: {
      tag: 'div',
      classes: ['tox-sidebar']
    }
  });

  const partThrobber: AlloySpec = OuterContainer.parts().throbber({
    dom: {
      tag: 'div',
      classes: ['tox-throbber']
    },
    backstage
  });

  const sb = editor.getParam('statusbar', true, 'boolean');

  const statusbar: Option<AlloySpec> =
    sb && !isInline ? Option.some(renderStatusbar(editor, backstage.shared.providers)) : Option.none<AlloySpec>();

  const socketSidebarContainer: SimpleSpec = {
    dom: {
      tag: 'div',
      classes: ['tox-sidebar-wrap']
    },
    components: [
      partSocket,
      partSidebar
    ]
  };

  // False should stop the menubar and toolbar rendering altogether
  const hasMultipleToolbar = isMultipleToolbars(editor);
  const hasToolbar = isToolbarEnabled(editor);
  const hasMenubar = isMenubarEnabled(editor);
  const hasToolbarDrawer = toolbarDrawer(editor) !== ToolbarDrawer.default;

  const getPartToolbar = () => {
    if (hasMultipleToolbar) {
      if (hasToolbarDrawer) {
        // tslint:disable-next-line:no-console
        console.warn('Toolbar drawer cannot be applied when multiple toolbars are active');
      }
      return [ partMultipleToolbar ];
    } else if (hasToolbar) {
      return [ partToolbar ];
    } else {
      return [ ];
    }
  };

  // We need the statusbar to be separate to everything else so resizing works properly
  const editorComponents = Arr.flatten<AlloySpec>([
    hasMenubar ? [ partMenubar ] : [ ],
    getPartToolbar(),
    // fixed_toolbar_container anchors to the editable area, else add an anchor bar
    useFixedContainer(editor) ? [ ] : [ memAnchorBar.asSpec() ],
    // Inline mode does not have a socket/sidebar
    isInline ? [ ] : [ socketSidebarContainer ]
  ]);

  const editorContainer = {
    dom: {
      tag: 'div',
      classes: ['tox-editor-container']
    },
    components: editorComponents,
  };

  const containerComponents = Arr.flatten<AlloySpec>([
    [editorContainer],
    // Inline mode does not have a status bar
    isInline ? [ ] : statusbar.toArray(),
    [ partThrobber ]
  ]);

  // Hide the outer container if using inline mode and there's no menubar or toolbar
  const isHidden = isInline && !hasMenubar && !hasToolbar && !hasMultipleToolbar;

  const attributes = {
    role: 'application',
    ...I18n.isRtl() ? { dir: 'rtl' } : {},
    ...isHidden ? { 'aria-hidden': 'true' } : {}
  };

  const outerContainer = GuiFactory.build(
    OuterContainer.sketch({
      dom: {
        tag: 'div',
        classes: ['tox', 'tox-tinymce'].concat(isInline ? ['tox-tinymce-inline'] : []).concat(platformClasses),
        styles: {
          // This is overridden by the skin, it helps avoid FOUC
          visibility: 'hidden',
          // Hide the container if needed, but don't use "display: none" so that it still has a position
          ...isHidden ? { opacity: '0', border: '0' } : {},
        },
        attributes
      },
      components: containerComponents,
      behaviours: Behaviour.derive(mode.getBehaviours(editor).concat([
        Keying.config({
          mode: 'cyclic',
          selector: '.tox-menubar, .tox-toolbar, .tox-toolbar__primary, .tox-toolbar__overflow--open, .tox-sidebar__overflow--open, .tox-statusbar__path, .tox-statusbar__wordcount, .tox-statusbar__branding a'
        })
      ]))
    } as OuterContainerSketchSpec)
  );

  lazyOuterContainer = Option.some(outerContainer);

  editor.shortcuts.add('alt+F9', 'focus menubar', function () {
    OuterContainer.focusMenubar(outerContainer);
  });
  editor.shortcuts.add('alt+F10', 'focus toolbar', function () {
    OuterContainer.focusToolbar(outerContainer);
  });

  const mothership = Gui.takeover(
    outerContainer
  );

  const uiMothership = Gui.takeover(sink);

  Events.setup(editor, mothership, uiMothership);

  const getUi = () => {
    const channels = {
      broadcastAll: uiMothership.broadcast,
      broadcastOn: uiMothership.broadcastOn,
      register: () => {}
    };

    return { channels };
  };

  const setEditorSize = (elm) => {
    // Set height and width if they were given, though height only applies to iframe mode
    const DOM = DOMUtils.DOM;

    const baseWidth = editor.getParam('width', DOM.getStyle(elm, 'width'));
    const baseHeight = getHeightSetting(editor);
    const minWidth = getMinWidthSetting(editor);
    const minHeight = getMinHeightSetting(editor);

    const parsedWidth = Utils.parseToInt(baseWidth).bind((w) => {
      return Utils.numToPx(minWidth.map((mw) => Math.max(w, mw)));
    }).getOr(Utils.numToPx(baseWidth));

    const parsedHeight = Utils.parseToInt(baseHeight).bind((h) => {
      return minHeight.map((mh) => Math.max(h, mh));
    }).getOr(baseHeight);

    const stringWidth = Utils.numToPx(parsedWidth);
    if (Css.isValidValue('div', 'width', stringWidth)) {
      Css.set(outerContainer.element(), 'width', stringWidth);
    }

    if (!editor.inline) {
      const stringHeight = Utils.numToPx(parsedHeight);
      if (Css.isValidValue('div', 'height', stringHeight)) {
        Css.set(outerContainer.element(), 'height', stringHeight);
      } else {
        Css.set(outerContainer.element(), 'height', '200px');
      }
    }

    return parsedHeight;
  };

  const renderUI = function (): ModeRenderInfo {
    FormatControls.setup(editor, backstage);
    SilverContextMenu.setup(editor, lazySink, backstage);
    Sidebar.setup(editor);
    Throbber.setup(editor, lazyThrobber, backstage.shared);

    // Apply Bridge types
    const { buttons, menuItems, contextToolbars, sidebars } = editor.ui.registry.getAll();
    const toolbarOpt: Option<ToolbarConfig> = getMultipleToolbarsSetting(editor);
    const rawUiConfig: RenderUiConfig = {
      menuItems,

      // Apollo, not implemented yet, just patched to work
      menus: !editor.settings.menu ? {} : Obj.map(editor.settings.menu, (menu) => Merger.merge(menu, { items: menu.items })),
      menubar: editor.settings.menubar,
      toolbar: toolbarOpt.getOrThunk(() => editor.getParam('toolbar', true)),
      buttons,

      // Apollo, not implemented yet
      sidebar: sidebars
    };

    ContextToolbar.register(editor, contextToolbars, sink, { backstage });

    const elm = editor.getElement();
    const height = setEditorSize(elm);

    const uiComponents: RenderUiComponents = { mothership, uiMothership, outerContainer };
    const args: RenderArgs = { targetNode: elm, height };
    return mode.render(editor, uiComponents, rawUiConfig, backstage, args);
  };

  return {mothership, uiMothership, backstage, renderUI, getUi};
};

export default {
  setup
};
