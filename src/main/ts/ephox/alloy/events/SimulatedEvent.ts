import { Cell, Fun } from '@ephox/katamari';
import { SugarElement, SugarEvent } from '../alien/TypeDefinitions';
import { AlloyComponent } from '../api/component/ComponentApi';

export interface EventFormat {
  target: () => SugarElement;
  kill: () => void;
  prevent: () => void;
}

export interface SimulatedEvent<T extends EventFormat> {
  stop: () => void;
  cut: () => void;
  isStopped: () => boolean;
  isCut: () => boolean;
  event: () => T;

  getSource: () => SugarElement;
  setSource: (SugarElement) => void;
}

export type NativeSimulatedEvent = SimulatedEvent<SugarEvent>;
export type CustomSimulatedEvent = SimulatedEvent<CustomEvent>;

export interface CustomEvent extends EventFormat {
  // General properties on a custom event.
  // TODO: Maybe separate them from target and kill to allow for overlap?
  [key: string]: () => any;
}

export interface ReceivingEvent extends EventFormat {
  data: () => any;
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