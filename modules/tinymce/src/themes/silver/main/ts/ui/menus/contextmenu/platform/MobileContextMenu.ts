import { AlloyComponent, Bubble, InlineView, Layout, LayoutInside, MaxHeight, MaxWidth } from '@ephox/alloy';
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
import { getNodeAnchor, getPointAnchor } from '../Coords';

type MenuItems = string | Array<string | SingleMenuItemSpec>;

const layouts = {
  onLtr: () => [ Layout.south, Layout.southeast, Layout.southwest, Layout.northeast, Layout.northwest, Layout.north,
    LayoutInside.north, LayoutInside.south, LayoutInside.northeast, LayoutInside.southeast, LayoutInside.northwest, LayoutInside.southwest ],
  onRtl: () => [ Layout.south, Layout.southwest, Layout.southeast, Layout.northwest, Layout.northeast, Layout.north,
    LayoutInside.north, LayoutInside.south, LayoutInside.northwest, LayoutInside.southwest, LayoutInside.northeast, LayoutInside.southeast ]
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

const getPointAnchorSpec = (editor: Editor, e: EditorEvent<TouchEvent>) => ({
  bubble: Bubble.nu(0, bubbleSize, bubbleAlignments),
  layouts,
  overrides: {
    maxWidthFunction: MaxWidth.expandable(),
    maxHeightFunction: MaxHeight.expandable()
  },
  ...getPointAnchor(editor, e)
});

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

const show = (editor: Editor, e: EditorEvent<TouchEvent>, items: MenuItems, backstage: UiFactoryBackstage, contextmenu: AlloyComponent, useNodeAnchor: boolean, highlightImmediately: boolean) => {
  const anchorSpec = useNodeAnchor ? getNodeAnchor(editor) : getPointAnchorSpec(editor, e);

  NestedMenus.build(items, ItemResponse.CLOSE_ON_EXECUTE, backstage, true).map((menuData) => {
    e.preventDefault();

    // Show the context menu, with items set to close on click
    InlineView.showMenuWithinBounds(contextmenu, anchorSpec, {
      menu: {
        markers: MenuParts.markers('normal'),
        highlightImmediately
      },
      data: menuData,
      type: 'horizontal'
    }, () => Optional.some(getContextToolbarBounds(editor, backstage.shared)));

    // Ensure the context toolbar is hidden
    editor.fire(hideContextToolbarEvent);
  });
};

export const initAndShow = (editor: Editor, e: EditorEvent<TouchEvent>, buildMenu: () => MenuItems, backstage: UiFactoryBackstage, contextmenu: AlloyComponent, useNodeAnchor: boolean): void => {
  const detection = PlatformDetection.detect();
  const isiOS = detection.os.isiOS();
  const isOSX = detection.os.isOSX();
  const isAndroid = detection.os.isAndroid();
  const isTouch = detection.deviceType.isTouch();

  const shouldHighlightImmediately = () => !(isAndroid || isiOS || (isOSX && isTouch));

  const open = () => {
    const items = buildMenu();
    show(editor, e, items, backstage, contextmenu, useNodeAnchor, shouldHighlightImmediately());
  };

  // On iOS/iPadOS if we've long pressed on a ranged selection then we've already selected the content
  // and just need to open the menu. Otherwise we need to wait for a selection change to occur as long
  // press triggers a ranged selection on iOS.
  if ((isOSX || isiOS) && !useNodeAnchor) {
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
    if (isAndroid && !useNodeAnchor) {
      editor.selection.setCursorLocation(e.target, 0);
    }

    open();
  }
};
