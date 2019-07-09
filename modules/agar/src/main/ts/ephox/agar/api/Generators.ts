import * as Truncate from '../alien/Truncate';
import GenSelection from '../arbitrary/GenSelection';
import TagDecorator from '../arbitrary/TagDecorator';
import { Hierarchy, Html } from '@ephox/sugar';
import Jsc from '@ephox/wrap-jsverify';

const selection = function (container, exclusions) {
  return GenSelection.selection(container, exclusions);
};

const describeSelection = function (root, generated) {
  return Hierarchy.path(root, generated.start()).bind(function (startPath) {
    return Hierarchy.path(root, generated.finish()).map(function (finishPath) {
      return {
        selection: {
          startElement: Truncate.getHtml(generated.start()),
          startElementFull: Html.getOuter(generated.start()),
          startPath,
          startOffset: generated.soffset(),
          finishElement: Truncate.getHtml(generated.finish()),
          finishElementFull: Html.getOuter(generated.finish()),
          finishPath,
          finishOffset: generated.foffset()
        }
      };
    });
  }).getOr(generated);
};

const chooseOne = function (choices) {
  return TagDecorator.gOne(choices);
};

const enforce = function (attrs) {
  return TagDecorator.gEnforce(attrs);
};

const hexDigit = Jsc.elements('0123456789abcdef'.split(''));

const hexColor = Jsc.tuple([
  hexDigit,
  hexDigit,
  hexDigit,
  hexDigit,
  hexDigit,
  hexDigit
]).generator.map(function (digits) {
  return [ '#' ].concat(digits).join('');
});

export default {
  selection,
  describeSelection,
  chooseOne,
  enforce,
  hexColor
};
