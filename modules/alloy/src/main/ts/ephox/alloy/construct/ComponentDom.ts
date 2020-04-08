import { Arr, Option } from '@ephox/katamari';

import * as ObjIndex from '../alien/ObjIndex';
import { AlloyBehaviour } from '../api/behaviour/Behaviour';
import { BehaviourConfigAndState } from '../behaviour/common/BehaviourBlob';
import { BehaviourState } from '../behaviour/common/BehaviourState';
import { DomDefinitionDetail } from '../dom/DomDefinition';
import { DomModification, nu as NuModification } from '../dom/DomModification';

interface Modification<T> {
  name: string;
  modification: T;
}

type DomModificationAspectRecord = { [K in keyof DomModification]: Array<Modification<DomModification[K]>> };

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
  type DomModificationRecord = { [K in keyof DomModification]: DomModification[K] };

  // Clone the object so we can change it.
  const modsByBehaviour: Record<BehaviourName, DomModificationRecord> = { ...baseMod };
  Arr.each(behaviours, (behaviour) => {
    modsByBehaviour[behaviour.name()] = behaviour.exhibit(info, base);
  });

  // byAspect format: { classes: [ { name: Toggling, modification: [ 'selected' ] } ] }
  const byAspect = ObjIndex.byInnerKey(modsByBehaviour, (name, modification) => ({ name, modification })) as DomModificationAspectRecord;

  const combineObjects = <T extends Record<string, any>>(objects: Array<Modification<T>>): T => Arr.foldr(objects, (b, a) => ({ ...a.modification, ...b }), { } as T);

  const combinedClasses = Arr.foldr(byAspect.classes, (b: string[], a) => a.modification.concat(b), [ ]);
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
