/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { RenderUiConfig, RenderUiComponents } from '../Render';
import { Option, Type } from '@ephox/katamari';
import { identifyButtons } from '../ui/toolbar/Integration';
import OuterContainer from '../ui/general/OuterContainer';
import Editor from 'tinymce/core/api/Editor';
import { UiFactoryBackstage } from '../backstage/Backstage';

// Set toolbar(s) depending on if multiple toolbars is configured or not
const setToolbar = (editor: Editor, uiComponents: RenderUiComponents, rawUiConfig: RenderUiConfig, backstage: UiFactoryBackstage) => {
  const comp = uiComponents.outerContainer;
  const toolbarConfig = rawUiConfig.toolbar;
  const toolbarButtonsConfig = rawUiConfig.buttons;

  // Check if toolbar type is a non-empty string array
  if (Type.isArrayOf(toolbarConfig, Type.isString)) {
    const toolbars = toolbarConfig.map((t) => {
      const config = { toolbar: t, buttons: toolbarButtonsConfig };
      return identifyButtons(editor, config, {backstage}, Option.none());
    });
    OuterContainer.setToolbars(comp, toolbars);
  } else {
    OuterContainer.setToolbar(
      comp,
      identifyButtons(editor, rawUiConfig, {backstage}, Option.none())
    );
  }
};

export { setToolbar };