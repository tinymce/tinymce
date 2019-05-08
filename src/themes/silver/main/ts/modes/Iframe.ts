/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, Attachment, Disabling, SplitToolbar } from '@ephox/alloy';
import { Cell, Option } from '@ephox/katamari';
import { Body, DomEvent, Element, Selectors, Position } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import * as Settings from '../api/Settings';
import OuterContainer from '../ui/general/OuterContainer';
import { identifyMenus } from '../ui/menus/menubar/Integration';
import { identifyButtons } from '../ui/toolbar/Integration';
import { iframe as loadIframeSkin } from './../ui/skin/Loader';
import { RenderUiComponents, RenderUiConfig, RenderArgs, ModeRenderInfo } from '../Render';
import { UiFactoryBackstage } from '../backstage/Backstage';
import Events from '../api/Events';

const DOM = DOMUtils.DOM;

const handleSwitchMode = (uiComponents: RenderUiComponents) => {
  return (e) => {
    const outerContainer = uiComponents.outerContainer;
    Selectors.all('*', outerContainer.element()).forEach((elm) => {
      outerContainer.getSystem().getByDom(elm).each((comp: AlloyComponent) => {
        if (comp.hasConfigured(Disabling)) {
          if (e.mode === 'readonly') {
            Disabling.disable(comp);
          } else {
            Disabling.enable(comp);
          }
        }
      });
    });
  };
};

const setupEvents = (editor: Editor) => {
  const contentWindow = editor.getWin();
  const initialDocEle = editor.getDoc().documentElement;

  const lastWindowDimensions = Cell(Position(contentWindow.innerWidth, contentWindow.innerHeight));
  const lastDocumentDimensions = Cell(Position(initialDocEle.offsetWidth, initialDocEle.offsetHeight));

  const resize = () => {
    // Don't use the initial doc ele, as there's a small chance it may have changed
    const docEle = editor.getDoc().documentElement;

    // Check if the window or document dimensions have changed and if so then trigger a content resize event
    const outer = lastWindowDimensions.get();
    const inner = lastDocumentDimensions.get();
    if (outer.left() !== contentWindow.innerWidth || outer.top() !== contentWindow.innerHeight) {
      lastWindowDimensions.set(Position(contentWindow.innerWidth, contentWindow.innerHeight));
      Events.fireResizeContent(editor);
    } else if (inner.left() !== docEle.offsetWidth || inner.top() !== docEle.offsetHeight) {
      lastDocumentDimensions.set(Position(docEle.offsetWidth, docEle.offsetHeight));
      Events.fireResizeContent(editor);
    }
  };

  DOM.bind(contentWindow, 'resize', resize);

  // Bind to async load events and trigger a content resize event if the size has changed
  const elementLoad = DomEvent.capture(Element.fromDom(editor.getBody()), 'load', resize);

  editor.on('remove', () => {
    elementLoad.unbind();
    DOM.unbind(contentWindow, 'resize', resize);
  });
};

const render = (editor: Editor, uiComponents: RenderUiComponents, rawUiConfig: RenderUiConfig, backstage: UiFactoryBackstage, args: RenderArgs): ModeRenderInfo => {
  loadIframeSkin(editor);

  Attachment.attachSystemAfter(Element.fromDom(args.targetNode), uiComponents.mothership);
  Attachment.attachSystem(Body.body(), uiComponents.uiMothership);

  editor.on('init', () => {
    OuterContainer.setToolbar(
      uiComponents.outerContainer,
      identifyButtons(editor, rawUiConfig, {backstage}, Option.none())
    );

    OuterContainer.setMenubar(
      uiComponents.outerContainer,
      identifyMenus(editor, rawUiConfig)
    );

    OuterContainer.setSidebar(
      uiComponents.outerContainer,
      rawUiConfig.sidebar
    );

    // Force an update of the ui components disabled states if in readonly mode
    if (editor.readonly) {
      handleSwitchMode(uiComponents)({mode: 'readonly'});
    }

    setupEvents(editor);
  });

  const socket = OuterContainer.getSocket(uiComponents.outerContainer).getOrDie('Could not find expected socket element');

  editor.on('SwitchMode', handleSwitchMode(uiComponents));

  if (Settings.isReadOnly(editor)) {
    editor.setMode('readonly');
  }

  editor.addCommand('ToggleSidebar', (ui: boolean, value: string) => {
    OuterContainer.toggleSidebar(uiComponents.outerContainer, value);
    editor.fire('ToggleSidebar');
  });

  editor.addQueryValueHandler('ToggleSidebar', () => {
    return OuterContainer.whichSidebar(uiComponents.outerContainer);
  });

  const drawer = Settings.getToolbarDrawer(editor);

  const refreshDrawer = () => {
    const toolbar = OuterContainer.getToolbar(uiComponents.outerContainer);
    toolbar.each(SplitToolbar.refresh);
  };

  if (drawer === Settings.ToolbarDrawer.sliding || drawer === Settings.ToolbarDrawer.floating) {
    editor.on('ResizeContent', refreshDrawer);
  }

  return {
    iframeContainer: socket.element().dom(),
    editorContainer: uiComponents.outerContainer.element().dom(),
  };
};

export default {
  render,
  getBehaviours: (_) => []
};