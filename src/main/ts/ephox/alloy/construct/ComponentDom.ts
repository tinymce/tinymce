import { Objects } from '@ephox/boulder';
import { Arr, Fun, Merger, Obj, Result } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';

import * as ObjIndex from '../alien/ObjIndex';
import DomModification from '../dom/DomModification';

const behaviourDom = function (name, modification) {
  return {
    name: Fun.constant(name),
    modification
  };
};

const concat = function (chain, aspect) {
  const values = Arr.bind(chain, function (c) {
    return c.modification().getOr([ ]);
  });
  return Result.value(
    Objects.wrap(aspect, values)
  );
};

const onlyOne = function (chain, aspect, order) {
  if (chain.length > 1) { return Result.error(
    'Multiple behaviours have tried to change DOM "' + aspect + '". The guilty behaviours are: ' +
      Json.stringify(Arr.map(chain, function (b) { return b.name(); })) + '. At this stage, this ' +
      'is not supported. Future releases might provide strategies for resolving this.'
  );
  } else if (chain.length === 0) { return Result.value({ }); } else { return Result.value(
    chain[0].modification().fold(function () {
      return { };
    }, function (m) {
      return Objects.wrap(aspect, m);
    })
  );
       }
};

const duplicate = function (aspect, k, obj, behaviours) {
  return Result.error('Mulitple behaviours have tried to change the _' + k + '_ "' + aspect + '"' +
    '. The guilty behaviours are: ' + Json.stringify(Arr.bind(behaviours, function (b) {
      return b.modification().getOr({})[k] !== undefined ? [ b.name() ] : [ ];
    }), null, 2) + '. This is not currently supported.'
  );
};

const safeMerge = function (chain, aspect) {
  // return unsafeMerge(chain, aspect);
  const y = Arr.foldl(chain, function (acc, c) {
    const obj = c.modification().getOr({});
    return acc.bind(function (accRest) {
      const parts = Obj.mapToArray(obj, function (v, k) {
        return accRest[k] !== undefined ? duplicate(aspect, k, obj, chain) :
          Result.value(Objects.wrap(k, v));
      });
      return Objects.consolidate(parts, accRest);
    });
  }, Result.value({}));

  return y.map(function (yValue) {
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

const combine = function (info, baseMod, behaviours, base) {
  // Get the Behaviour DOM modifications
  const behaviourDoms = Merger.deepMerge({ }, baseMod);
  Arr.each(behaviours, function (behaviour) {
    behaviourDoms[behaviour.name()] = behaviour.exhibit(info, base);
  });

  const byAspect = ObjIndex.byInnerKey(behaviourDoms, behaviourDom);
  // byAspect format: { classes: [ { name: Toggling, modification: [ 'selected' ] } ] }

  const usedAspect = Obj.map(byAspect, function (values, aspect) {
    return Arr.bind(values, function (value) {
      return value.modification().fold(function () {
        return [ ];
      }, function (v) {
        return [ value ];
      });
    });
  });

  const modifications = Obj.mapToArray(usedAspect, function (values, aspect) {
    return Objects.readOptFrom(mergeTypes, aspect).fold(function () {
      return Result.error('Unknown field type: ' + aspect);
    }, function (merger) {
      return merger(values, aspect);
    });
  });

  const consolidated = Objects.consolidate(modifications, {});

  return consolidated.map(DomModification.nu);
};

export {
  combine
};