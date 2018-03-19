import { FieldPresence, FieldProcessorAdt, FieldSchema, Objects, ValueSchema } from '@ephox/boulder';
import { Arr, Fun, Merger, Obj, Option, Result } from '@ephox/katamari';

import * as Fields from '../data/Fields';
import * as UiSubstitutes from '../spec/UiSubstitutes';
import * as PartSubstitutes from './PartSubstitutes';
import * as PartType from './PartType';
import { SketchSpec, RawDomSchema } from '../api/ui/Sketcher';
import { SpecSchemaStruct } from '../spec/SpecSchema';
import { AlloyComponent } from '../api/component/ComponentApi';

export interface GeneratedParts {
  [key: string]: (config: RawDomSchema) => GeneratedSinglePart;
}

export interface GeneratedSinglePart {
  config: RawDomSchema;
  name: string;
  owner: string;
  uiType: string;
  validated: {};
}

export interface DetailedSpec extends SpecSchemaStruct {
  partUids?: () => { [key: string]: string };

  // Below Are items that maybe required in this type
  // dragBlockClass
  // lazySink
  // modalBehaviours
  // onEscape
  // onExecute
  // partUids
  // parts
  // useTabstopAt
}

// TODO: Make more functional if performance isn't an issue.
const generate = function (owner: string, parts: FieldProcessorAdt[]): GeneratedParts {
  const r = { };
  Arr.each(parts, function (part) {
    PartType.asNamedPart(part).each(function (np) {
      const g = doGenerateOne(owner, np.pname());
      r[np.name()] = function (config) {
        const validated = ValueSchema.asRawOrDie('Part: ' + np.name() + ' in ' + owner, ValueSchema.objOf(np.schema()), config);
        return Merger.deepMerge(g, {
          config,
          validated
        });
      };
    });
  });
  return r;
};

// Does not have the config.
const doGenerateOne = function (owner, pname) {
  return {
    uiType: UiSubstitutes.placeholder(),
    owner,
    name: pname
  };
};

const generateOne = function (owner: string, pname: string, config: SketchSpec): GeneratedSinglePart {
  return {
    uiType: UiSubstitutes.placeholder(),
    owner,
    name: pname,
    config,
    validated: { }
  };
};

const schemas = function (parts: FieldProcessorAdt[]): FieldProcessorAdt[] {
  // This actually has to change. It needs to return the schemas for things that will
  // not appear in the components list, which is only externals
  return Arr.bind(parts, function (part) {
    return part.fold(
      Option.none,
      Option.some,
      Option.none,
      Option.none
    ).map(function (data) {
      return FieldSchema.strictObjOf(data.name(), data.schema().concat([
        Fields.snapshot(PartType.original())
      ]));
    }).toArray();
  });
};

const names = function (parts) {
  return Arr.map(parts, PartType.name);
};

const substitutes = function (owner: string, detail: DetailedSpec, parts: FieldProcessorAdt[]): { internals: () => {}, externals: () => {} } {
  return PartSubstitutes.subs(owner, detail, parts);
};

const components = function (owner: string, detail: DetailedSpec, internals: { [key: string]: FieldProcessorAdt }): SketchSpec[] {
  return UiSubstitutes.substitutePlaces(Option.some(owner), detail, detail.components(), internals);
};

const getPart = function (component: AlloyComponent, detail: DetailedSpec, partKey: string): Option<AlloyComponent> {
  const uid = detail.partUids()[partKey];
  return component.getSystem().getByUid(uid).toOption();
};

const getPartOrDie = function (component: AlloyComponent, detail: DetailedSpec, partKey: string): AlloyComponent {
  return getPart(component, detail, partKey).getOrDie('Could not find part: ' + partKey);
};

const getParts = function (component: AlloyComponent, detail: DetailedSpec, partKeys: string[]): { [key: string]: () => Result<AlloyComponent, string> } {
  const r = { };
  const uids = detail.partUids();

  const system = component.getSystem();
  Arr.each(partKeys, function (pk) {
    r[pk] = system.getByUid(uids[pk]);
  });

  // Structing
  return Obj.map(r, Fun.constant);
};

const getAllParts = function (component: AlloyComponent, detail: DetailedSpec) {
  const system = component.getSystem();
  return Obj.map(detail.partUids(), function (pUid, k) {
    return Fun.constant(system.getByUid(pUid));
  });
};

const getPartsOrDie = function (component: AlloyComponent, detail: DetailedSpec, partKeys: string[]): { [key: string]: () => AlloyComponent } {
  const r = { };
  const uids = detail.partUids();

  const system = component.getSystem();
  Arr.each(partKeys, function (pk) {
    r[pk] = system.getByUid(uids[pk]).getOrDie();
  });

  // Structing
  return Obj.map(r, Fun.constant);
};

const defaultUids = function (baseUid: string, partTypes) {
  const partNames = names(partTypes);

  return Objects.wrapAll(
    Arr.map(partNames, function (pn) {
      return { key: pn, value: baseUid + '-' + pn };
    })
  );
};

const defaultUidsSchema = function (partTypes) {
  return FieldSchema.field(
    'partUids',
    'partUids',
    FieldPresence.mergeWithThunk(function (spec) {
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
  getPart,
  getPartOrDie,
  getParts,
  getPartsOrDie
};