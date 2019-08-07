import { FieldProcessorAdt, FieldSchema, Objects, ValueSchema } from '@ephox/boulder';
import { Arr, Obj, Adt } from '@ephox/katamari';

import { ComponentSpec, RawDomSchema } from '../api/component/SpecTypes';
import { AlloyEventRecord } from '../api/events/AlloyEvents';
import * as Fields from '../data/Fields';
import * as UiSubstitutes from './UiSubstitutes';

export interface SpecSchemaStruct {
  components: () => ComponentSpec;
  dom: () => RawDomSchema;
  domModification?: () => {}; // TODO: Mike
  eventOrder?: () => { [key: string]: string[] }; // TODO: Mike test this
  // Deprecate
  events?: () => AlloyEventRecord;
  originalSpec: () => any; // For debugging purposes only
  uid: () => string;
  'debug.sketcher': () => {};
  // ... optional
  // some items are optional
}

export interface ContainerBehaviours {
  dump: () => {};
  [key: string]: any;
}

const getPartsSchema = (partNames, _optPartNames, _owner): FieldProcessorAdt[] => {
  const owner = _owner !== undefined ? _owner : 'Unknown owner';
  const fallbackThunk = () => {
    return [
      Fields.output('partUids', { })
    ];
  };

  const optPartNames = _optPartNames !== undefined ? _optPartNames : fallbackThunk();
  if (partNames.length === 0 && optPartNames.length === 0) { return fallbackThunk(); }

  // temporary hacking
  const partsSchema = FieldSchema.strictObjOf(
    'parts',
    Arr.flatten([
      Arr.map(partNames, FieldSchema.strict),
      Arr.map(optPartNames, (optPart) => {
        return FieldSchema.defaulted(optPart, UiSubstitutes.single(false, () => {
          throw new Error('The optional part: ' + optPart + ' was not specified in the config, but it was used in components');
        }));
      })
    ])
  );

  const partUidsSchema = FieldSchema.state(
    'partUids',
    (spec) => {
      if (! Objects.hasKey(spec, 'parts')) {
        throw new Error(
          'Part uid definition for owner: ' + owner + ' requires "parts"\nExpected parts: ' + partNames.join(', ') + '\nSpec: ' +
          JSON.stringify(spec, null, 2)
        );
      }
      const uids = Obj.map(spec.parts, (v, k) => {
        return Objects.readOptFrom<string>(v, 'uid').getOrThunk(() => {
          return spec.uid + '-' + k;
        });
      });
      return uids;
    }
  );

  return [ partsSchema, partUidsSchema ];
};

const base = (partSchemas, partUidsSchemas) => {
  const ps = partSchemas.length > 0 ? [
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

const asRawOrDie = <D, S>(label, schema: Adt[], spec: S, partSchemas, partUidsSchemas): D => {
  // OBVIOUSLY NEVER USED RAW BEFORE !!!!!!!!!!!!!!!!!!!!!
  const baseS = base(partSchemas, partUidsSchemas);
  return ValueSchema.asRawOrDie(label + ' [SpecSchema]', ValueSchema.objOfOnly(baseS.concat(schema)), spec);
};

const asStructOrDie = function <D, S>(label: string, schema: Adt[], spec: S, partSchemas: any[], partUidsSchemas: any[]): D {
  const baseS = base(partSchemas, partUidsSchemas);
  return ValueSchema.asStructOrDie(label + ' [SpecSchema]', ValueSchema.objOfOnly(baseS.concat(schema)), spec);
};

export {
  asRawOrDie,
  asStructOrDie,
  getPartsSchema
};
