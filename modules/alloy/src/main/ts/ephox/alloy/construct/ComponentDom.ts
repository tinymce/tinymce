import { Arr, Option } from '@ephox/katamari';

import * as ObjIndex from '../alien/ObjIndex';
import { AlloyBehaviour } from '../api/behaviour/Behaviour';
import { BehaviourConfigAndState } from '../behaviour/common/BehaviourBlob';
import { BehaviourState } from '../behaviour/common/BehaviourState';
import { DomDefinitionDetail } from '../dom/DomDefinition';
import { DomModification, nu as NuModification } from '../dom/DomModification';

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
  const modsByBehaviour: Record<BehaviourName, DomModification> = { ...baseMod };
  Arr.each(behaviours, (behaviour: AlloyBehaviour<any, any>) => {
    modsByBehaviour[behaviour.name()] = behaviour.exhibit(info, base);
  });

  const nameAndMod = (name: BehaviourName, modification: ModificationEffect) => {
    return {
      name,
      modification
    };
  };

  // byAspect format: { classes: [ { name: Toggling, modification: [ 'selected' ] } ] }
  const byAspect = ObjIndex.byInnerKey<any, any>(modsByBehaviour, nameAndMod) as Record<
    ModificationName,
    Array<{ name: BehaviourName, modification: ModificationEffect }>
  >;

  const combineObjects = (objects: Array<Record<any, any>>) => Arr.foldr(objects, (b, a: { modification: Record<string, string> }) => {
    return { ...a.modification, ...b };
  }, { });

  const combinedClasses: string[] = Arr.foldr(byAspect.classes, (b, a: { modification: string[] }) => {
    return a.modification.concat(b);
  }, [ ]);
  const combinedAttributes: Record<string, string> = combineObjects(byAspect.attributes);
  const combinedStyles: Record<string, string> = combineObjects(byAspect.styles);

  return NuModification({
    classes: combinedClasses,
    attributes: combinedAttributes,
    styles: combinedStyles
  });
};

export {
  combine
};
