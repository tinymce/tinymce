/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, Attachment, Disabling } from '@ephox/alloy';
import { Body, Element, Selectors } from '@ephox/sugar';
import { Editor } from 'tinymce/core/api/Editor';
import * as Settings from '../api/Settings';
import OuterContainer from '../ui/general/OuterContainer';
import { identifyMenus } from '../ui/menus/menubar/Integration';
import { identifyButtons } from '../ui/toolbar/Integration';
import { iframe as loadIframeSkin } from './../ui/skin/Loader';
import { RenderUiComponents, RenderUiConfig, RenderArgs, ModeRenderInfo } from '../Render';
import { UiFactoryBackstage } from '../backstage/Backstage';

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

const render = (editor: Editor, uiComponents: RenderUiComponents, rawUiConfig: RenderUiConfig, backstage: UiFactoryBackstage, args: RenderArgs): ModeRenderInfo => {
  loadIframeSkin(editor);

  Attachment.attachSystemAfter(Element.fromDom(args.targetNode), uiComponents.mothership);
  Attachment.attachSystem(Body.body(), uiComponents.uiMothership);

  editor.on('init', () => {
    OuterContainer.setToolbar(
      uiComponents.outerContainer,
      identifyButtons(editor, rawUiConfig, {backstage})
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

  return {
    iframeContainer: socket.element().dom(),
    editorContainer: uiComponents.outerContainer.element().dom(),
  };
};

export default {
  render,
  getBehaviours: (_) => []
};