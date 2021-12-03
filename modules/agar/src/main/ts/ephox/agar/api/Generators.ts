import { Hierarchy, Html, SimRange, SugarElement, Truncate } from '@ephox/sugar';
import * as fc from 'fast-check';

import * as GenSelection from '../arbitrary/GenSelection';
import * as TagDecorator from '../arbitrary/TagDecorator';

interface DescribedSimRange {
  readonly selection: {
    readonly startElement: string;
    readonly startElementFull: string;
    readonly startPath: number[];
    readonly startOffset: number;
    readonly finishElement: string;
    readonly finishElementFull: string;
    readonly finishPath: number[];
    readonly finishOffset: number;
  };
}

const selection = (container: SugarElement<Node>, exclusions: GenSelection.SelectionExclusions): fc.Arbitrary<SimRange> =>
  GenSelection.selection(container, exclusions);

const describeSelection = (root: SugarElement<Node>, generated: SimRange): DescribedSimRange | SimRange =>
  Hierarchy.path(root, generated.start).bind((startPath) =>
    Hierarchy.path(root, generated.finish).map((finishPath) => ({
      selection: {
        startElement: Truncate.getHtml(generated.start),
        startElementFull: Html.getOuter(generated.start),
        startPath,
        startOffset: generated.soffset,
        finishElement: Truncate.getHtml(generated.finish),
        finishElementFull: Html.getOuter(generated.finish),
        finishPath,
        finishOffset: generated.foffset
      }
    }))).getOr(generated);

const chooseOne = <T>(choices: TagDecorator.Decorator<T>[]): fc.Arbitrary<Record<string, T>> =>
  TagDecorator.gOne(choices);

const enforce = <T extends Record<string, string | number | boolean>>(attrs: T): fc.Arbitrary<T> =>
  TagDecorator.gEnforce(attrs);

const hexDigit = fc.constantFrom(...'0123456789abcdef'.split(''));

const hexColor = fc.tuple(
  hexDigit,
  hexDigit,
  hexDigit,
  hexDigit,
  hexDigit,
  hexDigit
).map((digits) => [ '#' ].concat(digits).join(''));

export {
  selection,
  describeSelection,
  chooseOne,
  enforce,
  hexColor
};
