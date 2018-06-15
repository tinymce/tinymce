import { Objects } from '@ephox/boulder';
import { Arr, Fun, Merger, Obj, Result } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';

import * as ObjIndex from '../alien/ObjIndex';
import * as DomModification from '../dom/DomModification';
import { DomDefinition } from '../dom/DomDefinition';

const behaviourDom = (name, modification) => {
  return {
    name: Fun.constant(name),
    modification
  };
};

const concat = (chain, aspect) => {
  const values = Arr.bind(chain, (c) => {
    return c.modification().getOr([ ]);
  });
  return Result.value(
    Objects.wrap(aspect, values)
  );
};

const onlyOne = (chain, aspect, order) => {
  if (chain.length > 1) { return Result.error(
    'Multiple behaviours have tried to change DOM "' + aspect + '". The guilty behaviours are: ' +
      Json.stringify(Arr.map(chain, (b) => { return b.name(); })) + '. At this stage, this ' +
      'is not supported. Future releases might provide strategies for resolving this.'
  );
  } else if (chain.length === 0) { return Result.value({ }); } else { return Result.value(
    chain[0].modification().fold(() => {
      return { };
    }, (m) => {
      return Objects.wrap(aspect, m);
    })
  );
       }
};

const duplicate = (aspect, k, obj, behaviours) => {
  return Result.error('Mulitple behaviours have tried to change the _' + k + '_ "' + aspect + '"' +
    '. The guilty behaviours are: ' + Json.stringify(Arr.bind(behaviours, (b) => {
      return b.modification().getOr({})[k] !== undefined ? [ b.name() ] : [ ];
    }), null, 2) + '. This is not currently supported.'
  );
};

const safeMerge = (chain, aspect) => {
  // return unsafeMerge(chain, aspect);
  const y = Arr.foldl(chain, (acc, c) => {
    const obj = c.modification().getOr({});
    return acc.bind((accRest) => {
      const parts = Obj.mapToArray(obj, (v, k) => {
        return accRest[k] !== undefined ? duplicate(aspect, k, obj, chain) :
          Result.value(Objects.wrap(k, v));
      });
      return Objects.consolidate(parts, accRest);
    });
  }, Result.value({}));

  return y.map((yValue) => {
    return Objects.wrap(aspect, yValue);
  });
};

const mergeTypes = {
  classes: concat,
  attributes: safeMerge,
  styles: safeMerge,

  // Group these together somehow
  domChildren: onlyOne,
  defChildren: onlyOne,
  innerHtml: onlyOne,

  value: onlyOne
};

const combine = (info, baseMod, behaviours, base): Result<DomDefinition, any> => {
  // Get the Behaviour DOM modifications
  const behaviourDoms = Merger.deepMerge({ }, baseMod);
  Arr.each(behaviours, (behaviour) => {
    behaviourDoms[behaviour.name()] = behaviour.exhibit(info, base);
  });

  const byAspect = ObjIndex.byInnerKey(behaviourDoms, behaviourDom);
  // byAspect format: { classes: [ { name: Toggling, modification: [ 'selected' ] } ] }

  const usedAspect = Obj.map(byAspect, (values, aspect) => {
    return Arr.bind(values, (value) => {
      return value.modification().fold(() => {
        return [ ];
      }, (v) => {
        return [ value ];
      });
    });
  });

  const modifications = Obj.mapToArray(usedAspect, (values, aspect) => {
    return Objects.readOptFrom(mergeTypes, aspect).fold(() => {
      return Result.error('Unknown field type: ' + aspect);
    }, (merger) => {
      return merger(values, aspect);
    });
  });

  const consolidated = Objects.consolidate(modifications, {});

  return consolidated.map(DomModification.nu);
};

export {
  combine
};