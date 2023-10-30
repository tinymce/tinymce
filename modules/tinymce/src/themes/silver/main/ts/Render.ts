import {
  AlloyComponent, AlloyEvents, AlloyParts, AlloySpec, Behaviour, Boxes, Disabling, Gui, GuiFactory, Keying, Memento, Positioning, SimpleSpec, SystemEvents, VerticalDir
} from '@ephox/alloy';
import { Arr, Merger, Obj, Optional, Result, Singleton } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Compare, Css, SugarBody, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { EditorUiApi } from 'tinymce/core/api/ui/Ui';
import I18n from 'tinymce/core/api/util/I18n';

import * as Events from './api/Events';
import * as Options from './api/Options';
import * as Backstage from './backstage/Backstage';
import * as DomEvents from './Events';
import * as Iframe from './modes/Iframe';
import * as Inline from './modes/Inline';
import { LazyUiReferences, ReadyUiReferences, SinkAndMothership } from './modes/UiReferences';
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
import { ViewConfig } from './ui/view/ViewTypes';

export interface ModeRenderInfo {
  readonly iframeContainer?: HTMLIFrameElement;
  readonly editorContainer: HTMLElement;
  readonly api?: Partial<EditorUiApi>;
}

export interface RenderInfo {
  readonly popups: {
    readonly getMothership: () => Gui.GuiSystem;
    readonly backstage: Backstage.UiFactoryBackstage;
  };
  readonly dialogs: {
    readonly getMothership: () => Gui.GuiSystem;
    readonly backstage: Backstage.UiFactoryBackstage;
  };
  readonly renderUI: () => ModeRenderInfo;
}

export type ToolbarConfig = Array<string | Options.ToolbarGroupOption> | string | boolean;

export interface RenderUiConfig extends RenderToolbarConfig, MenuRegistry {
  readonly sidebar: Sidebar.SidebarConfig;
  readonly views: ViewConfig;
}

export interface RenderArgs {
  readonly targetNode: HTMLElement;
  readonly height: string;
}

export interface ThemeRenderSetup {
  readonly getPopupSinkBounds: () => Boxes.Bounds;
}

const getLazyMothership = (label: string, singleton: Singleton.Value<Gui.GuiSystem>) =>
  singleton.get().getOrDie(`UI for ${label} has not been rendered`);

