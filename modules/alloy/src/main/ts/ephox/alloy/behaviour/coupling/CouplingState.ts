import { Fun, Obj } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { nuState } from '../common/BehaviourState';
import { CouplingConfigSpec, CouplingConfig } from './CouplingTypes';

const init = (spec: CouplingConfigSpec) => {
  const coupled = { };

  const getOrCreate = (component: AlloyComponent, coupleConfig: CouplingConfig, name: string): AlloyComponent => {
    const available = Obj.keys(coupleConfig.others);
    if (! available) {
      throw new Error('Cannot find coupled component: ' + name + '. Known coupled components: ' + JSON.stringify(available, null, 2));
    } else {
      // TODO: Likely type error. coupleConfig.others[key] is `() => ((comp: AlloyComponent) => AlloySpec)`, but builder is being treated as a `(comp: AlloyComponent) => AlloySpec`
      return Obj.get<any, string>(coupled, name).getOrThunk(() => {
      const builder = Obj.get<any, string>(coupleConfig.others, name).getOrDie(
        'No information found for coupled component: ' + name
      );
      const spec = builder(component);
      const built = component.getSystem().build(spec);
      coupled[name] = built;
      // console.log('coupled', name, coupled);
      return built;
    });
    }
  };

  const readState = Fun.constant<any>({ });

  return nuState({
    readState,
    getOrCreate
  });
};

export {
  init
};
