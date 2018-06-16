import { Objects } from '@ephox/boulder';
import { Fun, Obj } from '@ephox/katamari';
import { JSON } from '@ephox/sand';
import { CouplingConfig } from './CouplingTypes';
import { BehaviourState, nuState } from '../common/BehaviourState';
import { AlloyComponent } from '../../api/component/ComponentApi';

const init = (spec) => {
  console.log('reinitialising');
  console.trace();
  const coupled = { };

  const getOrCreate = (component: AlloyComponent, coupleConfig: CouplingConfig, name: string): AlloyComponent => {
    console.log('reading coupled', coupled);
    const available = Obj.keys(coupleConfig.others());
    if (! available) { throw new Error('Cannot find coupled component: ' + name + '. Known coupled components: ' + JSON.stringify(available, null, 2)); } else { return Objects.readOptFrom(coupled, name).getOrThunk(() => {
      const builder = Objects.readOptFrom(coupleConfig.others(), name).getOrDie(
        'No information found for coupled component: ' + name
      );
      const spec = builder()(component);
      const built = component.getSystem().build(spec);
      coupled[name] = built;
      console.log('coupled', name, coupled);
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

export default <any> {
  init
};