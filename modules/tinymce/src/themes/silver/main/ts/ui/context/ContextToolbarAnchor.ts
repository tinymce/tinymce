import { AnchorSpec, Bounds, Boxes, Bubble, Layout, LayoutInset, MaxHeight, MaxWidth } from '@ephox/alloy';
import { InlineContent } from '@ephox/bridge';
import { Optional } from '@ephox/katamari';
import { Compare, Css, Height, Scroll, SugarElement, Traverse } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import { getSelectionBounds, isVerticalOverlap } from './ContextToolbarBounds';

type Layout = typeof LayoutInset.north;
type AnchorLayouts = AnchorSpec['layouts'];

export interface PositionData {
  readonly lastElement: () => Optional<SugarElement<Element>>;
  readonly isReposition: () => boolean;
  readonly getMode: () => string;
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

const preservePosition = <T>(elem: SugarElement<HTMLElement>, position: string, f: (elem: SugarElement<HTMLElement>) => T): T => {
  const currentPosition = Css.getRaw(elem, 'position');
  Css.set(elem, 'position', position);
  const result = f(elem);
  currentPosition.each((pos) => Css.set(elem, 'position', pos));
  return result;
};

// Don't use an inset layout when using a selection/line based anchors as it'll cover the content and can't be moved out the way
const shouldUseInsetLayouts = (position: InlineContent.ContextPosition): boolean =>
  position === 'node';

/**
 * This function is designed to attempt to intelligently detect where the contextbar should be anchored when using an inside
 * layout. It will attempt to preserve the previous outside placement when anchoring to the same element. However, when the
 * placement is re-triggered (e.g. not triggered by a reposition) and the current editor selection overlaps with the contextbar,
 * then the anchoring should flip from the previous position to avoid conflicting with the selection.
 */
const determineInsetLayout = (editor: Editor, contextbar: SugarElement<HTMLElement>, elem: SugarElement<Element>, data: PositionData, bounds: Bounds) => {
  const selectionBounds = getSelectionBounds(editor);
  const isSameAnchorElement = data.lastElement().exists((prev) => Compare.eq(elem, prev));

  if (isEntireElementSelected(editor, elem)) {
    // The entire anchor element is selected so it'll always overlap with the selection, in which case just
    // preserve or show at the top for a new anchor element.
    return isSameAnchorElement ? LayoutInset.preserve : LayoutInset.north;
  } else if (isSameAnchorElement) {
    // Preserve the position, get the bounds and then see if we have an overlap.
    // If overlapping and this wasn't triggered by a reposition then flip the placement
    return preservePosition(contextbar, data.getMode(), () => {
      // TINY-8890: The negative 20px threshold here was arrived at by considering the use
      // case of a table with default heights for the rows. The threshold had to be
      // large enough so that the context toolbar would not prevent the user selecting
      // in the row containing the context toolbar.
      const isOverlapping = isVerticalOverlap(selectionBounds, Boxes.box(contextbar), -20);
      return isOverlapping && !data.isReposition() ? LayoutInset.flip : LayoutInset.preserve;
    });
  } else {
    // Attempt to find the best layout to use that won't cause an overlap for the new anchor element
    // Note: In fixed positioning mode we need to translate by adding the scroll pos to get the absolute position
    const yBounds = data.getMode() === 'fixed' ? bounds.y + Scroll.get().top : bounds.y;
    const contextbarHeight = Height.get(contextbar) + bubbleSize;
    return yBounds + contextbarHeight <= selectionBounds.y ? LayoutInset.north : LayoutInset.south;
  }
};

const getAnchorSpec = (editor: Editor, mobile: boolean, data: PositionData, position: InlineContent.ContextPosition): AnchorLayouts => {
  // IMPORTANT: We lazily determine the layout here so that we only do the calculations if absolutely necessary
  const smartInsetLayout = (elem: SugarElement<Element>): Layout => (anchor, element, bubbles, placee, bounds) => {
    const layout = determineInsetLayout(editor, placee, elem, data, bounds);
    // Adjust the anchor box to use the passed y bound coords so that we simulate a "docking" type of behaviour
    const newAnchor = {
      ...anchor,
      y: bounds.y,
      height: bounds.height
    };
    return {
      ...layout(newAnchor, element, bubbles, placee, bounds),
      // Ensure this is always the preferred option if no outside layouts fit
      alwaysFit: true
    };
  };

  const getInsetLayouts = (elem: SugarElement<Element>): Layout[] =>
    shouldUseInsetLayouts(position) ? [ smartInsetLayout(elem) ] : [];

  // On desktop we prioritise north-then-south because it's cleaner, but on mobile we prioritise south to try to avoid overlapping with native context toolbars
  const desktopAnchorSpecLayouts: AnchorLayouts = {
    onLtr: (elem) => [ Layout.north, Layout.south, Layout.northeast, Layout.southeast, Layout.northwest, Layout.southwest ].concat(getInsetLayouts(elem)),
    onRtl: (elem) => [ Layout.north, Layout.south, Layout.northwest, Layout.southwest, Layout.northeast, Layout.southeast ].concat(getInsetLayouts(elem))
  };

  const mobileAnchorSpecLayouts: AnchorLayouts = {
    onLtr: (elem) => [ Layout.south, Layout.southeast, Layout.southwest, Layout.northeast, Layout.northwest, Layout.north ].concat(getInsetLayouts(elem)),
    onRtl: (elem) => [ Layout.south, Layout.southwest, Layout.southeast, Layout.northwest, Layout.northeast, Layout.north ].concat(getInsetLayouts(elem))
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
      // Ensure that inset layouts use a 1px bubble since we're hiding the bubble arrow
      bubble: Bubble.nu(0, bubbleSize, bubbleAlignments, 1 / bubbleSize),
      layouts: getAnchorSpec(editor, isTouch, data, position),
      overrides: anchorOverrides
    };
  }
};

export {
  getAnchorLayout,
  shouldUseInsetLayouts
};
