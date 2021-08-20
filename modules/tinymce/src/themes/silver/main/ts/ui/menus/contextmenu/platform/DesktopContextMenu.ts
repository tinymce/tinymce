/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, InlineView } from '@ephox/alloy';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import { UiFactoryBackstage } from '../../../../backstage/Backstage';
import ItemResponse from '../../item/ItemResponse';
import * as MenuParts from '../../menu/MenuParts';
import * as NestedMenus from '../../menu/NestedMenus';
import { SingleMenuItemSpec } from '../../menu/SingleMenuTypes';
import { AnchorType, getAnchorSpec } from '../Coords';

export const initAndShow = (editor: Editor, e: EditorEvent<PointerEvent>, buildMenu: () => string | Array<string | SingleMenuItemSpec>, backstage: UiFactoryBackstage, contextmenu: AlloyComponent, anchorType: AnchorType) => {
  const items = buildMenu();
  const anchorSpec = getAnchorSpec(editor, e, anchorType);

  NestedMenus.build(items, ItemResponse.CLOSE_ON_EXECUTE, backstage, false).map((menuData) => {
    e.preventDefault();

    // show the context menu, with items set to close on click
    InlineView.showMenuAt(contextmenu, { anchor: anchorSpec }, {
      menu: {
        markers: MenuParts.markers('normal')
      },
      data: menuData
    });
  });
};
