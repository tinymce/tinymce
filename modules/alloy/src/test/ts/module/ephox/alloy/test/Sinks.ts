import { Fun } from '@ephox/katamari';
import { Compare, PredicateExists } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Positioning } from 'ephox/alloy/api/behaviour/Positioning';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';

const fixedSink = () => {
  return GuiFactory.build(
    Container.sketch({
      dom: {
        styles: {
          border: '1px solid green'
        }
      },
      uid: 'fixed-sink',
      containerBehaviours: Behaviour.derive([
        Positioning.config({
          useFixed: Fun.always
        })
      ])
    })
  );
};

const relativeSink = () => {
  return GuiFactory.build(
    Container.sketch({
      dom: {
        tag: 'div',
        styles: {
          border: '1px solid blue'
        }
      },
      uid: 'relative-sink',
      containerBehaviours: Behaviour.derive([
        Positioning.config({
          useFixed: Fun.always
        })
      ])
    })
  );
};

const popup = () => {
  return GuiFactory.build(
    Container.sketch({
      dom: {
        innerHtml: 'Demo day',
        styles: {
          width: '200px',
          height: '150px',
          border: 'inherit'
        }
      },
      uid: 'popup'
    })
  );
};

const isInside = (sinkComponent: AlloyComponent, popupComponent: AlloyComponent) => {
  const isSink = (el) => {
    return Compare.eq(el, sinkComponent.element());
  };

  return PredicateExists.closest(popupComponent.element(), isSink);
};

export {
  fixedSink,
  isInside,
  relativeSink,
  popup
};
