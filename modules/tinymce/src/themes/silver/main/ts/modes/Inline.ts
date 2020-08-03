/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, Attachment, Boxes } from '@ephox/alloy';
import { Cell, Singleton } from '@ephox/katamari';
import { DomEvent, Element } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';
import * as Events from '../api/Events';
import { getUiContainer } from '../api/Settings';
import { UiFactoryBackstage } from '../backstage/Backstage';
import * as ReadOnly from '../ReadOnly';
import { ModeRenderInfo, RenderArgs, RenderUiComponents, RenderUiConfig } from '../Render';
import OuterContainer from '../ui/general/OuterContainer';
import { InlineHeader } from '../ui/header/InlineHeader';
import { identifyMenus } from '../ui/menus/menubar/Integration';
import { inline as loadInlineSkin } from './../ui/skin/Loader';
import { setToolbar } from './Toolbars';

const getTargetPosAndBounds = (targetElm: Element, isToolbarTop: boolean) => {
  const bounds = Boxes.box(targetElm);
  return {
    pos: isToolbarTop ? bounds.y : bounds.bottom,
    bounds
  };
};

const setupEvents = (editor: Editor, targetElm: Element, ui: InlineHeader) => {
  const prevPosAndBounds = Cell(getTargetPosAndBounds(targetElm, ui.isPositionedAtTop()));

  const resizeContent = (e) => {
    const { pos, bounds } = getTargetPosAndBounds(targetElm, ui.isPositionedAtTop());
    const { pos: prevPos, bounds: prevBounds } = prevPosAndBounds.get();

    const hasResized = bounds.height !== prevBounds.height || bounds.width !== prevBounds.width;
    prevPosAndBounds.set({ pos, bounds });

    if (hasResized) {
      Events.fireResizeContent(editor, e);
    }

    if (ui.isVisible()) {
      if (prevPos !== pos) {
        ui.update(true);
      } else if (hasResized) {
        ui.updateMode();
        ui.repositionPopups();
      }
    }
  };

  editor.on('activate', ui.show);
  editor.on('deactivate', ui.hide);

  editor.on('SkinLoaded ResizeWindow', () => ui.update(true));

  editor.on('NodeChange keydown', (e) => {
    Delay.requestAnimationFrame(() => resizeContent(e));
  });

  editor.on('ScrollWindow', () => ui.updateMode());

  // Bind to async load events and trigger a content resize event if the size has changed
  const elementLoad = Singleton.unbindable();
  elementLoad.set(DomEvent.capture(Element.fromDom(editor.getBody()), 'load', resizeContent));

  editor.on('remove', () => {
    elementLoad.clear();
  });
};

const render = (editor: Editor, uiComponents: RenderUiComponents, rawUiConfig: RenderUiConfig, backstage: UiFactoryBackstage, args: RenderArgs): ModeRenderInfo => {
  const { mothership, uiMothership, outerContainer } = uiComponents;
  const floatContainer = Cell<AlloyComponent>(null);
  const targetElm = Element.fromDom(args.targetNode);
  const ui = InlineHeader(editor, targetElm, uiComponents, backstage, floatContainer);

  loadInlineSkin(editor);

  const render = () => {
    if (floatContainer.get()) {
      ui.show();
      return;
    }

    floatContainer.set(OuterContainer.getHeader(outerContainer).getOrDie());

    const uiContainer = getUiContainer(editor);
    Attachment.attachSystem(uiContainer, mothership);
    Attachment.attachSystem(uiContainer, uiMothership);

    setToolbar(editor, uiComponents, rawUiConfig, backstage);

    OuterContainer.setMenubar(
      outerContainer,
      identifyMenus(editor, rawUiConfig)
    );

    // Initialise the toolbar - set initial positioning then show
    ui.show();

    setupEvents(editor, targetElm, ui);

    editor.nodeChanged();
  };

  editor.on('focus show', render);
  editor.on('blur hide', ui.hide);

  editor.on('init', () => {
    if (editor.hasFocus()) {
      render();
    }
  });

  ReadOnly.setupReadonlyModeSwitch(editor, uiComponents);

  return {
    editorContainer: outerContainer.element().dom()
  };
};

export {
  render
};
