import * as GenSelection from '../arbitrary/GenSelection';
import * as TagDecorator from '../arbitrary/TagDecorator';
import { Hierarchy, Html, Truncate } from '@ephox/sugar';
import Jsc from '@ephox/wrap-jsverify';

const selection = (container, exclusions) => GenSelection.selection(container, exclusions);

const describeSelection = (root, generated) =>
  Hierarchy.path(root, generated.start()).bind((startPath) =>
    Hierarchy.path(root, generated.finish()).map((finishPath) => ({
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
    }))).getOr(generated);

const chooseOne = (choices) => TagDecorator.gOne(choices);

const enforce = (attrs) => TagDecorator.gEnforce(attrs);

const hexDigit = Jsc.elements('0123456789abcdef'.split(''));

const hexColor = Jsc.tuple([
  hexDigit,
  hexDigit,
  hexDigit,
  hexDigit,
  hexDigit,
  hexDigit
]).generator.map((digits) => ['#'].concat(digits).join(''));

export {
  selection,
  describeSelection,
  chooseOne,
  enforce,
  hexColor
};
