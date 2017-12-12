import Fields from '../data/Fields';
import PartSubstitutes from './PartSubstitutes';
import PartType from './PartType';
import UiSubstitutes from '../spec/UiSubstitutes';
import { FieldPresence } from '@ephox/boulder';
import { FieldSchema } from '@ephox/boulder';
import { Objects } from '@ephox/boulder';
import { ValueSchema } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Obj } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

// TODO: Make more functional if performance isn't an issue.
var generate = function (owner, parts) {
  var r = { };

  Arr.each(parts, function (part) {
    PartType.asNamedPart(part).each(function (np) {
      var g = doGenerateOne(owner, np.pname());
      r[np.name()] = function (config) {
        var validated = ValueSchema.asRawOrDie('Part: ' + np.name() + ' in ' + owner, ValueSchema.objOf(np.schema()), config);
        return Merger.deepMerge(g, {
          config: config,
          validated: validated
        });
      };
    });
  });

  return r;
};

// Does not have the config.
var doGenerateOne = function (owner, pname) {
  return {
    uiType: UiSubstitutes.placeholder(),
    owner: owner,
    name: pname
  };
};

var generateOne = function (owner, pname, config) {
  return {
    uiType: UiSubstitutes.placeholder(),
    owner: owner,
    name: pname,
    config: config,
    validated: { }
  };
};

var schemas = function (parts) {
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

var names = function (parts) {
  return Arr.map(parts, PartType.name);
};

var substitutes = function (owner, detail, parts) {
  return PartSubstitutes.subs(owner, detail, parts);
};

var components = function (owner, detail, internals) {
  return UiSubstitutes.substitutePlaces(Option.some(owner), detail, detail.components(), internals);
};

var getPart = function (component, detail, partKey) {
  var uid = detail.partUids()[partKey];
  return component.getSystem().getByUid(uid).toOption();
};

var getPartOrDie = function (component, detail, partKey) {
  return getPart(component, detail, partKey).getOrDie('Could not find part: ' + partKey);
};

var getParts = function (component, detail, partKeys) {
  var r = { };
  var uids = detail.partUids();

  var system = component.getSystem();
  Arr.each(partKeys, function (pk) {
    r[pk] = system.getByUid(uids[pk]);
  });

  // Structing
  return Obj.map(r, Fun.constant);
};

var getAllParts = function (component, detail) {
  var system = component.getSystem();
  return Obj.map(detail.partUids(), function (pUid, k) {
    return Fun.constant(system.getByUid(pUid));
  });
};

var getPartsOrDie = function (component, detail, partKeys) {
  var r = { };
  var uids = detail.partUids();

  var system = component.getSystem();
  Arr.each(partKeys, function (pk) {
    r[pk] = system.getByUid(uids[pk]).getOrDie();
  });

  // Structing
  return Obj.map(r, Fun.constant);
};

var defaultUids = function (baseUid, partTypes) {
  var partNames = names(partTypes);

  return Objects.wrapAll(
    Arr.map(partNames, function (pn) { 
      return { key: pn, value: baseUid + '-' + pn };
    })
  );
};

var defaultUidsSchema = function (partTypes) {
  return FieldSchema.field(
    'partUids',
    'partUids',
    FieldPresence.mergeWithThunk(function (spec) {
      return defaultUids(spec.uid, partTypes);
    }),
    ValueSchema.anyValue()
  );
};

export default <any> {
  generate: generate,
  generateOne: generateOne,
  schemas: schemas,
  names: names,
  substitutes: substitutes,
  components: components,

  defaultUids: defaultUids,
  defaultUidsSchema: defaultUidsSchema,

  getAllParts: getAllParts,
  getPart: getPart,
  getPartOrDie: getPartOrDie,
  getParts: getParts,
  getPartsOrDie: getPartsOrDie
};