const setup = (editor: Editor, setupForTheme: ThemeRenderSetup): RenderInfo => {
  const isInline = editor.inline;
  const mode = isInline ? Inline : Iframe;

  // We use a different component for creating the sticky toolbar behaviour. The
  // most important difference is it needs "Docking" configured and all of the
  // ripple effects that creates.
  const header = Options.isStickyToolbar(editor) ? StickyHeader : StaticHeader;

  const lazyUiRefs = LazyUiReferences();

  // Importantly, this is outside the setup function.
  const lazyMothership = Singleton.value<Gui.GuiSystem>();
  const lazyDialogMothership = Singleton.value<Gui.GuiSystem>();
  const lazyPopupMothership = Singleton.value<Gui.GuiSystem>();

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

  const memBottomAnchorBar = Memento.record({
    dom: {
      tag: 'div',
      classes: [ 'tox-bottom-anchorbar' ]
    }
  });

  const lazyHeader = () => lazyUiRefs.mainUi.get()
    .map((ui) => ui.outerContainer)
    .bind(OuterContainer.getHeader);

  const lazyDialogSinkResult = () => Result.fromOption(
    lazyUiRefs.dialogUi.get().map((ui) => ui.sink),
    'UI has not been rendered'
  );

  const lazyPopupSinkResult = () => Result.fromOption(
    lazyUiRefs.popupUi.get().map((ui) => ui.sink),
    '(popup) UI has not been rendered'
  );

  const lazyAnchorBar = lazyUiRefs.lazyGetInOuterOrDie(
    'anchor bar',
    memAnchorBar.getOpt
  );

  const lazyBottomAnchorBar = lazyUiRefs.lazyGetInOuterOrDie(
    'bottom anchor bar',
    memBottomAnchorBar.getOpt
  );

  const lazyToolbar = lazyUiRefs.lazyGetInOuterOrDie(
    'toolbar',
    OuterContainer.getToolbar
  );

  const lazyThrobber = lazyUiRefs.lazyGetInOuterOrDie(
    'throbber',
    OuterContainer.getThrobber
  );

  // Here, we build the backstage. The backstage is going to use different sinks for dialog
  // vs popup.
  const backstages: Backstage.UiFactoryBackstagePair = Backstage.init(
    {
      popup: lazyPopupSinkResult,
      dialog: lazyDialogSinkResult
    },
    editor,
    lazyAnchorBar,
    lazyBottomAnchorBar
  );

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
      // TINY-9223: The menu bar should scroll with the editor.
      backstage: backstages.popup,
      onEscape: () => {
        editor.focus();
      }
    });

    const partToolbar: AlloySpec = OuterContainer.parts.toolbar({
      dom: {
        tag: 'div',
        classes: [ 'tox-toolbar' ]
      },
      getSink: backstages.popup.shared.getSink,
      providers: backstages.popup.shared.providers,
      onEscape: () => {
        editor.focus();
      },
      onToolbarToggled: (state: boolean) => {
        Events.fireToggleToolbarDrawer(editor, state);
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
      providers: backstages.popup.shared.providers,
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
    const hasAnyContents = hasMultipleToolbar || hasToolbar || hasMenubar;

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
        classes: [ 'tox-editor-header' ]
          .concat(hasAnyContents ? [] : [ 'tox-editor-header--empty' ]),
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
      // TINY-9223: If using a sticky toolbar, which sink should it really go in?
      sharedBackstage: backstages.popup.shared
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

  const renderDialogUi = () => {
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

    lazyDialogMothership.set(uiMothership);

    return { sink, mothership: uiMothership };
  };

  const renderPopupUi = () => {
    // TINY-9226: Because the popupUi is going to be placed adjacent to the editor, we aren't currently
    // implementing the behaviour to reset widths based on window sizing. It is a workaround that
    // is mainly targeted at Ui containers in the root. However, we may need to revisit this
    // if the ui_mode: split setting is commonly used when the editor is at the root level, and the
    // page has size-unfriendly CSS for sinks (like CSS grid)
    const sinkSpec = {
      dom: {
        tag: 'div',
        classes: [ 'tox', 'tox-silver-sink', 'tox-silver-popup-sink', 'tox-tinymce-aux' ].concat(deviceClasses),
        attributes: {
          ...I18n.isRtl() ? { dir: 'rtl' } : {}
        }
      },
      behaviours: Behaviour.derive([
        Positioning.config({
          useFixed: () => header.isDocked(lazyHeader),

          // TINY-9226: We want to limit the popup sink's bounds based on its scrolling environment. We don't
          // want it to try to position things outside of its scrolling viewport, because they will
          // just appear offscreen (hidden by the current scroll values)
          getBounds: () => setupForTheme.getPopupSinkBounds()
        })
      ])
    };

    const sink = GuiFactory.build(sinkSpec);
    const uiMothership = Gui.takeover(sink);

    lazyPopupMothership.set(uiMothership);

    return { sink, mothership: uiMothership };
  };

  const renderMainUi = () => {
    const partHeader = makeHeaderPart();
    const sidebarContainer = makeSidebarDefinition();

    const partThrobber: AlloySpec = OuterContainer.parts.throbber({
      dom: {
        tag: 'div',
        classes: [ 'tox-throbber' ]
      },
      backstage: backstages.popup
    });

    const partViewWrapper: AlloySpec = OuterContainer.parts.viewWrapper({
      backstage: backstages.popup
    });

    const statusbar: Optional<AlloySpec> =
      Options.useStatusBar(editor) && !isInline ? Optional.some(
        renderStatusbar(editor, backstages.popup.shared.providers)
      ) : Optional.none<AlloySpec>();

    // We need the statusbar to be separate to everything else so resizing works properly
    const editorComponents = Arr.flatten<AlloySpec>([
      isToolbarBottom ? [ ] : [ partHeader ],
      // Inline mode does not have a socket/sidebar
      isInline ? [ ] : [ sidebarContainer ],
      isToolbarBottom ? [ partHeader ] : [ ]
    ]);

    const editorContainer = OuterContainer.parts.editorContainer({
      components: Arr.flatten<AlloySpec>([
        editorComponents,
        // Inline mode does not have a status bar
        isInline ? [ ] : [ memBottomAnchorBar.asSpec(), ...statusbar.toArray() ]
      ])
    });

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
        components: [
          editorContainer,
          ...isInline ? [] : [ partViewWrapper ],
          partThrobber,
        ],
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

    editor.addCommand('ToggleToolbarDrawer', (_ui, options?: { skipFocus: boolean }) => {
      if (options?.skipFocus) {
        OuterContainer.toggleToolbarDrawerWithoutFocusing(outerContainer);
      } else {
        OuterContainer.toggleToolbarDrawer(outerContainer);
      }
    });

    editor.addQueryStateHandler('ToggleToolbarDrawer', () => OuterContainer.isToolbarDrawerToggled(outerContainer));
  };

  const renderUIWithRefs = (uiRefs: ReadyUiReferences): ModeRenderInfo => {
    const { mainUi, popupUi, uiMotherships } = uiRefs;
    Obj.map(Options.getToolbarGroups(editor), (toolbarGroupButtonConfig, name) => {
      editor.ui.registry.addGroupToolbarButton(name, toolbarGroupButtonConfig);
    });

    // Apply Bridge types
    const { buttons, menuItems, contextToolbars, sidebars, views } = editor.ui.registry.getAll();
    const toolbarOpt: Optional<ToolbarConfig> = Options.getMultipleToolbarsOption(editor);
    const rawUiConfig: RenderUiConfig = {
      menuItems,
      menus: Options.getMenus(editor),
      menubar: Options.getMenubar(editor),
      toolbar: toolbarOpt.getOrThunk(() => Options.getToolbar(editor)),
      allowToolbarGroups: toolbarMode === Options.ToolbarMode.floating,
      buttons,
      sidebar: sidebars,
      views
    };

    setupShortcutsAndCommands(mainUi.outerContainer);
    DomEvents.setup(editor, mainUi.mothership, uiMotherships);

    // This backstage needs to kept in sync with the one passed to the Header part.
    header.setup(editor, backstages.popup.shared, lazyHeader);
    // This backstage is probably needed for just the bespoke dropdowns
    FormatControls.setup(editor, backstages.popup);
    SilverContextMenu.setup(editor, backstages.popup.shared.getSink, backstages.popup);
    Sidebar.setup(editor);
    Throbber.setup(editor, lazyThrobber, backstages.popup.shared);
    ContextToolbar.register(editor, contextToolbars, popupUi.sink, { backstage: backstages.popup });
    TableSelectorHandles.setup(editor, popupUi.sink);

    const elm = editor.getElement();
    const height = setEditorSize(mainUi.outerContainer);

    const args: RenderArgs = { targetNode: elm, height };
    // The only components that use backstages.dialog currently are the Modal dialogs.
    return mode.render(editor, uiRefs, rawUiConfig, backstages.popup, args);
  };

  const reuseDialogUiForPopuUi = (dialogUi: SinkAndMothership) => {
    lazyPopupMothership.set(dialogUi.mothership);
    return dialogUi;
  };

  const renderUI = (): ModeRenderInfo => {
    const mainUi = renderMainUi();
    const dialogUi = renderDialogUi();
    // If dialogUi and popupUi are the same, LazyUiReferences should handle deduplicating then
    // get calling getUiMotherships
    const popupUi = Options.isSplitUiMode(editor) ? renderPopupUi() : reuseDialogUiForPopuUi(dialogUi);

    lazyUiRefs.dialogUi.set(dialogUi);
    lazyUiRefs.popupUi.set(popupUi);
    lazyUiRefs.mainUi.set(mainUi);

    // From this point on, we shouldn't use LazyReferences any more.
    const uiRefs: ReadyUiReferences = {
      popupUi,
      dialogUi,
      mainUi,
      uiMotherships: lazyUiRefs.getUiMotherships()
    };

    return renderUIWithRefs(uiRefs);
  };

  // We don't have uiRefs here, so we have to rely on cells that are set by renderUI unfortunately.
  return {
    popups: {
      backstage: backstages.popup,
      getMothership: (): Gui.GuiSystem => getLazyMothership('popups', lazyPopupMothership)
    },
    dialogs: {
      backstage: backstages.dialog,
      getMothership: (): Gui.GuiSystem => getLazyMothership('dialogs', lazyDialogMothership)
    },
    renderUI
  };
};

export {
  setup
};
