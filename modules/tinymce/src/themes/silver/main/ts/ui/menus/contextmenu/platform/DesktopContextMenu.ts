import { AlloyComponent, InlineView } from '@ephox/alloy';
import { PointerEvent } from '@ephox/dom-globals';
import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { UiFactoryBackstage } from '../../../../backstage/Backstage';
import * as NestedMenus from '../../menu/NestedMenus';
import ItemResponse from '../../item/ItemResponse';
import * as MenuParts from '../../menu/MenuParts';
import { getNodeAnchor, getPointAnchor } from '../Coords';

export const getAnchorSpec = (editor: Editor, e: EditorEvent<PointerEvent>, isTriggeredByKeyboardEvent: boolean) => {
  return isTriggeredByKeyboardEvent ? getNodeAnchor(editor) : getPointAnchor(editor, e);
};

export const show = (editor: Editor, e: EditorEvent<PointerEvent>, items, backstage: UiFactoryBackstage, contextmenu: AlloyComponent, isTriggeredByKeyboardEvent: boolean) => {
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
