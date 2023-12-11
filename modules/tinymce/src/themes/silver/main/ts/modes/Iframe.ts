import { Attachment, Channels, Disabling } from '@ephox/alloy';
import { Arr, Cell, Throttler, Type } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Css, DomEvent, SugarElement, SugarPosition, SugarShadowDom } from '@ephox/sugar';

import { EventUtilsEvent } from 'tinymce/core/api/dom/EventUtils';
import Editor from 'tinymce/core/api/Editor';
import { EditorUiApi } from 'tinymce/core/api/ui/Ui';

import * as Events from '../api/Events';
import * as Options from '../api/Options';
import { UiFactoryBackstage } from '../backstage/Backstage';
import * as ReadOnly from '../ReadOnly';
import { ModeRenderInfo, RenderArgs, RenderUiConfig } from '../Render';
import OuterContainer from '../ui/general/OuterContainer';
import { identifyMenus } from '../ui/menus/menubar/Integration';
import { iframe as loadIframeSkin } from '../ui/skin/Loader';
import { setToolbar } from './Toolbars';
import { ReadyUiReferences } from './UiReferences';

const detection = PlatformDetection.detect();
const isiOS12 = detection.os.isiOS() && detection.os.version.major <= 12;

const setupEvents = (editor: Editor, uiRefs: ReadyUiReferences) => {
  const { uiMotherships } = uiRefs;
  const dom = editor.dom;
  let contentWindow = editor.getWin();
  const initialDocEle = editor.getDoc().documentElement;

  const lastWindowDimensions = Cell(SugarPosition(contentWindow.innerWidth, contentWindow.innerHeight));
  const lastDocumentDimensions = Cell(SugarPosition(initialDocEle.offsetWidth, initialDocEle.offsetHeight));

  const resizeWindow = () => {
    // Check if the window dimensions have changed and if so then trigger a content resize event
    const outer = lastWindowDimensions.get();
    if (outer.left !== contentWindow.innerWidth || outer.top !== contentWindow.innerHeight) {
      lastWindowDimensions.set(SugarPosition(contentWindow.innerWidth, contentWindow.innerHeight));
      Events.fireResizeContent(editor);
    }
  };

  const resizeDocument = () => {
    // Don't use the initial doc ele, as there's a small chance it may have changed
    const docEle = editor.getDoc().documentElement;

    // Check if the document dimensions have changed and if so then trigger a content resize event
    const inner = lastDocumentDimensions.get();
    if (inner.left !== docEle.offsetWidth || inner.top !== docEle.offsetHeight) {
      lastDocumentDimensions.set(SugarPosition(docEle.offsetWidth, docEle.offsetHeight));
      Events.fireResizeContent(editor);
    }
  };

  const scroll = (e: EventUtilsEvent<Event>) => {
    Events.fireScrollContent(editor, e);
  };

  dom.bind(contentWindow, 'resize', resizeWindow);
  dom.bind(contentWindow, 'scroll', scroll);

  // Bind to async load events and trigger a content resize event if the size has changed
  const elementLoad = DomEvent.capture(SugarElement.fromDom(editor.getBody()), 'load', resizeDocument);

  // We want to hide ALL UI motherships here.
  editor.on('hide', () => {
    Arr.each(uiMotherships, (m) => {
      Css.set(m.element, 'display', 'none');
    });
  });
  editor.on('show', () => {
    Arr.each(uiMotherships, (m) => {
      Css.remove(m.element, 'display');
    });
  });

  editor.on('NodeChange', resizeDocument);
  editor.on('remove', () => {
    elementLoad.unbind();
    dom.unbind(contentWindow, 'resize', resizeWindow);
    dom.unbind(contentWindow, 'scroll', scroll);

    // Clean memory for IE
    (contentWindow as any) = null;
  });
};

// TINY-9226: When set, the `ui_mode: split` option will create two different sinks (one for popups and one for sinks)
// and the popup sink will be placed adjacent to the editor. This will make it having the same scrolling ancestry.
const attachUiMotherships = (editor: Editor, uiRoot: SugarElement<HTMLElement | ShadowRoot>, uiRefs: ReadyUiReferences) => {
  if (Options.isSplitUiMode(editor)) {
    Attachment.attachSystemAfter(uiRefs.mainUi.mothership.element, uiRefs.popupUi.mothership);
  }
  // In UiRefs, dialogUi and popupUi refer to the same thing if ui_mode: combined
  Attachment.attachSystem(uiRoot, uiRefs.dialogUi.mothership);
};

