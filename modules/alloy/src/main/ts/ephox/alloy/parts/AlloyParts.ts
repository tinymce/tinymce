import { FieldPresence, FieldProcessorAdt, FieldSchema, Objects, ValueSchema } from '@ephox/boulder';
import { Arr, Fun, Obj, Option, Result } from '@ephox/katamari';

import { AlloyComponent } from '../api/component/ComponentApi';
import { AlloySpec, SimpleOrSketchSpec, SketchSpec } from '../api/component/SpecTypes';
import { CompositeSketchDetail } from '../api/ui/Sketcher';
import * as Fields from '../data/Fields';
import * as UiSubstitutes from '../spec/UiSubstitutes';
import * as PartSubstitutes from './PartSubstitutes';
import * as PartType from './PartType';

export interface GeneratedParts {
  [key: string]: (config: Record<string, any>) => ConfiguredPart;
}

export interface UnconfiguredPart {
  name: string;
  owner: string;
  uiType: string;
}

// TODO: Try and use stronger types for the config, however it's pretty arbitrary so it may not be possible
export interface ConfiguredPart extends UnconfiguredPart {
  config: Record<string, any>;
  validated: Record<string, any>;
}

export type Substitution = Record<string, UiSubstitutes.UiSubstitutesAdt>;

export interface Substitutions {
  internals: () => Substitution;
  externals: () => Record<string, () => Record<string, any>>;
}

// TODO: Make more functional if performance isn't an issue.
const generate = (owner: string, parts: PartType.PartTypeAdt[]): GeneratedParts => {
  const r: GeneratedParts = { };
  Arr.each(parts, (part) => {
    PartType.asNamedPart(part).each((np) => {
      const g: UnconfiguredPart = doGenerateOne(owner, np.pname);
      r[np.name] = (config) => {
        const validated = ValueSchema.asRawOrDie('Part: ' + np.name + ' in ' + owner, ValueSchema.objOf(np.schema), config);
        return {
          ...g,
          config,
          validated
        };
      };
    });
  });
  return r;
};

// Does not have the config.
const doGenerateOne = (owner: string, pname: string): UnconfiguredPart => ({
  uiType: UiSubstitutes.placeholder(),
  owner,
  name: pname
});

const generateOne = (owner: string, pname: string, config: SimpleOrSketchSpec): ConfiguredPart => ({
  uiType: UiSubstitutes.placeholder(),
  owner,
  name: pname,
  config,
  validated: { }
});

const schemas = (parts: PartType.PartTypeAdt[]): FieldProcessorAdt[] =>
  // This actually has to change. It needs to return the schemas for things that will
  // not appear in the components list, which is only externals
  Arr.bind(parts, (part: PartType.PartTypeAdt) => part.fold<Option<PartType.BasePartDetail<any, any>>>(
    Option.none,
    Option.some,
    Option.none,
    Option.none
  ).map((data) => FieldSchema.strictObjOf(data.name, data.schema.concat([
    Fields.snapshot(PartType.original())
  ]))).toArray());

const names = (parts: PartType.PartTypeAdt[]): string[] => Arr.map(parts, PartType.name);

const substitutes = <D extends CompositeSketchDetail>(owner: string, detail: D, parts: PartType.PartTypeAdt[]): Substitutions => PartSubstitutes.subs(owner, detail, parts);

const components = <D extends CompositeSketchDetail>(owner: string, detail: D, internals: Substitution): AlloySpec[] => UiSubstitutes.substitutePlaces(Option.some(owner), detail, detail.components, internals);

const getPart = <D extends CompositeSketchDetail>(component: AlloyComponent, detail: D, partKey: string): Option<AlloyComponent> => {
  const uid = detail.partUids[partKey];
  return component.getSystem().getByUid(uid).toOption();
};

const getPartOrDie = <D extends CompositeSketchDetail>(component: AlloyComponent, detail: D, partKey: string): AlloyComponent => getPart(component, detail, partKey).getOrDie('Could not find part: ' + partKey);

const getParts = <D extends CompositeSketchDetail>(component: AlloyComponent, detail: D, partKeys: string[]): Record<string, () => Result<AlloyComponent, Error>> => {
  const r: Record<string, () => Result<AlloyComponent, Error>> = { };
  const uids = detail.partUids;

  const system = component.getSystem();
  Arr.each(partKeys, (pk) => {
    r[pk] = Fun.constant(system.getByUid(uids[pk]));
  });

  return r;
};

const getAllParts = <D extends CompositeSketchDetail>(component: AlloyComponent, detail: D): Record<string, () => Result<AlloyComponent, Error>> => {
  const system = component.getSystem();
  return Obj.map(detail.partUids, (pUid, _k) => Fun.constant(system.getByUid(pUid)));
};

const getAllPartNames = <D extends CompositeSketchDetail>(detail: D) => Obj.keys(detail.partUids);

const getPartsOrDie = <D extends CompositeSketchDetail>(component: AlloyComponent, detail: D, partKeys: string[]): Record<string, () => AlloyComponent> => {
  const r: Record<string, () => AlloyComponent> = { };
  const uids = detail.partUids;

  const system = component.getSystem();
  Arr.each(partKeys, (pk) => {
    r[pk] = Fun.constant(system.getByUid(uids[pk]).getOrDie());
  });

  return r;
};

const defaultUids = (baseUid: string, partTypes: PartType.PartTypeAdt[]): Record<string, string> => {
  const partNames = names(partTypes);

  return Objects.wrapAll(
    Arr.map(partNames, (pn) => ({ key: pn, value: baseUid + '-' + pn }))
  );
};

const defaultUidsSchema = (partTypes: PartType.PartTypeAdt[]): FieldProcessorAdt => FieldSchema.field(
  'partUids',
  'partUids',
  FieldPresence.mergeWithThunk((spec: SketchSpec) => defaultUids(spec.uid, partTypes)),
  ValueSchema.anyValue()
);

export {
  generate,
  generateOne,
  schemas,
  names,
  substitutes,
  components,

  defaultUids,
  defaultUidsSchema,

  getAllParts,
  getAllPartNames,
  getPart,
  getPartOrDie,
  getParts,
  getPartsOrDie
};
