import { Objects } from '@ephox/boulder';
import { Arr, Fun, Merger, Obj, Result, Option } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';

import * as ObjIndex from '../alien/ObjIndex';
import { DomModification, nu as NuModification } from '../dom/DomModification';
import { DomDefinitionDetail } from '../dom/DomDefinition';
import { CustomDetail } from 'ephox/alloy/construct/CustomDefinition';
import { AlloyBehaviour } from 'ephox/alloy/api/behaviour/Behaviour';
import { BehaviourConfigAndState } from 'ephox/alloy/behaviour/common/BehaviourBlob';
import { BehaviourState } from 'ephox/alloy/api/Main';

type ModificationChain = Array<{ name(): string, modification(): Option<any> }>;

const concat = (chain: ModificationChain, aspect: string): Result<Record<string, any[]>, Error> => {
  const values: any[] = Arr.bind(chain, (c) => {
    return c.modification().getOr([ ]);
  });
  return Result.value(
    Objects.wrap(aspect, values)
  );
};

const onlyOne = (chain: ModificationChain, aspect: string) => {
  if (chain.length > 1) {
    return Result.error(
    'Multiple behaviours have tried to change DOM "' + aspect + '". The guilty behaviours are: ' +
      Json.stringify(Arr.map(chain, (b) => { return b.name(); })) + '. At this stage, this ' +
      'is not supported. Future releases might provide strategies for resolving this.'
    );
  } else if (chain.length === 0) {
    return Result.value({ });
  } else {
    return Result.value(
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

const safeMerge = (chain: Array<{name: string, modification(): Option<any>}>, aspect: string) => {
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

// Based on all the behaviour exhibits, and the original dom modification, identify
// the overall combined dom modification that needs to occur
const combine = (
  info: Record<string, () => Option<BehaviourConfigAndState<any, BehaviourState>>>,
  baseMod: Record<string, DomModification>,
  behaviours: AlloyBehaviour[],
  base: DomDefinitionDetail
): Result<DomModification, string> => {
  // Collect all the DOM modifications, indexed by behaviour name (and base for base)
  const modsByBehaviour: Record<string, DomModification> = Merger.deepMerge({ }, baseMod);
  Arr.each(behaviours, (behaviour: AlloyBehaviour) => {
    modsByBehaviour[behaviour.name()] = behaviour.exhibit(info, base);
  });

  const nameAndMod = (name: string, modification: DomModification) => {
    return {
      name: () => name,
      modification
    };
  };

  // byAspect format: { classes: [ { name: Toggling, modification: [ 'selected' ] } ] }
  const byAspect = ObjIndex.byInnerKey<any, any>(modsByBehaviour, nameAndMod) as Record<
    string,
    Array<{ name: string, modification(): Option<any> }>
  >;

  const usedAspect = Obj.map(byAspect, (values: Array<{name: string, modification(): Option<any>}>, aspect: string) => {
    return Arr.bind(values, (value) => {
      return value.modification().fold(() => {
        return [ ];
      }, (v) => {
        return [ value ];
      });
    });
  }) as Record<
    string,
    Array<{name: string, modification(): Option<any>}>
  >;

  const modifications = Obj.mapToArray(usedAspect, (values: Array<{name: string, modification(): any}>, aspect: string) => {
    return Objects.readOptFrom(mergeTypes, aspect).fold(() => {
      return Result.error('Unknown field type: ' + aspect);
    }, (merger) => {
      return merger(values, aspect);
    });
  }) as Array<Result<{}, string>>;

  const consolidated: Result<{}, string> = Objects.consolidate(modifications as any, {});

  return consolidated.map(NuModification);
};

export {
  combine
};