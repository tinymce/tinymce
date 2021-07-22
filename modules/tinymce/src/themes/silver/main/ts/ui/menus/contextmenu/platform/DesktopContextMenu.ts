/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AnchorSpec, InlineView } from '@ephox/alloy';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import { UiFactoryBackstage } from '../../../../backstage/Backstage';
import ItemResponse from '../../item/ItemResponse';
import * as MenuParts from '../../menu/MenuParts';
import * as NestedMenus from '../../menu/NestedMenus';
import { SingleMenuItemSpec } from '../../menu/SingleMenuTypes';

export const initAndShow = (editor: Editor, e: EditorEvent<PointerEvent>, buildMenu: () => string | Array<string | SingleMenuItemSpec>, backstage: UiFactoryBackstage, contextmenu: AlloyComponent, anchorSpec: AnchorSpec) => {
  const items = buildMenu();

  NestedMenus.build(items, ItemResponse.CLOSE_ON_EXECUTE, backstage, false).map((menuData) => {
    e.preventDefault();

    // show the context menu, with items set to close on click
    InlineView.showMenuAt(contextmenu, anchorSpec, {
      menu: {
        markers: MenuParts.markers('normal')
      },
      data: menuData
    });
  });
};
