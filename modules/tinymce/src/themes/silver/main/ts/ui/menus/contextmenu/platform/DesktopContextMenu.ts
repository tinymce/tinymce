import { AlloyComponent, InlineView } from '@ephox/alloy';
import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { UiFactoryBackstage } from '../../../../backstage/Backstage';
import ItemResponse from '../../item/ItemResponse';
import * as MenuParts from '../../menu/MenuParts';
import * as NestedMenus from '../../menu/NestedMenus';
import { SingleMenuItemSpec } from '../../menu/SingleMenuTypes';
import { getNodeAnchor, getPointAnchor } from '../Coords';

export const initAndShow = (editor: Editor, e: EditorEvent<PointerEvent>, buildMenu: () => string | Array<string | SingleMenuItemSpec>, backstage: UiFactoryBackstage, contextmenu: AlloyComponent, useNodeAnchor: boolean) => {
  const items = buildMenu();
  const anchorSpec = useNodeAnchor ? getNodeAnchor(editor) : getPointAnchor(editor, e);

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
