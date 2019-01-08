/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloySpec, Behaviour, Gui, GuiFactory, Keying, Positioning, SimpleSpec, Memento } from '@ephox/alloy';
import { AlloyComponent } from '@ephox/alloy/lib/main/ts/ephox/alloy/api/component/ComponentApi';
import { message } from '@ephox/alloy/lib/main/ts/ephox/alloy/api/system/Gui';
import { ConfiguredPart } from '@ephox/alloy/lib/main/ts/ephox/alloy/parts/AlloyParts';
import { HTMLElement } from '@ephox/dom-globals';
import { Arr, Merger, Obj, Option, Result } from '@ephox/katamari';
import { Css } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import { Editor, SidebarConfig } from 'tinymce/core/api/Editor';
import I18n from 'tinymce/core/api/util/I18n';
import { getHeightSetting, getMinHeightSetting, getMinWidthSetting, isToolbarEnabled, isMenubarEnabled, getMultipleToolbarsSetting } from './api/Settings';
import * as Backstage from './backstage/Backstage';
import ContextToolbar from './ContextToolbar';
import Events from './Events';
import Iframe from './modes/Iframe';
import Inline from './modes/Inline';
import OuterContainer, { OuterContainerSketchSpec } from './ui/general/OuterContainer';
import * as SilverContextMenu from './ui/menus/contextmenu/SilverContextMenu';
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
  iframeContainer?;
  editorContainer?;
}

export interface UiChannels {
  broadcastAll: (message: message) => void;
  broadcastOn: (channels: string[], message: message) => void;
  register: () => void;
}

export interface RenderUiComponents {
  mothership: Gui.GuiSystem;
  uiMothership: Gui.GuiSystem;
  outerContainer: AlloyComponent;
}

export interface RenderUiConfig {
  menuItems: Record<string, any>;
  buttons: Record<string, any>;
  menus;
  menubar;
  toolbar;
  sidebar: SidebarConfig[];
}

export interface RenderArgs {
  targetNode: HTMLElement;
  height: number;
}

const setup = (editor: Editor): RenderInfo => {
  const isInline = editor.getParam('inline', false, 'boolean');
  const mode = isInline ? Inline : Iframe;
  let lazyOuterContainer: Option<AlloyComponent> = Option.none();

  const dirAttributes = I18n.isRtl() ? {
    attributes: {
      dir: 'rtl'
    }
  } : {};

  const sink = GuiFactory.build({
    dom: {
      tag: 'div',
      classes: ['tox', 'tox-silver-sink', 'tox-tinymce-aux'],
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
  }).getOrDie('Could not find a toolbar element');

  const backstage: Backstage.UiFactoryBackstage = Backstage.init(sink, editor, lazyAnchorBar);

  const lazySink = () => Result.value<AlloyComponent, Error>(sink);

  const partMenubar: ConfiguredPart = OuterContainer.parts().menubar({
    dom: {
      tag: 'div',
      classes: [ 'tox-menubar' ]
    },
    getSink: lazySink,
    providers: backstage.shared.providers,
    onEscape () {
      editor.focus();
    }
  });

  const partToolbar: ConfiguredPart = OuterContainer.parts().toolbar({
    dom: {
      tag: 'div',
      classes: [ 'tox-toolbar' ]
    },

    onEscape() {
      editor.focus();
    }
  });

  const partSocket: ConfiguredPart = OuterContainer.parts().socket({
    dom: {
      tag: 'div',
      classes: [ 'tox-edit-area' ]
    }
  });

  const partSidebar: ConfiguredPart = OuterContainer.parts().sidebar({
    dom: {
      tag: 'div',
      classes: ['tox-sidebar']
    }
  });

  const statusbar = editor.getParam('statusbar', true, 'boolean') && !isInline ? Option.some(renderStatusbar(editor, backstage.shared.providers)) : Option.none();

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
  const hasToolbar = isToolbarEnabled(editor) || getMultipleToolbarsSetting(editor).isSome();
  const hasMenubar = isMenubarEnabled(editor);

  // We need the statusbar to be separate to everything else so resizing works properly
  const editorComponents = Arr.flatten<AlloySpec>([
    hasMenubar ? [ partMenubar ] : [ ],
    hasToolbar ? [ partToolbar ] : [ ],
    [
      memAnchorBar.asSpec()
    ],
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

  const containerComponents = Arr.flatten<SimpleSpec>([
    [editorContainer],
    // Inline mode does not have a status bar
    isInline ? [ ] : statusbar.toArray()
  ]);

  const attributes = {
    role: 'application',
    ...I18n.isRtl() ? { dir: 'rtl' } : {}
  };

  const outerContainer = GuiFactory.build(
    OuterContainer.sketch({
      dom: {
        tag: 'div',
        classes: ['tox', 'tox-tinymce'].concat(isInline ? ['tox-tinymce-inline'] : []),
        styles: {
          // This is overridden by the skin, it helps avoid FOUC
          visibility: 'hidden'
        },
        attributes
      },
      components: containerComponents,
      behaviours: Behaviour.derive(mode.getBehaviours(editor).concat([
        Keying.config({
          mode: 'cyclic',
          selector: '.tox-menubar, .tox-toolbar, .tox-sidebar--sliding-open, .tox-statusbar__path, .tox-statusbar__wordcount, .tox-statusbar__branding a'
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
    SilverContextMenu.setup(editor, lazySink, backstage.shared);

    // Apply Bridge types
    const { buttons, menuItems, contextToolbars } = editor.ui.registry.getAll();
    const rawUiConfig: RenderUiConfig = {
      menuItems,
      buttons,

      // Apollo, not implemented yet, just patched to work
      menus: !editor.settings.menu ? {} : Obj.map(editor.settings.menu, (menu) => Merger.merge(menu, { items: menu.items })),
      menubar: editor.settings.menubar,
      toolbar: getMultipleToolbarsSetting(editor).getOr(editor.getParam('toolbar', true)),

      // Apollo, not implemented yet
      sidebar: editor.sidebars ? editor.sidebars : []
    };

    ContextToolbar.register(editor, contextToolbars, sink, { backstage });

    const elm = editor.getElement();
    const height = setEditorSize(elm);

    const uiComponents: RenderUiComponents = {mothership, uiMothership, outerContainer};
    const args: RenderArgs = { targetNode: elm, height };
    return mode.render(editor, uiComponents, rawUiConfig, backstage, args);
  };

  return {mothership, uiMothership, backstage, renderUI, getUi};
};

export default {
  setup
};