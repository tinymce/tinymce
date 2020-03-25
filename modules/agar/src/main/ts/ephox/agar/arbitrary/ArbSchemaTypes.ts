import { Merger, Obj } from '@ephox/katamari';
import { Attr, Css, InsertAll, Truncate } from '@ephox/sugar';
import Jsc from '@ephox/wrap-jsverify';

import * as ArbChildrenSchema from './ArbChildrenSchema';
import * as ArbNodes from './ArbNodes';
import { WeightedChoice } from './WeightedChoice';

const toTags = (detail) =>
  Obj.mapToArray(detail.tags, (v, k) => Merger.deepMerge(v, { tag: k }));

const flattenTag = (tag) => {
  const r = {};
  r[tag] = { weight: 1.0 };
  return r;
};

const conform = (detail) => {
  if (detail.tags !== undefined) {
    return detail;
  } else {
    return Merger.deepMerge(detail, {
      tags: flattenTag(detail.tag)
    });
  }
};

const addDecorations = (detail, element) => {
  const attrDecorator = detail.attributes !== undefined ? detail.attributes : Jsc.constant({}).generator;
  const styleDecorator = detail.styles !== undefined ? detail.styles : Jsc.constant({}).generator;
  return attrDecorator.flatMap((attrs) => {
    Attr.setAll(element, attrs);
    return styleDecorator.map((styles) => {
      Css.setAll(element, styles);
      return element;
    });
  });
};

const makeTag = (choice) => {
  const element = ArbNodes.elementOf(choice.tag);
  const attributes = choice.attributes !== undefined ? choice.attributes : {};
  const styles = choice.styles !== undefined ? choice.styles : {};
  Attr.setAll(element, attributes);
  Css.setAll(element, styles);
  return element;
};

export const create = (construct) => {
  const combine = (detail, childGenerator) => {
    const show = Truncate.getHtml;
    const tags = toTags(conform(detail));

    const generator = WeightedChoice.generator(tags).flatMap((choiceOption) => {
      const choice = choiceOption.getOrDie('Every entry in tags for: ' + JSON.stringify(detail) + ' must have a tag');
      return childGenerator.flatMap((children) => {
        const parent = makeTag(choice);
        InsertAll.append(parent, children);
        // Use any style and attribute decorators.
        return addDecorations(detail, parent);
      });
    });

    return Jsc.bless({
      generator,
      shrink: Jsc.shrink.noop,
      show
    });
  };

  const composite = (detail) => (rawDepth) => {
    const childGenerator = ArbChildrenSchema.composite(rawDepth, detail, construct);
    return combine(detail, childGenerator);
  };

  const leaf = (detail) => (_) => combine(detail, ArbChildrenSchema.none);

  const structure = (detail) => (rawDepth) => {
    const childGenerator = ArbChildrenSchema.structure(rawDepth, detail, construct);
    return combine(detail, childGenerator);
  };

  const arbitrary = (arb) => (_) => arb.component;

  return {
    arbitrary,
    leaf,
    structure,
    composite
  };
};
