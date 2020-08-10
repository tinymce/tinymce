/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Attachment } from '@ephox/alloy';
import { Cell, Throttler } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Event } from '@ephox/dom-globals';
import { Css, DomEvent, Element, Position, ShadowDom } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import { EventUtilsEvent } from 'tinymce/core/api/dom/EventUtils';
import Editor from 'tinymce/core/api/Editor';
import * as Events from '../api/Events';
import * as Settings from '../api/Settings';
import { UiFactoryBackstage } from '../backstage/Backstage';
import * as ReadOnly from '../ReadOnly';
import { ModeRenderInfo, RenderArgs, RenderUiComponents, RenderUiConfig } from '../Render';
import OuterContainer from '../ui/general/OuterContainer';
import { identifyMenus } from '../ui/menus/menubar/Integration';
import { iframe as loadIframeSkin } from './../ui/skin/Loader';
import { setToolbar } from './Toolbars';

const DOM = DOMUtils.DOM;
const detection = PlatformDetection.detect();
const isiOS12 = detection.os.isiOS() && detection.os.version.major <= 12;

const setupEvents = (editor: Editor, uiComponents: RenderUiComponents) => {
  const contentWindow = editor.getWin();
  const initialDocEle = editor.getDoc().documentElement;

  const lastWindowDimensions = Cell(Position(contentWindow.innerWidth, contentWindow.innerHeight));
  const lastDocumentDimensions = Cell(Position(initialDocEle.offsetWidth, initialDocEle.offsetHeight));

  const resizeWindow = () => {
    // Check if the window dimensions have changed and if so then trigger a content resize event
    const outer = lastWindowDimensions.get();
    if (outer.left() !== contentWindow.innerWidth || outer.top() !== contentWindow.innerHeight) {
      lastWindowDimensions.set(Position(contentWindow.innerWidth, contentWindow.innerHeight));
      Events.fireResizeContent(editor);
    }
  };

  const resizeDocument = () => {
    // Don't use the initial doc ele, as there's a small chance it may have changed
    const docEle = editor.getDoc().documentElement;

    // Check if the document dimensions have changed and if so then trigger a content resize event
    const inner = lastDocumentDimensions.get();
    if (inner.left() !== docEle.offsetWidth || inner.top() !== docEle.offsetHeight) {
      lastDocumentDimensions.set(Position(docEle.offsetWidth, docEle.offsetHeight));
      Events.fireResizeContent(editor);
    }
  };

  const scroll = (e: EventUtilsEvent<Event>) => Events.fireScrollContent(editor, e);

  DOM.bind(contentWindow, 'resize', resizeWindow);
  DOM.bind(contentWindow, 'scroll', scroll);

  // Bind to async load events and trigger a content resize event if the size has changed
  const elementLoad = DomEvent.capture(Element.fromDom(editor.getBody()), 'load', resizeDocument);

  const mothership = uiComponents.uiMothership.element();
  editor.on('hide', () => {
    Css.set(mothership, 'display', 'none');
  });
  editor.on('show', () => {
    Css.remove(mothership, 'display');
  });

  editor.on('NodeChange', resizeDocument);
  editor.on('remove', () => {
    elementLoad.unbind();
    DOM.unbind(contentWindow, 'resize', resizeWindow);
    DOM.unbind(contentWindow, 'scroll', scroll);
  });
};

const render = (editor: Editor, uiComponents: RenderUiComponents, rawUiConfig: RenderUiConfig, backstage: UiFactoryBackstage, args: RenderArgs): ModeRenderInfo => {
  const lastToolbarWidth = Cell(0);

  loadIframeSkin(editor);

  const eTargetNode = Element.fromDom(args.targetNode);
  const uiRoot = ShadowDom.getContentContainer(ShadowDom.getRootNode(eTargetNode));

  Attachment.attachSystemAfter(eTargetNode, uiComponents.mothership);
  Attachment.attachSystem(uiRoot, uiComponents.uiMothership);

  editor.on('PostRender', () => {
    setToolbar(editor, uiComponents, rawUiConfig, backstage);
    lastToolbarWidth.set(editor.getWin().innerWidth);

    OuterContainer.setMenubar(
      uiComponents.outerContainer,
      identifyMenus(editor, rawUiConfig)
    );

    OuterContainer.setSidebar(
      uiComponents.outerContainer,
      rawUiConfig.sidebar
    );

    setupEvents(editor, uiComponents);
  });

  const socket = OuterContainer.getSocket(uiComponents.outerContainer).getOrDie('Could not find expected socket element');

  if (isiOS12) {
    Css.setAll(socket.element(), {
      'overflow': 'scroll',
      '-webkit-overflow-scrolling': 'touch' // required for ios < 13 content scrolling
    });

    const limit = Throttler.first(() => {
      editor.fire('ScrollContent');
    }, 20);

    DomEvent.bind(socket.element(), 'scroll', limit.throttle);
  }

  ReadOnly.setupReadonlyModeSwitch(editor, uiComponents);

  editor.addCommand('ToggleSidebar', (_ui: boolean, value: string) => {
    OuterContainer.toggleSidebar(uiComponents.outerContainer, value);
    editor.fire('ToggleSidebar');
  });

  editor.addQueryValueHandler('ToggleSidebar', () => OuterContainer.whichSidebar(uiComponents.outerContainer));

  const toolbarMode = Settings.getToolbarMode(editor);

  const refreshDrawer = () => {
    OuterContainer.refreshToolbar(uiComponents.outerContainer);
  };

  if (toolbarMode === Settings.ToolbarMode.sliding || toolbarMode === Settings.ToolbarMode.floating) {
    editor.on('ResizeWindow ResizeEditor ResizeContent', () => {
      // Check if the width has changed, if so then refresh the toolbar drawer. We don't care if height changes.
      const width = editor.getWin().innerWidth;
      if (width !== lastToolbarWidth.get()) {
        refreshDrawer();
        lastToolbarWidth.set(width);
      }
    });
  }

  return {
    iframeContainer: socket.element().dom(),
    editorContainer: uiComponents.outerContainer.element().dom()
  };
};

export {
  render
};
