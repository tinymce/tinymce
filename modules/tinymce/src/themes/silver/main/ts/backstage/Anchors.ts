import { AlloyComponent, Bubble, HotspotAnchorSpec, Layout, LayoutInside, MaxHeight, NodeAnchorSpec, SelectionAnchorSpec } from '@ephox/alloy';
import { Option } from '@ephox/katamari';
import { Body, Element, Selection, Traverse } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { isToolbarLocationTop, useFixedContainer } from '../api/Settings';

const bubbleAlignments = {
  valignCentre: [],
  alignCentre: [],
  alignLeft: [],
  alignRight: [],
  right: [],
  left: [],
  bottom: [],
  top: []
};

const getInlineDialogAnchor = (contentAreaElement: () => Element, lazyAnchorbar: () => AlloyComponent, useEditableAreaAnchor: boolean): () => HotspotAnchorSpec | NodeAnchorSpec => {
  const bubble = Bubble.nu(-12, 12, bubbleAlignments);
  const overrides = {
    maxHeightFunction: MaxHeight.expandable()
  };

  const editableAreaAnchor = (): NodeAnchorSpec => ({
    anchor: 'node',
    root: Body.getBody(Traverse.owner(contentAreaElement())),
    node: Option.from(contentAreaElement()),
    bubble,
    layouts: {
      onRtl: () => [ LayoutInside.northwest ],
      onLtr: () => [ LayoutInside.northeast ]
    },
    overrides
  });

  const standardAnchor = (): HotspotAnchorSpec => ({
    anchor: 'hotspot',
    hotspot: lazyAnchorbar(),
    bubble,
    layouts: {
      onRtl: () => [ Layout.southeast ],
      onLtr: () => [ Layout.southwest ]
    },
    overrides
  });

  return useEditableAreaAnchor ? editableAreaAnchor : standardAnchor;
};

const getBannerAnchor = (contentAreaElement: () => Element, lazyAnchorbar: () => AlloyComponent, useEditableAreaAnchor: boolean): () => HotspotAnchorSpec | NodeAnchorSpec => {
  const editableAreaAnchor = (): NodeAnchorSpec => ({
    anchor: 'node',
    root: Body.getBody(Traverse.owner(contentAreaElement())),
    node: Option.from(contentAreaElement()),
    layouts: {
      onRtl: () => [ LayoutInside.north ],
      onLtr: () => [ LayoutInside.north ]
    }
  });

  const standardAnchor = (): HotspotAnchorSpec => ({
    anchor: 'hotspot',
    hotspot: lazyAnchorbar(),
    layouts: {
      onRtl: () => [ Layout.south ],
      onLtr: () => [ Layout.south ]
    }
  });

  return useEditableAreaAnchor ? editableAreaAnchor : standardAnchor;
};

const getCursorAnchor = (editor: Editor, bodyElement: () => Element) => (): SelectionAnchorSpec => {
  return {
    anchor: 'selection',
    root: bodyElement(),
    getSelection: () => {
      const rng = editor.selection.getRng();
      return Option.some(
        Selection.range(Element.fromDom(rng.startContainer), rng.startOffset, Element.fromDom(rng.endContainer), rng.endOffset)
      );
    }
  };
};

const getNodeAnchor = (bodyElement) => (element: Option<Element>): NodeAnchorSpec => {
  return {
    anchor: 'node',
    root: bodyElement(),
    node: element
  };
};

const getAnchors = (editor: Editor, lazyAnchorbar: () => AlloyComponent) => {
  const useFixedToolbarContainer: boolean = useFixedContainer(editor);
  const bodyElement = (): Element => Element.fromDom(editor.getBody());
  const contentAreaElement = (): Element => Element.fromDom(editor.getContentAreaContainer());

  // If using fixed_toolbar_container or if the toolbar is positioned at the bottom
  // of the editor, some things should anchor to the top of the editable area.
  const useEditableAreaAnchor = useFixedToolbarContainer || !isToolbarLocationTop(editor);

  return {
    inlineDialog: getInlineDialogAnchor(contentAreaElement, lazyAnchorbar, useEditableAreaAnchor),
    banner: getBannerAnchor(contentAreaElement, lazyAnchorbar, useEditableAreaAnchor),
    cursor: getCursorAnchor(editor, bodyElement),
    node: getNodeAnchor(bodyElement)
  };
};

export default {
  getAnchors
};
