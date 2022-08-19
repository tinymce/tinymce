import {
  AlloyComponent, AlloyEvents, AlloyParts, AlloySpec, Behaviour, Disabling, Gui, GuiFactory, Keying, Memento, Positioning, SimpleSpec, SystemEvents, VerticalDir
} from '@ephox/alloy';
import { Arr, Merger, Obj, Optional, Result, Singleton } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Compare, Css, SugarBody, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { EditorUiApi } from 'tinymce/core/api/ui/Ui';
import I18n from 'tinymce/core/api/util/I18n';

import * as Options from './api/Options';
import * as Backstage from './backstage/Backstage';
import * as Events from './Events';
import * as Iframe from './modes/Iframe';
import * as Inline from './modes/Inline';
import * as ReadOnly from './ReadOnly';
import * as ContextToolbar from './ui/context/ContextToolbar';
import * as FormatControls from './ui/core/FormatControls';
import OuterContainer from './ui/general/OuterContainer';
import * as StaticHeader from './ui/header/StaticHeader';
import * as StickyHeader from './ui/header/StickyHeader';
import * as SilverContextMenu from './ui/menus/contextmenu/SilverContextMenu';
import { MenuRegistry } from './ui/menus/menubar/Integration';
import * as TableSelectorHandles from './ui/selector/TableSelectorHandles';
import * as Sidebar from './ui/sidebar/Sidebar';
import * as EditorSize from './ui/sizing/EditorSize';
import * as Utils from './ui/sizing/Utils';
import { renderStatusbar } from './ui/statusbar/Statusbar';
import * as Throbber from './ui/throbber/Throbber';
import { RenderToolbarConfig } from './ui/toolbar/Integration';

export interface ModeRenderInfo {
  readonly iframeContainer?: HTMLIFrameElement;
  readonly editorContainer: HTMLElement;
  readonly api?: Partial<EditorUiApi>;
}

export interface RenderInfo {
  readonly getMothership: () => Gui.GuiSystem;
  readonly getUiMothership: () => Gui.GuiSystem;
  readonly backstage: Backstage.UiFactoryBackstage;
  readonly renderUI: () => ModeRenderInfo;
}

export interface RenderUiComponents {
  readonly mothership: Gui.GuiSystem;
  readonly uiMothership: Gui.GuiSystem;
  readonly outerContainer: AlloyComponent;
  readonly sink: AlloyComponent;
}

export type ToolbarConfig = Array<string | Options.ToolbarGroupOption> | string | boolean;

export interface RenderUiConfig extends RenderToolbarConfig, MenuRegistry {
  readonly sidebar: Sidebar.SidebarConfig;
}

export interface RenderArgs {
  readonly targetNode: HTMLElement;
  readonly height: string;
}

const getLazyMothership = (singleton: Singleton.Value<Gui.GuiSystem>) =>
  singleton.get().getOrDie('UI has not been rendered');

