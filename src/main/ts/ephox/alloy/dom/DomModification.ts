import { Objects } from '@ephox/boulder';
import { Arr, Merger, Obj, Struct, Option } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';

import { DomDefinitionDetail, nu as NuDefinition } from './DomDefinition';
import { Element } from '@ephox/sugar';

export interface DomModification {
  classes(): Option<string[]>;
  attributes(): Option<Record<string, string>>;
  styles(): Option<Record<string, string>>;
  value(): Option<any>;
  innerHtml(): Option<string>;
  defChildren(): Option<DomDefinitionDetail[]>;
  domChildren(): Option<Element[]>;
}

export interface DomModificationSpec {
  classes?: string[];
  attributes?: Record<string, string>;
  styles?: Record<string, string>;
  value?: any;
  innerHtml?: string;
  defChildren?: DomDefinitionDetail[];
  domChildren?: Element[];
}

const fields = [
  'classes',
  'attributes',
  'styles',
  'value',
  'innerHtml',
  'defChildren',
  'domChildren'
];
// Maybe we'll need to allow add/remove
const nu = Struct.immutableBag([ ], fields) as (s) => DomModification;

const derive = (settings): DomModification => {
  const r = { };
  const keys = Obj.keys(settings);
  Arr.each(keys, (key) => {
    settings[key].each((v) => {
      r[key] = v;
    });
  });

  return nu(r);
};

const modToStr = (mod: DomModification): string => {
  const raw = modToRaw(mod);
  return Json.stringify(raw, null, 2);
};

const modToRaw = (mod) => {
  return {
    classes: mod.classes().getOr('<none>'),
    attributes: mod.attributes().getOr('<none>'),
    styles: mod.styles().getOr('<none>'),
    value: mod.value().getOr('<none>'),
    innerHtml: mod.innerHtml().getOr('<none>'),
    defChildren: mod.defChildren().getOr('<none>'),
    domChildren: mod.domChildren().fold(() => {
      return '<none>';
    }, (children) => {
      return children.length === 0 ? '0 children, but still specified' : String(children.length);
    })
  };
};

// Ensure that both defChildren and domChildren are not specified.
const clashingOptArrays = (key: string, oArr1: Option<any[]>, oArr2: Option<any[]>): Record<string, any[]> => {
  return oArr1.fold(() => {
    return oArr2.fold(() => {
      return { };
    }, (arr2) => {
      return Objects.wrap(key, arr2);
    });
  }, (arr1) => {
    return oArr2.fold(() => {
      return Objects.wrap(key, arr1);
    }, (arr2) => {
      return Objects.wrap(key, arr2);
    });
  });
};

const merge = (defnA: DomDefinitionDetail, mod) => {
  const raw = Merger.deepMerge(
    {
      tag: defnA.tag(),
      classes: mod.classes().getOr([ ]).concat(defnA.classes().getOr([ ])),
      attributes: Merger.merge(
        defnA.attributes().getOr({}),
        mod.attributes().getOr({})
      ),
      styles: Merger.merge(
        defnA.styles().getOr({}),
        mod.styles().getOr({})
      )
    },
    mod.innerHtml().or(defnA.innerHtml()).map((innerHtml) => {
      return Objects.wrap('innerHtml', innerHtml);
    }).getOr({ }),

    clashingOptArrays('domChildren', mod.domChildren(), defnA.domChildren()),
    clashingOptArrays('defChildren', mod.defChildren(), defnA.defChildren()),

    mod.value().or(defnA.value()).map((value) => {
      return Objects.wrap('value', value);
    }).getOr({ })
  );

  return NuDefinition(raw);
};

export {
  nu,
  derive,

  merge,
  // combine: combine,
  modToStr,
  modToRaw
};