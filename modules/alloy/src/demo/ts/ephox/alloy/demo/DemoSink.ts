import { Fun } from '@ephox/katamari';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Positioning } from 'ephox/alloy/api/behaviour/Positioning';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';

const make = (): AlloyComponent => GuiFactory.build(
  Container.sketch({
    containerBehaviours: Behaviour.derive([
      Positioning.config({
        useFixed: Fun.always
      })
    ])
  })
);

export {
  make
};
