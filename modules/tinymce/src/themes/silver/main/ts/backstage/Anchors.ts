import { AlloyComponent, AnchorSpec, Bubble, Layout, LayoutInside } from '@ephox/alloy';
import { Option } from '@ephox/katamari';
import { Element, Selection } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { useFixedContainer } from '../api/Settings';

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

const getToolbarAnchor = (bodyElement: () => Element, lazyAnchorbar: () => AlloyComponent, useFixedToolbarContainer: boolean): () => AnchorSpec => {
  // If using fixed_toolbar_container, anchor to the inside top of the editable area
  // Else, anchor below the div.tox-anchorbar in the editor chrome
  const fixedToolbarAnchor = (): AnchorSpec => ({
    anchor: 'node',
    root: bodyElement(),
    node: Option.from(bodyElement()),
    bubble: Bubble.nu(-12, -12, bubbleAlignments),
    layouts: {
      onRtl: () => [ LayoutInside.northeast ],
      onLtr: () => [ LayoutInside.northwest ]
    }
  });

  const standardAnchor = (): AnchorSpec => ({
    anchor: 'hotspot',
    hotspot: lazyAnchorbar(),
    bubble: Bubble.nu(-12, 12, bubbleAlignments),
    layouts: {
      onRtl: () => [ Layout.southeast ],
      onLtr: () => [ Layout.southwest ]
    }
  });

  return useFixedToolbarContainer ? fixedToolbarAnchor : standardAnchor;
};

const getBannerAnchor = (bodyElement: () => Element, lazyAnchorbar: () => AlloyComponent, useFixedToolbarContainer: boolean): () => AnchorSpec => {
  // If using fixed_toolbar_container, anchor to the inside top of the editable area
  // Else, anchor below the div.tox-anchorbar in the editor chrome
  const fixedToolbarAnchor = (): AnchorSpec => ({
    anchor: 'node',
    root: bodyElement(),
    node: Option.from(bodyElement()),
    layouts: {
      onRtl: () => [ LayoutInside.north ],
      onLtr: () => [ LayoutInside.north ]
    }
  });

  const standardAnchor = (): AnchorSpec => ({
    anchor: 'hotspot',
    hotspot: lazyAnchorbar(),
    layouts: {
      onRtl: () => [ Layout.south ],
      onLtr: () => [ Layout.south ]
    }
  });

  return useFixedToolbarContainer ? fixedToolbarAnchor : standardAnchor;
};

const getToolbarOverflowAnchor = (lazyMoreButton: () => AlloyComponent) => (): AnchorSpec => {
  return {
    anchor: 'hotspot',
    hotspot: lazyMoreButton(),
    layouts: {
      onRtl: () => [ Layout.southeast ],
      onLtr: () => [ Layout.southwest ]
    }
  };
};

const getCursorAnchor = (editor: Editor, bodyElement: () => Element) => (): AnchorSpec => {
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

const getNodeAnchor = (bodyElement) => (element: Option<Element>): AnchorSpec => {
  return {
    anchor: 'node',
    root: bodyElement(),
    node: element
  };
};

const getAnchors = (editor: Editor, lazyAnchorbar: () => AlloyComponent, lazyMoreButton: () => AlloyComponent) => {
  const useFixedToolbarContainer: boolean = useFixedContainer(editor);
  const bodyElement = (): Element => Element.fromDom(editor.getBody());

  return {
    toolbar: getToolbarAnchor(bodyElement, lazyAnchorbar, useFixedToolbarContainer),
    toolbarOverflow: getToolbarOverflowAnchor(lazyMoreButton),
    banner: getBannerAnchor(bodyElement, lazyAnchorbar, useFixedToolbarContainer),
    cursor: getCursorAnchor(editor, bodyElement),
    node: getNodeAnchor(bodyElement)
  };
};

export default {
  getAnchors
};
