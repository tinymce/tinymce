import { Merger, Obj } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';
import { Attr, Css, InsertAll } from '@ephox/sugar';
import Jsc from '@ephox/wrap-jsverify';

import * as Truncate from '../alien/Truncate';
import ArbChildrenSchema from './ArbChildrenSchema';
import ArbNodes from './ArbNodes';
import { WeightedChoice } from './WeightedChoice';

const toTags = function (detail) {
  return Obj.mapToArray(detail.tags, function (v, k) {
    return Merger.deepMerge(v, { tag: k });
  });
};

const flattenTag = function (tag) {
  const r = {};
  r[tag] = { weight: 1.0 };
  return r;
};

const conform = function (detail) {
  if (detail.tags !== undefined) return detail;
  else return Merger.deepMerge(detail, {
    tags: flattenTag(detail.tag)
  });
};

const addDecorations = function (detail, element) {
  const attrDecorator = detail.attributes !== undefined ? detail.attributes : Jsc.constant({}).generator;
  const styleDecorator = detail.styles !== undefined ? detail.styles : Jsc.constant({}).generator;
  return attrDecorator.flatMap(function (attrs) {
    Attr.setAll(element, attrs);
    return styleDecorator.map(function (styles) {
      Css.setAll(element, styles);
      return element;
    });
  });
};

const makeTag = function (choice) {
  const element = ArbNodes.elementOf(choice.tag);
  const attributes = choice.attributes !== undefined ? choice.attributes : {};
  const styles = choice.styles !== undefined ? choice.styles : {};
  Attr.setAll(element, attributes);
  Css.setAll(element, styles);
  return element;
};

export default function (construct) {
  const combine = function (detail, childGenerator) {
    const show = Truncate.getHtml;
    const tags = toTags(conform(detail));

    const generator = WeightedChoice.generator(tags).flatMap(function (choiceOption) {
      const choice = choiceOption.getOrDie('Every entry in tags for: ' + Json.stringify(detail) + ' must have a tag');
      return childGenerator.flatMap(function (children) {
        const parent = makeTag(choice);
        InsertAll.append(parent, children);
        // Use any style and attribute decorators.
        return addDecorations(detail, parent);
      });
    });

    return Jsc.bless({
      generator: generator,
      shrink: Jsc.shrink.noop,
      show: show
    });
  };

  const composite = function (detail) {
    return function (rawDepth) {
      const childGenerator = ArbChildrenSchema.composite(rawDepth, detail, construct);
      return combine(detail, childGenerator);
    };
  };


  const leaf = function (detail) {
    return function (_) {
      return combine(detail, ArbChildrenSchema.none);
    };
  };

  const structure = function (detail) {
    return function (rawDepth) {
      const childGenerator = ArbChildrenSchema.structure(rawDepth, detail, construct);
      return combine(detail, childGenerator);
    };
  };

  const arbitrary = function (arb) {
    return function (_) {
      return arb.component;
    };
  };

  return {
    arbitrary: arbitrary,
    leaf: leaf,
    structure: structure,
    composite: composite
  };
};