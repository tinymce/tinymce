import { FieldPresence, FieldProcessorAdt, FieldSchema, Objects, ValueSchema } from '@ephox/boulder';
import { Arr, Fun, Obj, Option, Result } from '@ephox/katamari';

import { AlloyComponent } from '../api/component/ComponentApi';
import { AlloySpec, RawDomSchema } from '../api/component/SpecTypes';
import { CompositeSketchDetail } from '../api/ui/Sketcher';
import * as Fields from '../data/Fields';
import * as UiSubstitutes from '../spec/UiSubstitutes';
import * as PartSubstitutes from './PartSubstitutes';
import * as PartType from './PartType';

export interface PartialSpec { }

export interface GeneratedParts {
  [key: string]: (config: PartialSpec) => ConfiguredPart;
}

export interface UnconfiguredPart {
  name: string;
  owner: string;
  uiType: string;
}

export interface ConfiguredPart extends UnconfiguredPart {
  config: Record<string, any>;
  validated: Record<string, any>;
}

export interface Substition { [ key: string ]: FieldProcessorAdt; }

export interface Substitutions {
  internals: () => Substition;
  externals: () => Record<string, () => any>;
}

// TODO: Make more functional if performance isn't an issue.
const generate = (owner: string, parts: PartType.PartTypeAdt[]): GeneratedParts => {
  const r = { };
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
const doGenerateOne = (owner: string, pname: string): UnconfiguredPart => {
  return {
    uiType: UiSubstitutes.placeholder(),
    owner,
    name: pname
  };
};

const generateOne = (owner: string, pname: string, config: RawDomSchema): ConfiguredPart => {
  return {
    uiType: UiSubstitutes.placeholder(),
    owner,
    name: pname,
    config,
    validated: { }
  };
};

const schemas = (parts: PartType.PartTypeAdt[]): FieldProcessorAdt[] => {
  // This actually has to change. It needs to return the schemas for things that will
  // not appear in the components list, which is only externals
  return Arr.bind(parts, (part: PartType.PartTypeAdt) => {
    return part.fold(
      Option.none,
      Option.some,
      Option.none,
      Option.none
    ).map((data: PartType.PartSpec<any>) => {
      return FieldSchema.strictObjOf(data.name, data.schema.concat([
        Fields.snapshot(PartType.original())
      ]));
    }).toArray();
  });
};

const names = (parts: PartType.PartTypeAdt[]): string[] => {
  return Arr.map(parts, PartType.name);
};

const substitutes = (owner: string, detail: CompositeSketchDetail, parts: PartType.PartTypeAdt[]): Substitutions => {
  return PartSubstitutes.subs(owner, detail, parts);
};

const components = (owner: string, detail: CompositeSketchDetail, internals: Substition): AlloySpec[] => {
  return UiSubstitutes.substitutePlaces(Option.some(owner), detail, detail.components, internals);
};

const getPart = (component: AlloyComponent, detail: CompositeSketchDetail, partKey: string): Option<AlloyComponent> => {
  const uid = detail.partUids[partKey];
  return component.getSystem().getByUid(uid).toOption();
};

const getPartOrDie = (component: AlloyComponent, detail: CompositeSketchDetail, partKey: string): AlloyComponent => {
  return getPart(component, detail, partKey).getOrDie('Could not find part: ' + partKey);
};

const getParts = (component: AlloyComponent, detail: CompositeSketchDetail, partKeys: string[]): Record<string, () => Result<AlloyComponent, string | Error>> => {
  const r: Record<string, () => Result<AlloyComponent, string | Error>> = { };
  const uids = detail.partUids;

  const system = component.getSystem();
  Arr.each(partKeys, (pk) => {
    r[pk] = Fun.constant(system.getByUid(uids[pk]));
  });

  return r;
};

const getAllParts = (component: AlloyComponent, detail: CompositeSketchDetail): Record<string, () => Result<AlloyComponent, string | Error>> => {
  const system = component.getSystem();
  return Obj.map(detail.partUids, (pUid, k) => {
    return Fun.constant(system.getByUid(pUid));
  });
};

const getAllPartNames = (detail: CompositeSketchDetail) => {
  return Obj.keys(detail.partUids);
};

const getPartsOrDie = (component: AlloyComponent, detail: CompositeSketchDetail, partKeys: string[]): Record<string, () => AlloyComponent> => {
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
    Arr.map(partNames, (pn) => {
      return { key: pn, value: baseUid + '-' + pn };
    })
  );
};

const defaultUidsSchema = (partTypes: PartType.PartTypeAdt[]): FieldProcessorAdt => {
  return FieldSchema.field(
    'partUids',
    'partUids',
    FieldPresence.mergeWithThunk((spec) => {
      return defaultUids(spec.uid, partTypes);
    }),
    ValueSchema.anyValue()
  );
};

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
