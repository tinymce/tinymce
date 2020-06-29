/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AlloySpec, Behaviour, Gui, GuiFactory, Keying, Memento, Positioning, SimpleSpec, VerticalDir } from '@ephox/alloy';
import { HTMLElement, HTMLIFrameElement } from '@ephox/dom-globals';
import { Arr, Obj, Option, Result } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Css } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import I18n from 'tinymce/core/api/util/I18n';
import * as Settings from './api/Settings';
import * as Backstage from './backstage/Backstage';
import * as ContextToolbar from './ContextToolbar';
import * as Events from './Events';
import * as Iframe from './modes/Iframe';
import * as Inline from './modes/Inline';
import * as FormatControls from './ui/core/FormatControls';
import OuterContainer, { OuterContainerSketchSpec } from './ui/general/OuterContainer';
import * as StaticHeader from './ui/header/StaticHeader';
import * as StickyHeader from './ui/header/StickyHeader';
import * as SilverContextMenu from './ui/menus/contextmenu/SilverContextMenu';
import * as TableSelectorHandles from './ui/selector/TableSelectorHandles';
import * as Sidebar from './ui/sidebar/Sidebar';
import * as EditorSize from './ui/sizing/EditorSize';
import * as Utils from './ui/sizing/Utils';
import { renderStatusbar } from './ui/statusbar/Statusbar';
import * as Throbber from './ui/throbber/Throbber';

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

export type ToolbarConfig = Array<string | Settings.ToolbarGroupSetting> | string | boolean;

export interface RenderToolbarConfig {
  toolbar: ToolbarConfig;
  buttons: Record<string, any>;
  allowToolbarGroups: boolean;
}

export interface RenderUiConfig extends RenderToolbarConfig {
  menuItems: Record<string, any>;
  menus;
  menubar;
  sidebar: Sidebar.SidebarConfig;
}

export interface RenderArgs {
  targetNode: HTMLElement;
  height: string;
}

