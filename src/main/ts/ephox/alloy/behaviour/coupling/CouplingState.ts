import { Objects } from '@ephox/boulder';
import { Fun, Obj } from '@ephox/katamari';
import { JSON } from '@ephox/sand';
import { CouplingConfig } from './CouplingTypes';
import BehaviourState from '../common/BehaviourState';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

const init = function (spec) {
  const coupled = { };

  const getOrCreate = function (component: AlloyComponent, coupleConfig: CouplingConfig, name: string): AlloyComponent {
    const available = Obj.keys(coupleConfig.others());
    if (! available) { throw new Error('Cannot find coupled component: ' + name + '. Known coupled components: ' + JSON.stringify(available, null, 2)); } else { return Objects.readOptFrom(coupled, name).getOrThunk(function () {
      const builder = Objects.readOptFrom(coupleConfig.others(), name).getOrDie(
        'No information found for coupled component: ' + name
      );
      const spec = builder()(component);
      const built = component.getSystem().build(spec);
      coupled[name] = built;
      return built;
    });
    }
  };

  const readState = Fun.constant({ });

  return BehaviourState({
    readState,
    getOrCreate
  });
};

export default <any> {
  init
};