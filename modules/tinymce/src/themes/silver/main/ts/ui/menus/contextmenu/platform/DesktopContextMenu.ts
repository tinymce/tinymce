import { AlloyComponent, InlineView } from '@ephox/alloy';
import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { UiFactoryBackstage } from '../../../../backstage/Backstage';
import ItemResponse from '../../item/ItemResponse';
import * as MenuParts from '../../menu/MenuParts';
import * as NestedMenus from '../../menu/NestedMenus';
import { SingleMenuItemApi } from '../../menu/SingleMenuTypes';
import { getNodeAnchor, getPointAnchor } from '../Coords';

const getAnchorSpec = (editor: Editor, e: EditorEvent<PointerEvent>, isTriggeredByKeyboardEvent: boolean) => isTriggeredByKeyboardEvent ? getNodeAnchor(editor) : getPointAnchor(editor, e);

export const initAndShow = (editor: Editor, e: EditorEvent<PointerEvent>, buildMenu: () => string | Array<string | SingleMenuItemApi>, backstage: UiFactoryBackstage, contextmenu: AlloyComponent, isTriggeredByKeyboardEvent: boolean) => {
  const items = buildMenu();
  const anchorSpec = getAnchorSpec(editor, e, isTriggeredByKeyboardEvent);

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
