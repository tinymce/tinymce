import { Fun, Obj, Optional } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { nuState } from '../common/BehaviourState';
import { CouplingConfig, CouplingState } from './CouplingTypes';

// Unfortunately, the Coupling APIs currently throw errors when the coupled name
// is not recognised. This is because if the wrong name is used, it is a
// non-recoverable error, and the developer should be notified. However, there are
// better ways to do this: (removing this API and only returning Optionals/Results)
const init = (): CouplingState => {
  const coupled: Record<string, AlloyComponent> = { };

  const lookupCoupled = (coupleConfig: CouplingConfig, coupledName: string): Optional<AlloyComponent> => {
    const available = Obj.keys(coupleConfig.others);
    if (available.length === 0) {
      throw new Error('Cannot find any known coupled components');
    } else {
      return Obj.get<any, string>(coupled, coupledName);
    }
  };

  const getOrCreate = (component: AlloyComponent, coupleConfig: CouplingConfig, name: string): AlloyComponent => {
    return lookupCoupled(coupleConfig, name).getOrThunk(() => {
      // TODO: TINY-9014 Likely type error. coupleConfig.others[key] is
      // `() => ((comp: AlloyComponent) => AlloySpec)`,
      // but builder is being treated as a `(comp: AlloyComponent) => AlloySpec`
      const builder = Obj.get<any, string>(coupleConfig.others, name).getOrDie(
        'No information found for coupled component: ' + name
      );
      const spec = builder(component);
      const built = component.getSystem().build(spec);
      coupled[name] = built;
      return built;
    });
  };

  const getExisting = (component: AlloyComponent, coupleConfig: CouplingConfig, name: string): Optional<AlloyComponent> => {
    return lookupCoupled(coupleConfig, name).orThunk(() => {
      // Validate we recognise this coupled component's name.
      Obj.get<any, string>(coupleConfig.others, name).getOrDie(
        'No information found for coupled component: ' + name
      );

      // It's a valid name, so return None, because it hasn't been built yet.
      return Optional.none();
    });
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
