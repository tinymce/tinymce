import { AlloyComponent } from '../../../../../main/ts/ephox/alloy/api/component/ComponentApi';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Positioning } from 'ephox/alloy/api/behaviour/Positioning';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';

const make = () => {
  return GuiFactory.build(
    Container.sketch({
      containerBehaviours: Behaviour.derive([
        Positioning.config({
          useFixed: true
        })
      ])
    })
  );
};

export {
  make
};