import { Cell, Fun } from '@ephox/katamari';
import { SugarElement, SugarEvent } from 'ephox/alloy/alien/TypeDefinitions';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

export interface SimulatedEvent {
  stop: () => void;
  cut: () => void;
  isStopped: () => boolean;
  isCut: () => boolean;
  event: () => AnyEvent;

  getSource: (element: SugarElement) => AlloyComponent;
  setSource: (element: SugarElement) => void;
}

export type AnyEvent = SimulatedEventTargets | SugarEvent;

export interface SimulatedEventTargets {
  target: () => SugarElement;
  [key: string]: () => any;
}

const fromSource = function (event, source) {
  const stopper = Cell(false);

  const cutter = Cell(false);

  const stop = function () {
    stopper.set(true);
  };

  const cut = function () {
    cutter.set(true);
  };

  return {
    stop,
    cut,
    isStopped: stopper.get,
    isCut: cutter.get,
    event: Fun.constant(event),
    // Used only for tiered menu at the moment. It is an element, not a component
    setSource: source.set,
    getSource: source.get
  };
};

// Events that come from outside of the alloy root (e.g. window scroll)
const fromExternal = function (event) {
  const stopper = Cell(false);

  const stop = function () {
    stopper.set(true);
  };

  return {
    stop,
    cut: Fun.noop, // cutting has no meaning for a broadcasted event
    isStopped: stopper.get,
    isCut: Fun.constant(false),
    event: Fun.constant(event),
    // Nor do targets really
    setTarget: Fun.die('Cannot set target of a broadcasted event'),
    getTarget: Fun.die('Cannot get target of a broadcasted event')
  };
};

const fromTarget = function (event, target) {
  const source = Cell(target);
  return fromSource(event, source);
};

export {
  fromSource,
  fromExternal,
  fromTarget
};