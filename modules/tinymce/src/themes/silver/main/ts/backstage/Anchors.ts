import { AlloyComponent, Bubble, HotspotAnchorSpec, Layout, LayoutInside, MaxHeight, NodeAnchorSpec, SelectionAnchorSpec } from '@ephox/alloy';
import { Option } from '@ephox/katamari';
import { Element, Selection } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { useFixedContainer, isToolbarLocationTop } from '../api/Settings';

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

const getInlineDialogAnchor = (bodyElement: () => Element, lazyAnchorbar: () => AlloyComponent, useEditableAreaAnchor: boolean): () => HotspotAnchorSpec | NodeAnchorSpec => {
  const editableAreaAnchor = (): NodeAnchorSpec => ({
    anchor: 'node',
    root: bodyElement(),
    node: Option.from(bodyElement()),
    bubble: Bubble.nu(-12, -12, bubbleAlignments),
    layouts: {
      onRtl: () => [ LayoutInside.northeast ],
      onLtr: () => [ LayoutInside.northwest ]
    },
    overrides: {
      maxHeightFunction: MaxHeight.expandable()
    }
  });

  const standardAnchor = (): HotspotAnchorSpec => ({
    anchor: 'hotspot',
    hotspot: lazyAnchorbar(),
    bubble: Bubble.nu(-12, 12, bubbleAlignments),
    layouts: {
      onRtl: () => [ Layout.southeast ],
      onLtr: () => [ Layout.southwest ]
    },
    overrides: {
      maxHeightFunction: MaxHeight.expandable()
    }
  });

  return useEditableAreaAnchor ? editableAreaAnchor : standardAnchor;
};

const getBannerAnchor = (bodyElement: () => Element, lazyAnchorbar: () => AlloyComponent, useEditableAreaAnchor: boolean): () => HotspotAnchorSpec | NodeAnchorSpec => {
  const editableAreaAnchor = (): NodeAnchorSpec => ({
    anchor: 'node',
    root: bodyElement(),
    node: Option.from(bodyElement()),
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

  // If using fixed_toolbar_container or if the toolbar is positioned at the bottom
  // of the editor, some things should anchor to the top of the editable area.
  const useEditableAreaAnchor = useFixedToolbarContainer || !isToolbarLocationTop(editor);

  return {
    inlineDialog: getInlineDialogAnchor(bodyElement, lazyAnchorbar, useEditableAreaAnchor),
    banner: getBannerAnchor(bodyElement, lazyAnchorbar, useEditableAreaAnchor),
    cursor: getCursorAnchor(editor, bodyElement),
    node: getNodeAnchor(bodyElement)
  };
};

export {
  getAnchors
};
