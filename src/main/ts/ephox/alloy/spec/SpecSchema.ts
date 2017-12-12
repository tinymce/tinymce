import Fields from '../data/Fields';
import UiSubstitutes from './UiSubstitutes';
import { FieldSchema } from '@ephox/boulder';
import { Objects } from '@ephox/boulder';
import { ValueSchema } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Obj } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';

var getPartsSchema = function (partNames, _optPartNames, _owner) {
  var owner = _owner !== undefined ? _owner : 'Unknown owner';
  var fallbackThunk = function () {
    return [
      Fields.output('partUids', { })
    ];
  };

  var optPartNames = _optPartNames !== undefined ? _optPartNames : fallbackThunk();
  if (partNames.length === 0 && optPartNames.length === 0) return fallbackThunk();

  // temporary hacking
  var partsSchema = FieldSchema.strictObjOf(
    'parts',
    Arr.flatten([
      Arr.map(partNames, FieldSchema.strict),
      Arr.map(optPartNames, function (optPart) {
        return FieldSchema.defaulted(optPart, UiSubstitutes.single(false, function () {
          throw new Error('The optional part: ' + optPart + ' was not specified in the config, but it was used in components');
        }));
      })
    ])
  );

  var partUidsSchema = FieldSchema.state(
    'partUids',
    function (spec) {
      if (! Objects.hasKey(spec, 'parts')) {
        throw new Error(
          'Part uid definition for owner: ' + owner + ' requires "parts"\nExpected parts: ' + partNames.join(', ') + '\nSpec: ' +
          Json.stringify(spec, null, 2)
        );
      }
      var uids = Obj.map(spec.parts, function (v, k) {
        return Objects.readOptFrom(v, 'uid').getOrThunk(function () {
          return spec.uid + '-' + k;
        });
      });
      return uids;
    }
  );

  return [ partsSchema, partUidsSchema ];
};

var getPartUidsSchema = function (label, spec) {
  return FieldSchema.state(
    'partUids',
    function (spec) {
      if (! Objects.hasKey(spec, 'parts')) {
        throw new Error(
          'Part uid definition for owner: ' + label + ' requires "parts\nSpec: ' +
          Json.stringify(spec, null, 2)
        );
      }
      var uids = Obj.map(spec.parts, function (v, k) {
        return Objects.readOptFrom(v, 'uid').getOrThunk(function () {
          return spec.uid + '-' + k;
        });
      });
      return uids;
    }
  );
};

var base = function (label, partSchemas, partUidsSchemas, spec) {
  var ps = partSchemas.length > 0 ? [
    FieldSchema.strictObjOf('parts', partSchemas)
  ] : [ ];

  return ps.concat([
    FieldSchema.strict('uid'),
    FieldSchema.defaulted('dom', { }), // Maybe get rid of.
    FieldSchema.defaulted('components', [ ]),
    Fields.snapshot('originalSpec'),
    FieldSchema.defaulted('debug.sketcher', { })
  ]).concat(partUidsSchemas);
};


var asRawOrDie = function (label, schema, spec, partSchemas, partUidsSchemas) {

  var baseS = base(label, partSchemas, spec, partUidsSchemas);
  return ValueSchema.asRawOrDie(label + ' [SpecSchema]', ValueSchema.objOfOnly(baseS.concat(schema)), spec);
};

var asStructOrDie = function (label, schema, spec, partSchemas, partUidsSchemas) {
  var baseS = base(label, partSchemas, partUidsSchemas, spec);
  return ValueSchema.asStructOrDie(label + ' [SpecSchema]', ValueSchema.objOfOnly(baseS.concat(schema)), spec);
};

var extend = function (builder, original, nu) {
  // Merge all at the moment.
  var newSpec = Merger.deepMerge(original, nu);
  return builder(newSpec);
};

var addBehaviours = function (original, behaviours) {
  return Merger.deepMerge(original, behaviours);
};

export default <any> {
  asRawOrDie: asRawOrDie,
  asStructOrDie: asStructOrDie,
  addBehaviours: addBehaviours,

  getPartsSchema: getPartsSchema,
  extend: extend
};