import { Merger, Obj } from '@ephox/katamari';
import { Attribute, Css, InsertAll, SugarElement } from '@ephox/sugar';
import * as fc from 'fast-check';

import * as ArbChildrenSchema from './ArbChildrenSchema';
import * as ArbNodes from './ArbNodes';
import * as WeightedChoice from './WeightedChoice';

interface Decorations {
  readonly attributes?: Record<string, string | boolean | number>;
  readonly styles?: Record<string, string>;
}

interface ArbDecorations {
  readonly attributes?: fc.Arbitrary<Record<string, string | boolean | number>>;
  readonly styles?: fc.Arbitrary<Record<string, string>>;
}

export interface TagDetail extends ArbDecorations {
  readonly tag: string;
}

export interface TagsDetail extends ArbDecorations {
  readonly tags: Record<string, WeightedChoice.WeightedItem & Decorations>;
}

export type CompositeDetail = (TagDetail | TagsDetail) & ArbChildrenSchema.CompositeDetail & {
  readonly type: 'composite';
};

export interface StructureDetail extends TagDetail, ArbChildrenSchema.StructureDetail {
  readonly type: 'structure';
}

export interface LeafDetail extends TagDetail {
  readonly type: 'leaf';
}

export interface ArbitraryDetail<T> {
  readonly type: 'arbitrary';
  readonly component: fc.Arbitrary<T>;
}

export type SchemaDetail = ArbitraryDetail<any> | CompositeDetail | LeafDetail | StructureDetail;

interface Tag extends WeightedChoice.WeightedItem, Decorations {
  readonly tag: string;
}

export interface Schema {
  readonly arbitrary: <T extends Node>(arb: ArbitraryDetail<T>) => (rawDepth: number | undefined) => fc.Arbitrary<SugarElement<T>>;
  readonly leaf: (detail: LeafDetail) => (rawDepth: number | undefined) => fc.Arbitrary<SugarElement<HTMLElement>>;
  readonly structure: (detail: StructureDetail) => (rawDepth: number | undefined) => fc.Arbitrary<SugarElement<HTMLElement>>;
  readonly composite: (detail: CompositeDetail) => (rawDepth: number | undefined) => fc.Arbitrary<SugarElement<HTMLElement>>;
}

const isTagsDetail = (detail: TagsDetail | TagDetail): detail is TagsDetail =>
  (detail as TagsDetail).tags !== undefined;

const toTags = (detail: TagsDetail): Tag[] =>
  Obj.mapToArray(detail.tags, (v, k) => Merger.deepMerge(v, { tag: k }));

const flattenTag = (tag: string): Record<string, WeightedChoice.WeightedItem & Decorations> => {
  const r = {};
  r[tag] = { weight: 1.0 };
  return r;
};

const conform = (detail: TagsDetail | TagDetail): TagsDetail => {
  if (isTagsDetail(detail)) {
    return detail;
  } else {
    return Merger.deepMerge(detail, {
      tags: flattenTag(detail.tag)
    });
  }
};

const addDecorations = (detail: ArbDecorations, element: SugarElement<HTMLElement>) => {
  const attrDecorator = detail.attributes !== undefined ? detail.attributes : fc.constant({});
  const styleDecorator = detail.styles !== undefined ? detail.styles : fc.constant({});
  return attrDecorator.chain((attrs) => {
    Attribute.setAll(element, attrs);
    return styleDecorator.map((styles) => {
      Css.setAll(element, styles);
      return element;
    });
  });
};

const makeTag = (choice: Tag): SugarElement<HTMLElement> => {
  const element = ArbNodes.elementOf(choice.tag);
  const attributes = choice.attributes !== undefined ? choice.attributes : {};
  const styles = choice.styles !== undefined ? choice.styles : {};
  Attribute.setAll(element, attributes);
  Css.setAll(element, styles);
  return element;
};

export const create = (construct: ArbChildrenSchema.Construct<SugarElement<Node>>): Schema => {
  const combine = (detail: LeafDetail | StructureDetail | CompositeDetail, childGenerator: fc.Arbitrary<SugarElement<Node>[]>) => {
    const tags = toTags(conform(detail));

    return WeightedChoice.generator(tags).chain((choiceOption) => {
      const choice = choiceOption.getOrDie('Every entry in tags for: ' + JSON.stringify(detail) + ' must have a tag');
      return childGenerator.chain((children) => {
        const parent = makeTag(choice);
        InsertAll.append(parent, children);
        // Use any style and attribute decorators.
        return addDecorations(detail, parent);
      });
    });
  };

  const composite = (detail: CompositeDetail) => (rawDepth: number | undefined) => {
    const childGenerator = ArbChildrenSchema.composite(rawDepth, detail, construct);
    return combine(detail, childGenerator);
  };

  const leaf = (detail: LeafDetail) => (_: number | undefined) => combine(detail, ArbChildrenSchema.none);

  const structure = (detail: StructureDetail) => (rawDepth: number | undefined) => {
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
