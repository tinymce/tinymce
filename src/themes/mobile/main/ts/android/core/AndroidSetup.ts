import { Fun, Option } from '@ephox/katamari';
import { Attr, DomEvent, Element } from '@ephox/sugar';

import Styles from '../../style/Styles';
import DataAttributes from '../../util/DataAttributes';
import Rectangles from '../../util/Rectangles';
import ResumeEditing from '../focus/ResumeEditing';

// This amount is added to the minimum scrolling distance when calculating how much to scroll
// because the soft keyboard has appeared.
const EXTRA_SPACING = 50;

const data = 'data-' + Styles.resolve('last-outer-height');

const setLastHeight = function (cBody, value) {
  Attr.set(cBody, data, value);
};

const getLastHeight = function (cBody) {
  return DataAttributes.safeParse(cBody, data);
};

const getBoundsFrom = function (rect) {
  return {
    top: Fun.constant(rect.top()),
    bottom: Fun.constant(rect.top() + rect.height())
  };
};

const getBounds = function (cWin) {
  const rects = Rectangles.getRectangles(cWin);
  return rects.length > 0 ? Option.some(rects[0]).map(getBoundsFrom) : Option.none();
};

const findDelta = function (outerWindow, cBody) {
  const last = getLastHeight(cBody);
  const current = outerWindow.innerHeight;
  return last > current ? Option.some(last - current) : Option.none();
};

const calculate = function (cWin, bounds, delta) {
  // The goal here is to shift as little as required.
  const isOutside = bounds.top() > cWin.innerHeight || bounds.bottom() > cWin.innerHeight;
  return isOutside ? Math.min(delta, bounds.bottom() - cWin.innerHeight + EXTRA_SPACING) : 0;
};

const setup = function (outerWindow, cWin) {
  const cBody = Element.fromDom(cWin.document.body);

  const toEditing = function () {
    // TBIO-3816 throttling the resume was causing keyboard hide/show issues with undo/redo
    // throttling was introduced to work around a different keyboard hide/show issue, where
    // async uiChanged in Processor in polish was causing keyboard hide, which no longer seems to occur
    ResumeEditing.resume(cWin);
  };

  const onResize = DomEvent.bind(Element.fromDom(outerWindow), 'resize', function () {

    findDelta(outerWindow, cBody).each(function (delta) {
      getBounds(cWin).each(function (bounds) {
        // If the top is offscreen, scroll it into view.
        const cScrollBy = calculate(cWin, bounds, delta);
        if (cScrollBy !== 0) {
          cWin.scrollTo(cWin.pageXOffset, cWin.pageYOffset + cScrollBy);
        }
      });
    });
    setLastHeight(cBody, outerWindow.innerHeight);
  });

  setLastHeight(cBody, outerWindow.innerHeight);

  const destroy = function () {
    onResize.unbind();
  };

  return {
    toEditing,
    destroy
  };
};

export default {
  setup
};