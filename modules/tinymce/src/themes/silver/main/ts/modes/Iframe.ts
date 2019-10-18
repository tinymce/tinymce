/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Attachment } from '@ephox/alloy';
import { Cell, Throttler } from '@ephox/katamari';
import { Body, DomEvent, Element, Position, Css } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import Events from '../api/Events';
import * as Settings from '../api/Settings';
import { UiFactoryBackstage } from '../backstage/Backstage';
import { setupReadonlyModeSwitch } from '../ReadOnly';
import { ModeRenderInfo, RenderArgs, RenderUiComponents, RenderUiConfig } from '../Render';
import OuterContainer from '../ui/general/OuterContainer';
import { identifyMenus } from '../ui/menus/menubar/Integration';
import { iframe as loadIframeSkin } from './../ui/skin/Loader';
import { setToolbar } from './Toolbars';
import { PlatformDetection } from '@ephox/sand';

const DOM = DOMUtils.DOM;
const detection = PlatformDetection.detect();
const isiOS12 = detection.os.isiOS() && detection.os.version.major <= 12;

const setupEvents = (editor: Editor) => {
  const contentWindow = editor.getWin();
  const initialDocEle = editor.getDoc().documentElement;

  const lastWindowDimensions = Cell(Position(contentWindow.innerWidth, contentWindow.innerHeight));
  const lastDocumentDimensions = Cell(Position(initialDocEle.offsetWidth, initialDocEle.offsetHeight));

  const resize = (e) => {
    // Don't use the initial doc ele, as there's a small chance it may have changed
    const docEle = editor.getDoc().documentElement;

    // Check if the window or document dimensions have changed and if so then trigger a content resize event
    const outer = lastWindowDimensions.get();
    const inner = lastDocumentDimensions.get();
    if (outer.left() !== contentWindow.innerWidth || outer.top() !== contentWindow.innerHeight) {
      lastWindowDimensions.set(Position(contentWindow.innerWidth, contentWindow.innerHeight));
      Events.fireResizeContent(editor, e);
    } else if (inner.left() !== docEle.offsetWidth || inner.top() !== docEle.offsetHeight) {
      lastDocumentDimensions.set(Position(docEle.offsetWidth, docEle.offsetHeight));
      Events.fireResizeContent(editor, e);
    }
  };

  const scroll = (e) => Events.fireScrollContent(editor, e);

  DOM.bind(contentWindow, 'resize', resize);
  DOM.bind(contentWindow, 'scroll', scroll);

  // Bind to async load events and trigger a content resize event if the size has changed
  const elementLoad = DomEvent.capture(Element.fromDom(editor.getBody()), 'load', resize);

  editor.on('remove', () => {
    elementLoad.unbind();
    DOM.unbind(contentWindow, 'resize', resize);
    DOM.unbind(contentWindow, 'scroll', scroll);
  });
};

const render = (editor: Editor, uiComponents: RenderUiComponents, rawUiConfig: RenderUiConfig, backstage: UiFactoryBackstage, args: RenderArgs): ModeRenderInfo => {
  const lastToolbarWidth = Cell(0);

  loadIframeSkin(editor);

  Attachment.attachSystemAfter(Element.fromDom(args.targetNode), uiComponents.mothership);
  Attachment.attachSystem(Body.body(), uiComponents.uiMothership);

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

    setupEvents(editor);
  });

  const socket = OuterContainer.getSocket(uiComponents.outerContainer).getOrDie('Could not find expected socket element');

  if (isiOS12 === true) {
    Css.setAll(socket.element(), {
      'overflow': 'scroll',
      '-webkit-overflow-scrolling': 'touch' // required for ios < 13 content scrolling
    });

    const limit = Throttler.first(() => {
      editor.fire('ScrollContent');
    }, 20);

    DomEvent.bind(socket.element(), 'scroll', limit.throttle);
  }

  setupReadonlyModeSwitch(editor, uiComponents);

  editor.addCommand('ToggleSidebar', (ui: boolean, value: string) => {
    OuterContainer.toggleSidebar(uiComponents.outerContainer, value);
    editor.fire('ToggleSidebar');
  });

  editor.addQueryValueHandler('ToggleSidebar', () => {
    return OuterContainer.whichSidebar(uiComponents.outerContainer);
  });

  const drawer = Settings.getToolbarDrawer(editor);

  const refreshDrawer = () => {
    OuterContainer.refreshToolbar(uiComponents.outerContainer);
  };

  if (drawer === Settings.ToolbarDrawer.sliding || drawer === Settings.ToolbarDrawer.floating) {
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
    editorContainer: uiComponents.outerContainer.element().dom(),
  };
};

export default { render };
