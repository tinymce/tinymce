/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AnchorSpec, Bounds, Bubble, Layout, LayoutInset, MaxHeight, MaxWidth } from '@ephox/alloy';
import { InlineContent } from '@ephox/bridge';
import { Optional } from '@ephox/katamari';
import { Compare, Height, SugarElement, Traverse } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import { getSelectionBounds, isVerticalOverlap } from './ContextToolbarBounds';

type Layout = typeof LayoutInset.north;

export interface PositionData {
  readonly lastPos: () => Optional<Bounds>;
  readonly lastElement: () => Optional<SugarElement<Element>>;
  readonly bounds: () => Optional<Bounds>;
  readonly isReposition: () => boolean;
}

const bubbleSize = 12;
const bubbleAlignments = {
  valignCentre: [],
  alignCentre: [],
  alignLeft: [ 'tox-pop--align-left' ],
  alignRight: [ 'tox-pop--align-right' ],
  right: [ 'tox-pop--right' ],
  left: [ 'tox-pop--left' ],
  bottom: [ 'tox-pop--bottom' ],
  top: [ 'tox-pop--top' ],
  inset: [ 'tox-pop--inset' ]
};

const anchorOverrides = {
  maxHeightFunction: MaxHeight.expandable(),
  maxWidthFunction: MaxWidth.expandable()
};

const isEntireElementSelected = (editor: Editor, elem: SugarElement<Element>) => {
  const rng = editor.selection.getRng();
  const leaf = Traverse.leaf(SugarElement.fromDom(rng.startContainer), rng.startOffset);
  return rng.startContainer === rng.endContainer && rng.startOffset === rng.endOffset - 1 && Compare.eq(leaf.element, elem);
};

/**
 * This function is designed to attempt to intelligently detect where the contextbar should be anchored when using an inside
 * layout. It will attempt to preserve the previous outside placement when anchoring to the same element. However, when the
 * placement is re-triggered (e.g. not triggered by a reposition) and the current editor selection overlaps with the contextbar,
 * then the anchoring should flip from the previous position to avoid conflicting with the selection.
 */
const determineInsideLayout = (editor: Editor, contextbar: SugarElement<HTMLElement>, elem: SugarElement<HTMLElement>, data: PositionData) => {
  const selectionBounds = getSelectionBounds(editor);
  const isSameAnchorElement = data.lastElement().exists((prev) => Compare.eq(elem, prev));

  if (isEntireElementSelected(editor, elem)) {
    // The entire anchor element is selected so it'll always overlap with the selection, in which case just
    // preserve or show at the top for a new anchor element.
    return isSameAnchorElement ? LayoutInset.preserve : LayoutInset.north;
  } else if (isSameAnchorElement) {
    // If overlapping and this wasn't triggered by a reposition then flip the placement
    const isOverlapping = data.lastPos().exists((box) => isVerticalOverlap(selectionBounds, box));
    return isOverlapping && !data.isReposition() ? LayoutInset.flip : LayoutInset.preserve;
  } else {
    // Attempt to find the best layout to use that won't cause an overlap for the new anchor element
    return data.bounds().map((bounds) => {
      const contextbarHeight = Height.get(contextbar) + bubbleSize;
      return bounds.y + contextbarHeight <= selectionBounds.y ? LayoutInset.north : LayoutInset.south;
    }).getOr(LayoutInset.north);
  }
};

const getAnchorSpec = (editor: Editor, mobile: boolean, data: PositionData) => {
  // IMPORTANT: We lazily determine the layout here so that we only do the calculations if absolutely necessary
  const smartInsideLayout = (elem: SugarElement<HTMLElement>): Layout => (anchor, element, bubbles, placee) => {
    const layout = determineInsideLayout(editor, placee, elem, data);
    return {
      ...layout(anchor, element, bubbles, placee),
      // Ensure this is always the preferred option if no outside layouts fit
      alwaysFit: true
    };
  };

  // On desktop we prioritise north-then-south because it's cleaner, but on mobile we prioritise south to try to avoid overlapping with native context toolbars
  const desktopAnchorSpecLayouts = {
    onLtr: (elem) => [ Layout.north, Layout.south, Layout.northeast, Layout.southeast, Layout.northwest, Layout.southwest, smartInsideLayout(elem) ],
    onRtl: (elem) => [ Layout.north, Layout.south, Layout.northwest, Layout.southwest, Layout.northeast, Layout.southeast, smartInsideLayout(elem) ]
  };

  const mobileAnchorSpecLayouts = {
    onLtr: (elem) => [ Layout.south, Layout.southeast, Layout.southwest, Layout.northeast, Layout.northwest, Layout.north, smartInsideLayout(elem) ],
    onRtl: (elem) => [ Layout.south, Layout.southwest, Layout.southeast, Layout.northwest, Layout.northeast, Layout.north, smartInsideLayout(elem) ]
  };

  return mobile ? mobileAnchorSpecLayouts : desktopAnchorSpecLayouts;
};

const getAnchorLayout = (editor: Editor, position: InlineContent.ContextPosition, isTouch: boolean, data: PositionData): Partial<AnchorSpec> => {
  if (position === 'line') {
    return {
      bubble: Bubble.nu(bubbleSize, 0, bubbleAlignments),
      layouts: {
        onLtr: () => [ Layout.east ],
        onRtl: () => [ Layout.west ]
      },
      overrides: anchorOverrides
    };
  } else {
    return {
      // Ensure that insets use half the bubble size since we're hiding the bubble arrow
      bubble: Bubble.nu(0, bubbleSize, bubbleAlignments, 0.5),
      layouts: getAnchorSpec(editor, isTouch, data),
      overrides: anchorOverrides
    };
  }
};

export {
  getAnchorLayout
};
