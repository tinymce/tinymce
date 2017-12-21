import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { DomEvent } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Attr } from '@ephox/sugar';
import ResumeEditing from '../focus/ResumeEditing';
import Styles from '../../style/Styles';
import DataAttributes from '../../util/DataAttributes';
import Rectangles from '../../util/Rectangles';

// This amount is added to the minimum scrolling distance when calculating how much to scroll
// because the soft keyboard has appeared.
var EXTRA_SPACING = 50;

var data = 'data-' + Styles.resolve('last-outer-height');

var setLastHeight = function (cBody, value) {
  Attr.set(cBody, data, value);
};

var getLastHeight = function (cBody) {
  return DataAttributes.safeParse(cBody, data);
};

var getBoundsFrom = function (rect) {
  return {
    top: Fun.constant(rect.top()),
    bottom: Fun.constant(rect.top() + rect.height())
  };
};

var getBounds = function (cWin) {
  var rects = Rectangles.getRectangles(cWin);
  return rects.length > 0 ? Option.some(rects[0]).map(getBoundsFrom) : Option.none();
};

var findDelta = function (outerWindow, cBody) {
  var last = getLastHeight(cBody);
  var current = outerWindow.innerHeight;
  return last > current ? Option.some(last - current) : Option.none();
};

var calculate = function (cWin, bounds, delta) {
  // The goal here is to shift as little as required.
  var isOutside = bounds.top() > cWin.innerHeight || bounds.bottom() > cWin.innerHeight;
  return isOutside ? Math.min(delta, bounds.bottom() - cWin.innerHeight + EXTRA_SPACING) : 0;
};

var setup = function (outerWindow, cWin) {
  var cBody = Element.fromDom(cWin.document.body);

  var toEditing = function () {
    // TBIO-3816 throttling the resume was causing keyboard hide/show issues with undo/redo
    // throttling was introduced to work around a different keyboard hide/show issue, where
    // async uiChanged in Processor in polish was causing keyboard hide, which no longer seems to occur
    ResumeEditing.resume(cWin);
  };

  var onResize = DomEvent.bind(Element.fromDom(outerWindow), 'resize', function () {

    findDelta(outerWindow, cBody).each(function (delta) {
      getBounds(cWin).each(function (bounds) {
        // If the top is offscreen, scroll it into view.
        var cScrollBy = calculate(cWin, bounds, delta);
        if (cScrollBy !== 0) {
          cWin.scrollTo(cWin.pageXOffset, cWin.pageYOffset + cScrollBy);
        }
      });
    });
    setLastHeight(cBody, outerWindow.innerHeight);
  });

  setLastHeight(cBody, outerWindow.innerHeight);

  var destroy = function () {
    onResize.unbind();
  };

  return {
    toEditing: toEditing,
    destroy: destroy
  };
};

export default <any> {
  setup: setup
};