const setup = (editor: Editor): RenderInfo => {
  const isInline = editor.inline;
  const mode = isInline ? Inline : Iframe;
  const header = Options.isStickyToolbar(editor) ? StickyHeader : StaticHeader;

  const lazySink = Singleton.value<AlloyComponent>();
  const lazyOuterContainer = Singleton.value<AlloyComponent>();
  const lazyMothership = Singleton.value<Gui.GuiSystem>();
  const lazyUiMothership = Singleton.value<Gui.GuiSystem>();

  const platform = PlatformDetection.detect();
  const isTouch = platform.deviceType.isTouch();
  const touchPlatformClass = 'tox-platform-touch';
  const deviceClasses = isTouch ? [ touchPlatformClass ] : [];
  const isToolbarBottom = Options.isToolbarLocationBottom(editor);
  const toolbarMode = Options.getToolbarMode(editor);

  const memAnchorBar = Memento.record({
    dom: {
      tag: 'div',
      classes: [ 'tox-anchorbar' ]
    }
  });

  const lazyHeader = () => lazyOuterContainer.get().bind(OuterContainer.getHeader);
  const lazySinkResult = () => Result.fromOption(lazySink.get(), 'UI has not been rendered');
  const lazyAnchorBar = () => lazyOuterContainer.get().bind((container) => memAnchorBar.getOpt(container)).getOrDie('Could not find a anchor bar element');
  const lazyToolbar = () => lazyOuterContainer.get().bind((container) => OuterContainer.getToolbar(container)).getOrDie('Could not find more toolbar element');
  const lazyThrobber = () => lazyOuterContainer.get().bind((container) => OuterContainer.getThrobber(container)).getOrDie('Could not find throbber element');

  const backstage: Backstage.UiFactoryBackstage = Backstage.init(lazySinkResult, editor, lazyAnchorBar);

  const makeHeaderPart = (): AlloyParts.ConfiguredPart => {
    const verticalDirAttributes = {
      attributes: {
        [VerticalDir.Attribute]: isToolbarBottom ?
          VerticalDir.AttributeValue.BottomToTop :
          VerticalDir.AttributeValue.TopToBottom
      }
    };

    const partMenubar: AlloySpec = OuterContainer.parts.menubar({
      dom: {
        tag: 'div',
        classes: [ 'tox-menubar' ]
      },
      backstage,
      onEscape: () => {
        editor.focus();
      }
    });

    const partToolbar: AlloySpec = OuterContainer.parts.toolbar({
      dom: {
        tag: 'div',
        classes: [ 'tox-toolbar' ]
      },
      getSink: lazySinkResult,
      providers: backstage.shared.providers,
      onEscape: () => {
        editor.focus();
      },
      type: toolbarMode,
      lazyToolbar,
      lazyHeader: () => lazyHeader().getOrDie('Could not find header element'),
      ...verticalDirAttributes
    });

    const partMultipleToolbar: AlloySpec = OuterContainer.parts['multiple-toolbar']({
      dom: {
        tag: 'div',
        classes: [ 'tox-toolbar-overlord' ]
      },
      providers: backstage.shared.providers,
      onEscape: () => {
        editor.focus();
      },
      type: toolbarMode
    });

    // False should stop the menubar and toolbar rendering altogether
    const hasMultipleToolbar = Options.isMultipleToolbars(editor);
    const hasToolbar = Options.isToolbarEnabled(editor);
    const hasMenubar = Options.isMenubarEnabled(editor);
    const shouldHavePromotion = Options.promotionEnabled(editor);
    const partPromotion = makePromotion();

    const getPartToolbar = () => {
      if (hasMultipleToolbar) {
        return [ partMultipleToolbar ];
      } else if (hasToolbar) {
        return [ partToolbar ];
      } else {
        return [ ];
      }
    };

    const menubarCollection = shouldHavePromotion ? [ partPromotion, partMenubar ] : [ partMenubar ];

    return OuterContainer.parts.header({
      dom: {
        tag: 'div',
        classes: [ 'tox-editor-header' ],
        ...verticalDirAttributes
      },
      components: Arr.flatten<AlloySpec>([
        hasMenubar ? menubarCollection : [ ],
        getPartToolbar(),
        // fixed_toolbar_container anchors to the editable area, else add an anchor bar
        Options.useFixedContainer(editor) ? [ ] : [ memAnchorBar.asSpec() ]
      ]),
      sticky: Options.isStickyToolbar(editor),
      editor,
      sharedBackstage: backstage.shared
    });
  };

  const makePromotion = () => {
    return OuterContainer.parts.promotion({
      dom: {
        tag: 'div',
        classes: [ 'tox-promotion' ],
      },
    });
  };

  const makeSidebarDefinition = (): SimpleSpec => {
    const partSocket: AlloySpec = OuterContainer.parts.socket({
      dom: {
        tag: 'div',
        classes: [ 'tox-edit-area' ]
      }
    });

    const partSidebar: AlloySpec = OuterContainer.parts.sidebar({
      dom: {
        tag: 'div',
        classes: [ 'tox-sidebar' ]
      }
    });

    return {
      dom: {
        tag: 'div',
        classes: [ 'tox-sidebar-wrap' ]
      },
      components: [
        partSocket,
        partSidebar
      ]
    };
  };

  const renderSink = () => {
    const uiContainer = Options.getUiContainer(editor);

    // TINY-3321: When the body is using a grid layout, we need to ensure the sink width is manually set
    const isGridUiContainer = Compare.eq(SugarBody.body(), uiContainer) && Css.get(uiContainer as SugarElement<HTMLElement>, 'display') === 'grid';

    const sinkSpec = {
      dom: {
        tag: 'div',
        classes: [ 'tox', 'tox-silver-sink', 'tox-tinymce-aux' ].concat(deviceClasses),
        attributes: {
          ...I18n.isRtl() ? { dir: 'rtl' } : {}
        }
      },
      behaviours: Behaviour.derive([
        Positioning.config({
          useFixed: () => header.isDocked(lazyHeader)
        })
      ])
    };

    const reactiveWidthSpec = {
      dom: {
        styles: { width: document.body.clientWidth + 'px' }
      },
      events: AlloyEvents.derive([
        AlloyEvents.run(SystemEvents.windowResize(), (comp) => {
          Css.set(comp.element, 'width', document.body.clientWidth + 'px');
        })
      ])
    };

    const sink = GuiFactory.build(Merger.deepMerge(sinkSpec, isGridUiContainer ? reactiveWidthSpec : {}));
    const uiMothership = Gui.takeover(sink);

    lazySink.set(sink);
    lazyUiMothership.set(uiMothership);

    return { sink, uiMothership };
  };

  const renderContainer = () => {
    const partHeader = makeHeaderPart();
    const sidebarContainer = makeSidebarDefinition();

    const partThrobber: AlloySpec = OuterContainer.parts.throbber({
      dom: {
        tag: 'div',
        classes: [ 'tox-throbber' ]
      },
      backstage
    });

    const statusbar: Optional<AlloySpec> =
      Options.useStatusBar(editor) && !isInline ? Optional.some(renderStatusbar(editor, backstage.shared.providers)) : Optional.none<AlloySpec>();

    // We need the statusbar to be separate to everything else so resizing works properly
    const editorComponents = Arr.flatten<AlloySpec>([
      isToolbarBottom ? [ ] : [ partHeader ],
      // Inline mode does not have a socket/sidebar
      isInline ? [ ] : [ sidebarContainer ],
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
    const isHidden = Options.isDistractionFree(editor);

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
            .concat(deviceClasses),
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
          ReadOnly.receivingConfig(),
          Disabling.config({
            disableClass: 'tox-tinymce--disabled'
          }),
          Keying.config({
            mode: 'cyclic',
            selector: '.tox-menubar, .tox-toolbar, .tox-toolbar__primary, .tox-toolbar__overflow--open, .tox-sidebar__overflow--open, .tox-statusbar__path, .tox-statusbar__wordcount, .tox-statusbar__branding a, .tox-statusbar__resize-handle'
          })
        ])
      })
    );

    const mothership = Gui.takeover(outerContainer);

    lazyOuterContainer.set(outerContainer);
    lazyMothership.set(mothership);

    return { mothership, outerContainer };
  };

  const setEditorSize = (outerContainer: AlloyComponent) => {
    // Set height and width if they were given, though height only applies to iframe mode
    const parsedHeight = Utils.numToPx(EditorSize.getHeightWithFallback(editor));
    const parsedWidth = Utils.numToPx(EditorSize.getWidthWithFallback(editor));

    if (!editor.inline) {
      // Update the width
      if (Css.isValidValue('div', 'width', parsedWidth)) {
        Css.set(outerContainer.element, 'width', parsedWidth);
      }

      // Update the height
      if (Css.isValidValue('div', 'height', parsedHeight)) {
        Css.set(outerContainer.element, 'height', parsedHeight);
      } else {
        Css.set(outerContainer.element, 'height', '400px');
      }
    }

    return parsedHeight;
  };

  const setupShortcutsAndCommands = (outerContainer: AlloyComponent): void => {
    editor.addShortcut('alt+F9', 'focus menubar', () => {
      OuterContainer.focusMenubar(outerContainer);
    });

    editor.addShortcut('alt+F10', 'focus toolbar', () => {
      OuterContainer.focusToolbar(outerContainer);
    });

    editor.addCommand('ToggleToolbarDrawer', () => {
      OuterContainer.toggleToolbarDrawer(outerContainer);
      // TODO: Consider firing event - TINY-6371
    });

    editor.addQueryStateHandler('ToggleToolbarDrawer', () => OuterContainer.isToolbarDrawerToggled(outerContainer));
  };

  const renderUI = (): ModeRenderInfo => {
    const { mothership, outerContainer } = renderContainer();
    const { uiMothership, sink } = renderSink();

    Obj.map(Options.getToolbarGroups(editor), (toolbarGroupButtonConfig, name) => {
      editor.ui.registry.addGroupToolbarButton(name, toolbarGroupButtonConfig);
    });

    // Apply Bridge types
    const { buttons, menuItems, contextToolbars, sidebars } = editor.ui.registry.getAll();
    const toolbarOpt: Optional<ToolbarConfig> = Options.getMultipleToolbarsOption(editor);
    const rawUiConfig: RenderUiConfig = {
      menuItems,
      menus: Options.getMenus(editor),
      menubar: Options.getMenubar(editor),
      toolbar: toolbarOpt.getOrThunk(() => Options.getToolbar(editor)),
      allowToolbarGroups: toolbarMode === Options.ToolbarMode.floating,
      buttons,
      sidebar: sidebars
    };

    setupShortcutsAndCommands(outerContainer);
    Events.setup(editor, mothership, uiMothership);
    header.setup(editor, backstage.shared, lazyHeader);
    FormatControls.setup(editor, backstage);
    SilverContextMenu.setup(editor, lazySinkResult, backstage);
    Sidebar.setup(editor);
    Throbber.setup(editor, lazyThrobber, backstage.shared);
    ContextToolbar.register(editor, contextToolbars, sink, { backstage });
    TableSelectorHandles.setup(editor, sink);

    const elm = editor.getElement();
    const height = setEditorSize(outerContainer);

    const uiComponents: RenderUiComponents = { mothership, uiMothership, outerContainer, sink };
    const args: RenderArgs = { targetNode: elm, height };
    return mode.render(editor, uiComponents, rawUiConfig, backstage, args);
  };

  const getMothership = (): Gui.GuiSystem => getLazyMothership(lazyMothership);
  const getUiMothership = (): Gui.GuiSystem => getLazyMothership(lazyUiMothership);

  return { getMothership, getUiMothership, backstage, renderUI };
};

export {
  setup
};
