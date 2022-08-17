import { Fun, Obj, Optional } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { nuState } from '../common/BehaviourState';
import { CouplingConfig, CouplingState } from './CouplingTypes';

// Unfortunately, the Coupling APIs currently throw errors when the coupled name
// is not recognised. This is because that if the wrong name is used, it is a
// non-recoverable error, and the developer should be notified. However, there are
// better ways to do this.
const init = (): CouplingState => {
  const coupled: Record<string, AlloyComponent> = { };

  const getOrCreate = (component: AlloyComponent, coupleConfig: CouplingConfig, name: string): AlloyComponent => {
    // These are the situations:
    // 1. If we don't have any coupling configuration of any kind, then Error
    // 2. If we already have a built coupled component, return it
    // 3. If we haven't already built the coupled component, and we don't recognise its name,
    // then Error
    // 4. If we haven't already built the coupled component, but we *do* recognise its name
    // then build it and return it.
    const available = Obj.keys(coupleConfig.others);
    if (!available || available.length === 0) {
      throw new Error('Cannot find any known coupled components');
    } else {
      // TODO: Likely type error. coupleConfig.others[key] is `() => ((comp: AlloyComponent) => AlloySpec)`, but builder is being treated as a `(comp: AlloyComponent) => AlloySpec`
      return Obj.get<any, string>(coupled, name).getOrThunk(() => {
        const builder = Obj.get<any, string>(coupleConfig.others, name).getOrDie(
          'No information found for coupled component: ' + name
        );
        const spec = builder(component);
        const built = component.getSystem().build(spec);
        coupled[name] = built;
        return built;
      });
    }
  };

  const getExisting = (component: AlloyComponent, coupleConfig: CouplingConfig, name: string): Optional<AlloyComponent> => {
    // These are the situations:
    // 1. If we don't have any coupling configuration of any kind, then Error
    // 2. If we already have a built coupled component, return it
    // 3. If we haven't already built the coupled component, and we don't recognise its name,
    // then Error
    // 4. If we haven't already built the coupled component, but we *do* recognise its name
    // then return Optional.none
    const available = Obj.keys(coupleConfig.others);
    if (!available || available.length === 0) {
      throw new Error('Cannot find any known coupled components');
    } else {
      return Obj.get<any, string>(coupled, name).orThunk(() => {
        // Validate we recognise this coupled component's name.
        Obj.get<any, string>(coupleConfig.others, name).getOrDie(
          'No information found for coupled component: ' + name
        );

        // It's a valid name, so return None, because it hasn't been built yet.
        return Optional.none();
      });
    }
  };

  const readState = Fun.constant({ });

  return nuState({
    readState,
    getExisting,
    getOrCreate
  });
};

export {
  init
};
