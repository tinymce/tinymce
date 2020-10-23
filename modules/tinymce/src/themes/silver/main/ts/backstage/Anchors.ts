import { AlloyComponent, Bubble, HotspotAnchorSpec, Layout, LayoutInside, MaxHeight, NodeAnchorSpec, SelectionAnchorSpec } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';
import { SimSelection, SugarElement, SugarShadowDom } from '@ephox/sugar';
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

const getInlineDialogAnchor = (contentAreaElement: () => SugarElement, lazyAnchorbar: () => AlloyComponent, lazyUseEditableAreaAnchor: () => boolean): () => HotspotAnchorSpec | NodeAnchorSpec => {
  const bubble = Bubble.nu(-12, 12, bubbleAlignments);
  const overrides = {
    maxHeightFunction: MaxHeight.expandable()
  };

  const editableAreaAnchor = (): NodeAnchorSpec => ({
    anchor: 'node',
    root: SugarShadowDom.getContentContainer(contentAreaElement()),
    node: Optional.from(contentAreaElement()),
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

  return () => lazyUseEditableAreaAnchor() ? editableAreaAnchor() : standardAnchor();
};

const getBannerAnchor = (contentAreaElement: () => SugarElement, lazyAnchorbar: () => AlloyComponent, lazyUseEditableAreaAnchor: () => boolean): () => HotspotAnchorSpec | NodeAnchorSpec => {
  const editableAreaAnchor = (): NodeAnchorSpec => ({
    anchor: 'node',
    root: SugarShadowDom.getContentContainer(contentAreaElement()),
    node: Optional.from(contentAreaElement()),
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

  return () => lazyUseEditableAreaAnchor() ? editableAreaAnchor() : standardAnchor();
};

const getCursorAnchor = (editor: Editor, bodyElement: () => SugarElement) => (): SelectionAnchorSpec => ({
  anchor: 'selection',
  root: bodyElement(),
  getSelection: () => {
    const rng = editor.selection.getRng();
    return Optional.some(
      SimSelection.range(SugarElement.fromDom(rng.startContainer), rng.startOffset, SugarElement.fromDom(rng.endContainer), rng.endOffset)
    );
  }
});

const getNodeAnchor = (bodyElement) => (element: Optional<SugarElement>): NodeAnchorSpec => ({
  anchor: 'node',
  root: bodyElement(),
  node: element
});

const getAnchors = (editor: Editor, lazyAnchorbar: () => AlloyComponent, isToolbarTop: () => boolean) => {
  const useFixedToolbarContainer: boolean = useFixedContainer(editor);
  const bodyElement = (): SugarElement => SugarElement.fromDom(editor.getBody());
  const contentAreaElement = (): SugarElement => SugarElement.fromDom(editor.getContentAreaContainer());

  // If using fixed_toolbar_container or if the toolbar is positioned at the bottom
  // of the editor, some things should anchor to the top of the editable area.
  const lazyUseEditableAreaAnchor = () => useFixedToolbarContainer || !isToolbarTop();

  return {
    inlineDialog: getInlineDialogAnchor(contentAreaElement, lazyAnchorbar, lazyUseEditableAreaAnchor),
    banner: getBannerAnchor(contentAreaElement, lazyAnchorbar, lazyUseEditableAreaAnchor),
    cursor: getCursorAnchor(editor, bodyElement),
    node: getNodeAnchor(bodyElement)
  };
};

export {
  getAnchors
};
