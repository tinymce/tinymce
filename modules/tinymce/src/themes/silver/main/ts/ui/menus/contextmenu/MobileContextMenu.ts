import { AlloyComponent, Boxes, Bubble, InlineView, Layout, LayoutInside, MaxHeight, MaxWidth } from '@ephox/alloy';
import { PointerEvent, window } from '@ephox/dom-globals';
import { Cell, Option } from '@ephox/katamari';
import { Element, VisualViewport } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import * as Settings from 'tinymce/themes/silver/api/Settings';
import { UiFactoryBackstage } from '../../../backstage/Backstage';
import { hideContextToolbarEvent } from '../../context/ContextEditorEvents';
import * as ContextToolbarBounds from '../../context/ContextToolbarBounds';
import ItemResponse from '../item/ItemResponse';
import * as MenuParts from '../menu/MenuParts';
import * as NestedMenus from '../menu/NestedMenus';

const contextmenuRecord = Cell<Record<string, AlloyComponent>>({});

const toolbarOrMenubarEnabled = (editor) => Settings.isMenubarEnabled(editor) || Settings.isToolbarEnabled(editor) || Settings.isMultipleToolbars(editor);

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

const show = (editor: Editor, e: EditorEvent<PointerEvent>, items, backstage: UiFactoryBackstage, contextmenu: AlloyComponent, anchorSpec) => {
  const menuRecord = contextmenuRecord.get();
  contextmenuRecord.set({ ...menuRecord, [editor.id]: contextmenu });

  NestedMenus.build(items, ItemResponse.CLOSE_ON_EXECUTE, backstage, true).map((menuData) => {
    e.preventDefault();

    const nuAnchorSpec = {
      bubble: Bubble.nu(0, bubbleSize, bubbleAlignments),
      layouts,
      overrides: {
        maxWidthFunction: MaxWidth.expandable(),
        maxHeightFunction: MaxHeight.expandable()
      },
      ...anchorSpec
    };

    // Show the context menu, with items set to close on click
    InlineView.showHorizontalMenuAt(contextmenu, nuAnchorSpec, {
      menu: {
        markers: MenuParts.markers('normal')
      },
      data: menuData
    }, getBounds(editor));

    // iOS is weird and doesn't close contexttoolbars when contextmenus open, unlike Android. So force hide.
    editor.fire(hideContextToolbarEvent);
  });
};

export default {
  show
};