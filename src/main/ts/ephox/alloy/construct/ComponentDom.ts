import { Objects } from '@ephox/boulder';
import { Arr, Merger, Obj, Option, Result } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';

import * as ObjIndex from '../alien/ObjIndex';
import { AlloyBehaviour } from '../api/behaviour/Behaviour';
import { BehaviourConfigAndState } from '../behaviour/common/BehaviourBlob';
import { BehaviourState } from '../behaviour/common/BehaviourState';
import { DomDefinitionDetail } from '../dom/DomDefinition';
import { DomModification, nu as NuModification } from '../dom/DomModification';

type Mergers<K extends keyof DomModification> = Record<K, (a: DomModification[K], b: DomModification[K]) => DomModification[K]>;
const mergers = {
  classes: (as: string[], bs: string[]) => as.concat(bs),
  attributes: (as: Record<string, string>, bs: Record<string, string>) => Merger.deepMerge(as, bs),
  styles: (as: Record<string, string>, bs: Record<string, string>) => Merger.deepMerge(as, bs)
};

// Based on all the behaviour exhibits, and the original dom modification, identify
// the overall combined dom modification that needs to occur
const combine = (
  info: Record<string, () => Option<BehaviourConfigAndState<any, BehaviourState>>>,
  baseMod: Record<string, DomModification>,
  behaviours: Array<AlloyBehaviour<any, any>>,
  base: DomDefinitionDetail
): DomModification => {
  // Collect all the DOM modifications, indexed by behaviour name (and base for base)
  type BehaviourName = string;
  // classes are array of strings, styles and attributes are a record
  type ModificationName = keyof DomModification;
  type ModificationEffect = any;


  // Clone the object so we can change it.
  const modsByBehaviour: Record<BehaviourName, DomModification> = Merger.merge(baseMod);
  Arr.each(behaviours, (behaviour: AlloyBehaviour<any, any>) => {
    modsByBehaviour[behaviour.name()] = behaviour.exhibit(info, base);
  });

  const nameAndMod = (name: BehaviourName, modification: ModificationEffect) => {
    return {
      name,
      modification: modification
    };
  };

  // byAspect format: { classes: [ { name: Toggling, modification: [ 'selected' ] } ] }
  const byAspect = ObjIndex.byInnerKey<any, any>(modsByBehaviour, nameAndMod) as Record<
    ModificationName,
    Array<{ name: BehaviourName, modification: ModificationEffect }>
  >;


  const combineObjects = (objects: Record<any, any>[]) => Arr.foldr(objects, (b, a: { modification: string[] }) => {
    return Merger.deepMerge(a.modification, b);
  }, [ ]);


  const combinedClasses = Arr.foldr(byAspect.classes, (b, a: { modification: string[] }) => {
    return a.modification.concat(b);
  }, [ ]);
  const combinedAttributes = combineObjects(byAspect.attributes);
  const combinedStyles = combineObjects(byAspect.styles);

  return NuModification({
    classes: combinedClasses,
    attributes: combinedAttributes,
    styles: combinedStyles
  });
};

export {
  combine
};