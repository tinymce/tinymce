import { AlloyComponent, Bubble, InlineView, Layout, LayoutInside, MaxHeight, MaxWidth } from '@ephox/alloy';
import { MouseEvent, TouchEvent } from '@ephox/dom-globals';
import { PlatformDetection } from '@ephox/sand';
import { Selection, WindowSelection } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { UiFactoryBackstage } from '../../../../backstage/Backstage';
import ItemResponse from '../../item/ItemResponse';
import * as MenuParts from '../../menu/MenuParts';
import * as NestedMenus from '../../menu/NestedMenus';
import { getNodeAnchor, getSelectionAnchor } from '../Coords';
import { SingleMenuItemApi } from '../../menu/SingleMenuTypes';
import { hideContextToolbarEvent } from '../../../context/ContextEditorEvents';
import { getContextToolbarBounds } from '../../../context/ContextToolbarBounds';
import { Option } from '@ephox/katamari';

type MenuItems = string | Array<string | SingleMenuItemApi>;

const layouts = {
  onLtr: () => [Layout.south, Layout.southeast, Layout.southwest, Layout.northeast, Layout.northwest, Layout.north,
    LayoutInside.north, LayoutInside.south, LayoutInside.northeast, LayoutInside.southeast, LayoutInside.northwest, LayoutInside.southwest],
  onRtl: () => [Layout.south, Layout.southwest, Layout.southeast, Layout.northwest, Layout.northeast, Layout.north,
    LayoutInside.north, LayoutInside.south, LayoutInside.northwest, LayoutInside.southwest, LayoutInside.northeast, LayoutInside.southeast]
};

const bubbleSize = 12;
const bubbleAlignments = {
  valignCentre: [],
  alignCentre: [],
  alignLeft: ['tox-pop--align-left'],
  alignRight: ['tox-pop--align-right'],
  right: ['tox-pop--right'],
  left: ['tox-pop--left'],
  bottom: ['tox-pop--bottom'],
  top: ['tox-pop--top']
};

const isTouchWithinSelection = (editor: Editor, e: EditorEvent<TouchEvent>) => {
  const selection = editor.selection;
  if (selection.isCollapsed() || e.touches.length < 1) {
    return false;
  } else {
    const touch = e.touches[0];
    const rng = selection.getRng();
    const rngRectOpt = WindowSelection.getFirstRect(editor.getWin(), Selection.domRange(rng));
    return rngRectOpt.exists((rngRect) => rngRect.left() <= touch.clientX &&
      rngRect.right() >= touch.clientX &&
      rngRect.top() <= touch.clientY &&
      rngRect.bottom() >= touch.clientY
    );
  }
};

const getAnchorSpec = (editor: Editor, isTriggeredByKeyboardEvent: boolean) => {
  const anchorSpec = isTriggeredByKeyboardEvent ? getNodeAnchor(editor) : getSelectionAnchor(editor);
  return {
    bubble: Bubble.nu(0, bubbleSize, bubbleAlignments),
    layouts,
    overrides: {
      maxWidthFunction: MaxWidth.expandable(),
      maxHeightFunction: MaxHeight.expandable()
    },
    ...anchorSpec
  };
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

const show = (editor: Editor, e: EditorEvent<TouchEvent>, items: MenuItems, backstage: UiFactoryBackstage, contextmenu: AlloyComponent, isTriggeredByKeyboardEvent: boolean) => {
  const anchorSpec = getAnchorSpec(editor, isTriggeredByKeyboardEvent);

  NestedMenus.build(items, ItemResponse.CLOSE_ON_EXECUTE, backstage, true).map((menuData) => {
    e.preventDefault();

    // Show the context menu, with items set to close on click
    InlineView.showMenuWithinBounds(contextmenu, anchorSpec, {
      menu: {
        markers: MenuParts.markers('normal')
      },
      data: menuData,
      type: 'horizontal'
    }, () => Option.some(getContextToolbarBounds(editor)));

    // Ensure the context toolbar is hidden
    editor.fire(hideContextToolbarEvent);
  });
};

export const initAndShow = (editor: Editor, e: EditorEvent<TouchEvent>, buildMenu: () => MenuItems, backstage: UiFactoryBackstage, contextmenu: AlloyComponent, isTriggeredByKeyboardEvent: boolean): void => {
  const detection = PlatformDetection.detect();
  const isiOS = detection.os.isiOS();
  const isOSX = detection.os.isOSX();
  const isAndroid = detection.os.isAndroid();

  const open = () => {
    const items = buildMenu();
    show(editor, e, items, backstage, contextmenu, isTriggeredByKeyboardEvent);
  };

  // On iOS/iPadOS if we've long pressed on a ranged selection then we've already selected the content
  // and just need to open the menu. Otherwise we need to wait for a selection change to occur as long
  // press triggers a ranged selection on iOS.
  if ((isOSX || isiOS) && !isTriggeredByKeyboardEvent) {
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
    // On Android editor.selection hasn't updated yet at this point, so need to do it manually
    // Without this longpress causes drag-n-drop duplication of code on Android
    if (isAndroid && !isTriggeredByKeyboardEvent) {
      editor.selection.setCursorLocation(e.target, 0);
    }

    open();
  }
};