const render = (editor: Editor, uiRefs: ReadyUiReferences, rawUiConfig: RenderUiConfig, backstage: UiFactoryBackstage, args: RenderArgs): ModeRenderInfo => {
  const { mainUi, uiMotherships } = uiRefs;
  const lastToolbarWidth = Cell(0);
  const outerContainer = mainUi.outerContainer;

  loadIframeSkin(editor);

  const eTargetNode = SugarElement.fromDom(args.targetNode);
  const uiRoot = SugarShadowDom.getContentContainer(SugarShadowDom.getRootNode(eTargetNode));

  Attachment.attachSystemAfter(eTargetNode, mainUi.mothership);
  attachUiMotherships(editor, uiRoot, uiRefs);

  // TINY-10343: Using `SkinLoaded` instead of `PostRender` because if the skin loading takes too long you run in to rendering problems since things are measured before the CSS is being applied
  editor.on('SkinLoaded', () => {
    // Set the sidebar before the toolbar and menubar
    // - each sidebar has an associated toggle toolbar button that needs to check the
    //   sidebar that is set to determine its active state on setup
    OuterContainer.setSidebar(
      outerContainer,
      rawUiConfig.sidebar,
      Options.getSidebarShow(editor)
    );

    setToolbar(editor, uiRefs, rawUiConfig, backstage);
    lastToolbarWidth.set(editor.getWin().innerWidth);

    OuterContainer.setMenubar(
      outerContainer,
      identifyMenus(editor, rawUiConfig)
    );

    OuterContainer.setViews(outerContainer, rawUiConfig.views);

    setupEvents(editor, uiRefs);
  });

  const socket = OuterContainer.getSocket(outerContainer).getOrDie('Could not find expected socket element');

  if (isiOS12) {
    Css.setAll(socket.element, {
      'overflow': 'scroll',
      '-webkit-overflow-scrolling': 'touch' // required for ios < 13 content scrolling
    });

    const limit = Throttler.first(() => {
      editor.dispatch('ScrollContent');
    }, 20);

    const unbinder = DomEvent.bind(socket.element, 'scroll', limit.throttle);
    editor.on('remove', unbinder.unbind);
  }

  ReadOnly.setupReadonlyModeSwitch(editor, uiRefs);

  editor.addCommand('ToggleSidebar', (_ui: boolean, value: string) => {
    OuterContainer.toggleSidebar(outerContainer, value);
    editor.dispatch('ToggleSidebar');
  });

  editor.addQueryValueHandler('ToggleSidebar', () => OuterContainer.whichSidebar(outerContainer) ?? '');

  editor.addCommand('ToggleView', (_ui: boolean, value: string) => {
    if (OuterContainer.toggleView(outerContainer, value)) {
      const target = outerContainer.element;
      mainUi.mothership.broadcastOn([ Channels.dismissPopups() ], { target });
      Arr.each(uiMotherships, (m) => {
        m.broadcastOn([ Channels.dismissPopups() ], { target });
      });

      // Switching back to main view should focus the editor and update any UIs
      if (Type.isNull(OuterContainer.whichView(outerContainer))) {
        editor.focus();
        editor.nodeChanged();
        OuterContainer.refreshToolbar(outerContainer);
      }
    }
  });
  editor.addQueryValueHandler('ToggleView', () => OuterContainer.whichView(outerContainer) ?? '');

  const toolbarMode = Options.getToolbarMode(editor);

  const refreshDrawer = () => {
    OuterContainer.refreshToolbar(uiRefs.mainUi.outerContainer);
  };

  if (toolbarMode === Options.ToolbarMode.sliding || toolbarMode === Options.ToolbarMode.floating) {
    editor.on('ResizeWindow ResizeEditor ResizeContent', () => {
      // Check if the width has changed, if so then refresh the toolbar drawer. We don't care if height changes.
      const width = editor.getWin().innerWidth;
      if (width !== lastToolbarWidth.get()) {
        refreshDrawer();
        lastToolbarWidth.set(width);
      }
    });
  }

  const api: Partial<EditorUiApi> = {
    setEnabled: (state) => {
      ReadOnly.broadcastReadonly(uiRefs, !state);
    },
    isEnabled: () => !Disabling.isDisabled(outerContainer)
  };

  return {
    iframeContainer: socket.element.dom,
    editorContainer: outerContainer.element.dom,
    api
  };
};

export {
  render
};