const setup = (editor: Editor): RenderInfo => {
  const isInline = editor.inline;
  const mode = isInline ? Inline : Iframe;
  const header = Settings.isStickyToolbar(editor) ? StickyHeader : StaticHeader;
  let lazyOuterContainer: Option<AlloyComponent> = Option.none();

  const platform = PlatformDetection.detect();
  const isIE = platform.browser.isIE();
  const platformClasses = isIE ? [ 'tox-platform-ie' ] : [];
  const isTouch = platform.deviceType.isTouch();
  const touchPlatformClass = 'tox-platform-touch';
  const deviceClasses = isTouch ? [ touchPlatformClass ] : [];
  const isToolbarBottom = Settings.isToolbarLocationBottom(editor);

  const dirAttributes = I18n.isRtl() ? {
    attributes: {
      dir: 'rtl'
    }
  } : {};

  const verticalDirAttributes = {
    attributes: {
      [VerticalDir.Attribute]: isToolbarBottom ?
        VerticalDir.AttributeValue.BottomToTop :
        VerticalDir.AttributeValue.TopToBottom
    }
  };

  const lazyHeader = () => lazyOuterContainer.bind(OuterContainer.getHeader);

  const isHeaderDocked = () => header.isDocked(lazyHeader);

  const sink = GuiFactory.build({
    dom: {
      tag: 'div',
      classes: [ 'tox', 'tox-silver-sink', 'tox-tinymce-aux' ].concat(platformClasses).concat(deviceClasses),
      ...dirAttributes
    },
    behaviours: Behaviour.derive([
      Positioning.config({
        useFixed: () => isHeaderDocked()
      })
    ])
  });

  const lazySink = () => Result.value<AlloyComponent, Error>(sink);

  const memAnchorBar = Memento.record({
    dom: {
      tag: 'div',
      classes: [ 'tox-anchorbar' ]
    }
  });

  const lazyAnchorBar = () => lazyOuterContainer.bind((container) => memAnchorBar.getOpt(container)).getOrDie('Could not find a anchor bar element');

  const lazyToolbar = () => lazyOuterContainer.bind((container) => OuterContainer.getToolbar(container)).getOrDie('Could not find more toolbar element');

  const lazyThrobber = () => lazyOuterContainer.bind((container) => OuterContainer.getThrobber(container)).getOrDie('Could not find throbber element');

  const backstage: Backstage.UiFactoryBackstage = Backstage.init(sink, editor, lazyAnchorBar);

  const partMenubar: AlloySpec = OuterContainer.parts().menubar({
    dom: {
      tag: 'div',
      classes: [ 'tox-menubar' ]
    },
    backstage,
    onEscape() {
      editor.focus();
    }
  });

  const toolbarMode = Settings.getToolbarMode(editor);

  const partToolbar: AlloySpec = OuterContainer.parts().toolbar({
    dom: {
      tag: 'div',
      classes: [ 'tox-toolbar' ]
    },
    getSink: lazySink,
    providers: backstage.shared.providers,
    onEscape() {
      editor.focus();
    },
    type: toolbarMode,
    lazyToolbar,
    lazyHeader: () => lazyHeader().getOrDie('Could not find header element'),
    ...verticalDirAttributes
  });

  const partMultipleToolbar: AlloySpec = OuterContainer.parts()['multiple-toolbar']({
    dom: {
      tag: 'div',
      classes: [ 'tox-toolbar-overlord' ]
    },
    providers: backstage.shared.providers,
    onEscape: () => { },
    type: toolbarMode
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
      classes: [ 'tox-sidebar' ]
    }
  });

  const partThrobber: AlloySpec = OuterContainer.parts().throbber({
    dom: {
      tag: 'div',
      classes: [ 'tox-throbber' ]
    },
    backstage
  });

  const sb = editor.getParam('statusbar', true, 'boolean');

  const statusbar: Option<AlloySpec> =
    sb && !isInline ? Option.some(renderStatusbar(editor, backstage.shared.providers)) : Option.none<AlloySpec>();

  const socketSidebarContainer: SimpleSpec = {
    dom: {
      tag: 'div',
      classes: [ 'tox-sidebar-wrap' ]
    },
    components: [
      partSocket,
      partSidebar
    ]
  };

  // False should stop the menubar and toolbar rendering altogether
  const hasMultipleToolbar = Settings.isMultipleToolbars(editor);
  const hasToolbar = Settings.isToolbarEnabled(editor);
  const hasMenubar = Settings.isMenubarEnabled(editor);

  const getPartToolbar = () => {
    if (hasMultipleToolbar) {
      return [ partMultipleToolbar ];
    } else if (hasToolbar) {
      return [ partToolbar ];
    } else {
      return [ ];
    }
  };

  const partHeader = OuterContainer.parts().header({
    dom: {
      tag: 'div',
      classes: [ 'tox-editor-header' ],
      ...verticalDirAttributes
    },
    components: Arr.flatten<AlloySpec>([
      hasMenubar ? [ partMenubar ] : [ ],
      getPartToolbar(),
      // fixed_toolbar_container anchors to the editable area, else add an anchor bar
      Settings.useFixedContainer(editor) ? [ ] : [ memAnchorBar.asSpec() ]
    ]),
    sticky: Settings.isStickyToolbar(editor),
    editor,
    sharedBackstage: backstage.shared
  });

  // We need the statusbar to be separate to everything else so resizing works properly
  const editorComponents = Arr.flatten<AlloySpec>([
    isToolbarBottom ? [ ] : [ partHeader ],
    // Inline mode does not have a socket/sidebar
    isInline ? [ ] : [ socketSidebarContainer ],
    isToolbarBottom ? [ partHeader ] : [ ]
  ]);

  const editorContainer = {
    dom: {
      tag: 'div',
      classes: [ 'tox-editor-container' ]
    },
    components: editorComponents
  };

  const containerComponents = Arr.flatten<AlloySpec>([
    [ editorContainer ],
    // Inline mode does not have a status bar
    isInline ? [ ] : statusbar.toArray(),
    [ partThrobber ]
  ]);

  // Hide the outer container if using inline mode and there's no menubar or toolbar
  const isHidden = Settings.isDistractionFree(editor);

  const attributes = {
    role: 'application',
    ...I18n.isRtl() ? { dir: 'rtl' } : {},
    ...isHidden ? { 'aria-hidden': 'true' } : {}
  };

  const outerContainer = GuiFactory.build(
    OuterContainer.sketch({
      dom: {
        tag: 'div',
        classes: [ 'tox', 'tox-tinymce' ]
          .concat(isInline ? [ 'tox-tinymce-inline' ] : [])
          .concat(isToolbarBottom ? [ 'tox-tinymce--toolbar-bottom' ] : [])
          .concat(deviceClasses)
          .concat(platformClasses),
        styles: {
          // This is overridden by the skin, it helps avoid FOUC
          visibility: 'hidden',
          // Hide the container if needed, but don't use "display: none" so that it still has a position
          ...isHidden ? { opacity: '0', border: '0' } : {}
        },
        attributes
      },
      components: containerComponents,
      behaviours: Behaviour.derive([
        Keying.config({
          mode: 'cyclic',
          selector: '.tox-menubar, .tox-toolbar, .tox-toolbar__primary, .tox-toolbar__overflow--open, .tox-sidebar__overflow--open, .tox-statusbar__path, .tox-statusbar__wordcount, .tox-statusbar__branding a'
        })
      ])
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

  const setEditorSize = () => {
    // Set height and width if they were given, though height only applies to iframe mode
    const parsedHeight = Utils.numToPx(EditorSize.getHeightWithFallback(editor));
    const parsedWidth = Utils.numToPx(EditorSize.getWidthWithFallback(editor));

    if (!editor.inline) {
      // Update the width
      if (Css.isValidValue('div', 'width', parsedWidth)) {
        Css.set(outerContainer.element(), 'width', parsedWidth);
      }

      // Update the height
      if (Css.isValidValue('div', 'height', parsedHeight)) {
        Css.set(outerContainer.element(), 'height', parsedHeight);
      } else {
        Css.set(outerContainer.element(), 'height', '200px');
      }
    }

    return parsedHeight;
  };

  const renderUI = function (): ModeRenderInfo {
    header.setup(editor, backstage.shared, lazyHeader);
    FormatControls.setup(editor, backstage);
    SilverContextMenu.setup(editor, lazySink, backstage);
    Sidebar.setup(editor);
    Throbber.setup(editor, lazyThrobber, backstage.shared);

    Obj.map(Settings.getToolbarGroups(editor), (toolbarGroupButtonConfig, name) => {
      editor.ui.registry.addGroupToolbarButton(name, toolbarGroupButtonConfig);
    });

    // Apply Bridge types
    const { buttons, menuItems, contextToolbars, sidebars } = editor.ui.registry.getAll();
    const toolbarOpt: Option<ToolbarConfig> = Settings.getMultipleToolbarsSetting(editor);
    const rawUiConfig: RenderUiConfig = {
      menuItems,

      menus: Settings.getMenus(editor),
      menubar: Settings.getMenubar(editor),
      toolbar: toolbarOpt.getOrThunk(() => Settings.getToolbar(editor)),
      allowToolbarGroups: toolbarMode === Settings.ToolbarMode.floating,
      buttons,

      // Apollo, not implemented yet
      sidebar: sidebars
    };

    ContextToolbar.register(editor, contextToolbars, sink, { backstage });

    TableSelectorHandles.setup(editor, sink);

    const elm = editor.getElement();
    const height = setEditorSize();

    const uiComponents: RenderUiComponents = { mothership, uiMothership, outerContainer };
    const args: RenderArgs = { targetNode: elm, height };
    return mode.render(editor, uiComponents, rawUiConfig, backstage, args);
  };

  return { mothership, uiMothership, backstage, renderUI, getUi };
};

export {
  setup
};
