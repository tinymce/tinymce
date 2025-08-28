import { AlloyComponent, Bubble, InlineView, Layout, LayoutInset, MaxHeight, MaxWidth, TieredMenuTypes } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { SimSelection, WindowSelection } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import { UiFactoryBackstage } from '../../../../backstage/Backstage';
import { hideContextToolbarEvent } from '../../../context/ContextEditorEvents';
import { getContextToolbarBounds } from '../../../context/ContextToolbarBounds';
import ItemResponse from '../../item/ItemResponse';
import * as MenuParts from '../../menu/MenuParts';
import * as NestedMenus from '../../menu/NestedMenus';
import { SingleMenuItemSpec } from '../../menu/SingleMenuTypes';
import * as Coords from '../Coords';

type MenuItems = string | Array<string | SingleMenuItemSpec>;

const layouts = {
  onLtr: () => [ Layout.south, Layout.southeast, Layout.southwest, Layout.northeast, Layout.northwest, Layout.north,
    LayoutInset.north, LayoutInset.south, LayoutInset.northeast, LayoutInset.southeast, LayoutInset.northwest, LayoutInset.southwest ],
  onRtl: () => [ Layout.south, Layout.southwest, Layout.southeast, Layout.northwest, Layout.northeast, Layout.north,
    LayoutInset.north, LayoutInset.south, LayoutInset.northwest, LayoutInset.southwest, LayoutInset.northeast, LayoutInset.southeast ]
};

const bubbleSize = 12;
const bubbleAlignments = {
  valignCentre: [],
  alignCentre: [],
  alignLeft: [ 'tox-pop--align-left' ],
  alignRight: [ 'tox-pop--align-right' ],
  right: [ 'tox-pop--right' ],
  left: [ 'tox-pop--left' ],
  bottom: [ 'tox-pop--bottom' ],
  top: [ 'tox-pop--top' ]
};

const isTouchWithinSelection = (editor: Editor, e: EditorEvent<TouchEvent>) => {
  const selection = editor.selection;
  if (selection.isCollapsed() || e.touches.length < 1) {
    return false;
  } else {
    const touch = e.touches[0];
    const rng = selection.getRng();
    const rngRectOpt = WindowSelection.getFirstRect(editor.getWin(), SimSelection.domRange(rng));
    return rngRectOpt.exists((rngRect) => rngRect.left <= touch.clientX &&
      rngRect.right >= touch.clientX &&
      rngRect.top <= touch.clientY &&
      rngRect.bottom >= touch.clientY
    );
  }
};

const setupiOSOverrides = (editor: Editor) => {
  // iOS will change the selection due to longpress also being a range selection gesture. As such we
  // need to reset the selection back to the original selection after the touchend event has fired
  const originalSelection = editor.selection.getRng();
  const selectionReset = () => {
    Delay.setEditorTimeout(editor, () => {
      editor.selection.setRng(originalSelection);
    }, 10);
    unbindEventListeners();
  };
  editor.once('touchend', selectionReset);

  // iPadOS will trigger a mousedown after the longpress which will close open context menus
  // so we want to prevent that from running
  const preventMousedown = (e: EditorEvent<MouseEvent>) => {
    e.preventDefault();
    e.stopImmediatePropagation();
  };
  editor.on('mousedown', preventMousedown, true);

  // If a longpresscancel is fired, then a touchmove has occurred so we shouldn't do any overrides
  const clearSelectionReset = () => unbindEventListeners();
  editor.once('longpresscancel', clearSelectionReset);

  const unbindEventListeners = () => {
    editor.off('touchend', selectionReset);
    editor.off('longpresscancel', clearSelectionReset);
    editor.off('mousedown', preventMousedown);
  };
};

const getAnchorSpec = (editor: Editor, e: EditorEvent<TouchEvent>, anchorType: Coords.AnchorType) => {
  const anchorSpec = Coords.getAnchorSpec(editor, e, anchorType);
  const bubbleYOffset = anchorType === 'point' ? bubbleSize : 0;
  return {
    bubble: Bubble.nu(0, bubbleYOffset, bubbleAlignments),
    layouts,
    overrides: {
      maxWidthFunction: MaxWidth.expandable(),
      maxHeightFunction: MaxHeight.expandable()
    },
    ...anchorSpec
  };
};

const show = (editor: Editor, e: EditorEvent<TouchEvent>, items: MenuItems, backstage: UiFactoryBackstage, contextmenu: AlloyComponent, anchorType: Coords.AnchorType, highlightImmediately: boolean) => {
  const anchorSpec = getAnchorSpec(editor, e, anchorType);

  NestedMenus.build(
    items,
    ItemResponse.CLOSE_ON_EXECUTE,
    backstage,
    {
      // MobileContextMenus are the *only* horizontal menus currently (2022-08-16)
      isHorizontalMenu: true,
      search: Optional.none()
    }
  ).map((menuData) => {
    e.preventDefault();

    // If we are highlighting immediately, then we want to highlight the menu
    // and the item. Otherwise, we don't want to highlight anything.
    const highlightOnOpen = highlightImmediately
      ? TieredMenuTypes.HighlightOnOpen.HighlightMenuAndItem
      : TieredMenuTypes.HighlightOnOpen.HighlightNone;

    // Show the context menu, with items set to close on click
    InlineView.showMenuWithinBounds(contextmenu, { anchor: anchorSpec }, {
      menu: {
        markers: MenuParts.markers('normal'),
        highlightOnOpen
      },
      data: menuData,
      type: 'horizontal'
    }, () => Optional.some(getContextToolbarBounds(editor, backstage.shared, anchorType === 'node' ? 'node' : 'selection')));

    // Ensure the context toolbar is hidden
    editor.dispatch(hideContextToolbarEvent);
  });
};

export const initAndShow = (editor: Editor, e: EditorEvent<TouchEvent>, buildMenu: () => MenuItems, backstage: UiFactoryBackstage, contextmenu: AlloyComponent, anchorType: Coords.AnchorType): void => {
  const detection = PlatformDetection.detect();
  const isiOS = detection.os.isiOS();
  const isMacOS = detection.os.isMacOS();
  const isAndroid = detection.os.isAndroid();
  const isTouch = detection.deviceType.isTouch();

  const shouldHighlightImmediately = () => !(isAndroid || isiOS || (isMacOS && isTouch));

  const open = () => {
    const items = buildMenu();
    show(editor, e, items, backstage, contextmenu, anchorType, shouldHighlightImmediately());
  };

  // On iOS/iPadOS if we've long pressed on a ranged selection then we've already selected the content
  // and just need to open the menu. Otherwise we need to wait for a selection change to occur as long
  // press triggers a ranged selection on iOS.
  if ((isMacOS || isiOS) && anchorType !== 'node') {
    const openiOS = () => {
      setupiOSOverrides(editor);
      open();
    };

    if (isTouchWithinSelection(editor, e)) {
      openiOS();
    } else {
      editor.once('selectionchange', openiOS);
      editor.once('touchend', () => editor.off('selectionchange', openiOS));
    }
  } else {
    open();
  }
};
