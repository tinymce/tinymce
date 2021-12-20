import { after, before } from '@ephox/bedrock-client';
import { Fun, Optional } from '@ephox/katamari';
import { Compare, PredicateExists, SugarElement } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Positioning } from 'ephox/alloy/api/behaviour/Positioning';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';

interface Sinks {
  readonly fixed: () => AlloyComponent;
  readonly relative: () => AlloyComponent;
  readonly popup: () => AlloyComponent;
}

const fixedSink = (): AlloyComponent => GuiFactory.build(
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

const relativeSink = (): AlloyComponent => GuiFactory.build(
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

const popup = (): AlloyComponent => GuiFactory.build(
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

const isInside = (sinkComponent: AlloyComponent, popupComponent: AlloyComponent): boolean => {
  const isSink = (el: SugarElement<Node>) => Compare.eq(el, sinkComponent.element);

  return PredicateExists.closest(popupComponent.element, isSink);
};

const bddSetup = (): Sinks => {
  let fixed: Optional<AlloyComponent>;
  let relative: Optional<AlloyComponent>;
  let pop: Optional<AlloyComponent>;

  before(() => {
    fixed = Optional.some(fixedSink());
    relative = Optional.some(relativeSink());
    pop = Optional.some(popup());
  });

  after(() => {
    fixed = relative = pop = Optional.none();
  });

  return {
    fixed: () => fixed.getOrDie('Fixed sink not initialized'),
    relative: () => relative.getOrDie('Relative sink not initialized'),
    popup: () => pop.getOrDie('Popup not initialized')
  };
};

export {
  fixedSink,
  isInside,
  relativeSink,
  popup,
  bddSetup
};
