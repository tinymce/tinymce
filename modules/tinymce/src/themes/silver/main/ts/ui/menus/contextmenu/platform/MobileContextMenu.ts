import { AlloyComponent, AnchorSpec, Boxes, Bubble, InlineView, Layout, LayoutInside, MaxHeight, MaxWidth } from '@ephox/alloy';
import { PointerEvent, window } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { LazyPlatformDetection } from '@ephox/sand';
import { Element, VisualViewport } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import * as Settings from '../../../../api/Settings';
import { UiFactoryBackstage } from '../../../../backstage/Backstage';
import { hideContextToolbarEvent } from '../../../context/ContextEditorEvents';
import * as ContextToolbarBounds from '../../../context/ContextToolbarBounds';
import ItemResponse from '../../item/ItemResponse';
import * as MenuParts from '../../menu/MenuParts';
import * as NestedMenus from '../../menu/NestedMenus';
import { getNodeAnchor, getSelectionAnchor } from '../Coords';

const toolbarOrMenubarEnabled = (editor: Editor) => Settings.isMenubarEnabled(editor) || Settings.isToolbarEnabled(editor) || Settings.isMultipleToolbars(editor);

const getBounds = (editor: Editor) => () => {
  const viewportBounds = VisualViewport.getBounds(window);
  const contentAreaBox = Boxes.box(Element.fromDom(editor.getContentAreaContainer()));

  // Create a bounds that lets the context toolbar overflow outside the content area, but remains in the viewport
  if (editor.inline && !toolbarOrMenubarEnabled) {
    return Option.some(ContextToolbarBounds.getDistractionFreeBounds(editor, contentAreaBox, viewportBounds));
  } else if (editor.inline) {
    return Option.some(ContextToolbarBounds.getInlineBounds(editor, contentAreaBox, viewportBounds));
  } else {
    return Option.some(ContextToolbarBounds.getIframeBounds(editor, contentAreaBox, viewportBounds));
  }
};

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

export const getAnchorSpec = (editor: Editor, isTriggeredByKeyboardEvent: boolean) => {
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

const showMenu = (editor: Editor, e: EditorEvent<PointerEvent>, items, backstage: UiFactoryBackstage, contextmenu: AlloyComponent, anchorSpec: AnchorSpec) => {
  NestedMenus.build(items, ItemResponse.CLOSE_ON_EXECUTE, backstage, true).map((menuData) => {
    e.preventDefault();

    // Show the context menu, with items set to close on click
    InlineView.showMenuWithinBounds(contextmenu, anchorSpec, {
      menu: {
        markers: MenuParts.markers('normal')
      },
      data: menuData,
      type: 'horizontal'
    }, getBounds(editor));

    // iOS is weird and doesn't close contexttoolbars when contextmenus open, unlike Android. So force hide.
    editor.fire(hideContextToolbarEvent);
  });
};

export const show = (editor: Editor, e: EditorEvent<PointerEvent>, items, backstage: UiFactoryBackstage, contextmenu: AlloyComponent, isTriggeredByKeyboardEvent: boolean) => {
  const detection = LazyPlatformDetection.detect();
  const isiOS = detection.os.isiOS();
  const isOSX = detection.os.isOSX();

  const anchorSpec = getAnchorSpec(editor, isTriggeredByKeyboardEvent);

  if (isiOS || isOSX) {
    // Need a short wait here for iOS due to browser focus events or something causing the keyboard to open after
    // the context menu opens, closing it again. 200 is arbitrary but mostly works
    Delay.setEditorTimeout(editor, () => showMenu(editor, e, items, backstage, contextmenu, anchorSpec), 200);
  } else {
    // Waiting on Android causes the native context toolbar to not show, so don't wait
    showMenu(editor, e, items, backstage, contextmenu, anchorSpec);
  }
};
