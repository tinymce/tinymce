import { Fun } from '@ephox/katamari';
import { Css } from '@ephox/sugar';
import { Height } from '@ephox/sugar';

// applies the max-height as determined by Bounder
var setMaxHeight = function (element, maxHeight) {
  Height.setMax(element, Math.floor(maxHeight));
};


// adds both max-height and overflow to constrain it
var anchored = function (element, available) {
  setMaxHeight(element, available);
  Css.setAll(element, {
    'overflow-x': 'hidden',
    'overflow-y': 'auto'
  });
};

/*
 * This adds max height, but not overflow - the effect of this is that elements can grow beyond the max height,
 * but if they run off the top they're pushed down.
 *
 * If the element expands below the screen height it will be cut off, but we were already doing that.
 */
var expandable = function (element, available) {
  setMaxHeight(element, available);
};

export default <any> {
  anchored: Fun.constant(anchored),
  expandable: Fun.constant(expandable)
};