import { Objects } from '@ephox/boulder';
import { Fun, Obj } from '@ephox/katamari';
import { JSON } from '@ephox/sand';
import { CouplingConfigSpec, CouplingConfig } from './CouplingTypes';
import { BehaviourState, nuState, BehaviourStateInitialiser } from '../common/BehaviourState';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec } from '../../api/component/SpecTypes';

const init = (spec: CouplingConfigSpec) => {
  const coupled = { };

  const getOrCreate = (component: AlloyComponent, coupleConfig: CouplingConfig, name: string): AlloyComponent => {
    const available = Obj.keys(coupleConfig.others);
    if (! available) {
      throw new Error('Cannot find coupled component: ' + name + '. Known coupled components: ' + JSON.stringify(available, null, 2));
    } else {
      return Objects.readOptFrom<AlloyComponent>(coupled, name).getOrThunk(() => {
      const builder = Objects.readOptFrom<(comp) => AlloySpec>(coupleConfig.others, name).getOrDie(
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

  const readState = Fun.constant({ });

  return nuState({
    readState,
    getOrCreate
  });
};

export {
  init
};