/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, Bubble, HotspotAnchorSpec, Layout, LayoutInset, MaxHeight, NodeAnchorSpec, SelectionAnchorSpec } from '@ephox/alloy';
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
  const bubbleSize = 12;
  const overrides = {
    maxHeightFunction: MaxHeight.expandable()
  };

  const editableAreaAnchor = (): NodeAnchorSpec => ({
    type: 'node',
    root: SugarShadowDom.getContentContainer(contentAreaElement()),
    node: Optional.from(contentAreaElement()),
    bubble: Bubble.nu(bubbleSize, bubbleSize, bubbleAlignments),
    layouts: {
      onRtl: () => [ LayoutInset.northeast ],
      onLtr: () => [ LayoutInset.northwest ]
    },
    overrides
  });

  const standardAnchor = (): HotspotAnchorSpec => ({
    type: 'hotspot',
    hotspot: lazyAnchorbar(),
    bubble: Bubble.nu(-bubbleSize, bubbleSize, bubbleAlignments),
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
    type: 'node',
    root: SugarShadowDom.getContentContainer(contentAreaElement()),
    node: Optional.from(contentAreaElement()),
    layouts: {
      onRtl: () => [ LayoutInset.north ],
      onLtr: () => [ LayoutInset.north ]
    }
  });

  const standardAnchor = (): HotspotAnchorSpec => ({
    type: 'hotspot',
    hotspot: lazyAnchorbar(),
    layouts: {
      onRtl: () => [ Layout.south ],
      onLtr: () => [ Layout.south ]
    }
  });

  return () => lazyUseEditableAreaAnchor() ? editableAreaAnchor() : standardAnchor();
};

const getCursorAnchor = (editor: Editor, bodyElement: () => SugarElement) => (): SelectionAnchorSpec => ({
  type: 'selection',
  root: bodyElement(),
  getSelection: () => {
    const rng = editor.selection.getRng();
    return Optional.some(
      SimSelection.range(SugarElement.fromDom(rng.startContainer), rng.startOffset, SugarElement.fromDom(rng.endContainer), rng.endOffset)
    );
  }
});

const getNodeAnchor = (bodyElement) => (element: Optional<SugarElement>): NodeAnchorSpec => ({
  type: 'node',
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
