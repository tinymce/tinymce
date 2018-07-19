import { Cell, Fun } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

import { SugarEvent } from '../alien/TypeDefinitions';
import { Event } from '@ephox/dom-globals';

export interface EventFormat {
  target: () => Element;
  kill: () => void;
  prevent: () => void;
}

export interface SimulatedEvent<T extends EventFormat> {
  stop: () => void;
  cut: () => void;
  isStopped: () => boolean;
  isCut: () => boolean;
  event: () => T;

  getSource: () => Element;
  setSource: (elem: Element) => void;
}

export type NativeSimulatedEvent = SimulatedEvent<SugarEvent>;
export type CustomSimulatedEvent = SimulatedEvent<CustomEvent>;

export interface CustomEvent extends EventFormat {
  // General properties on a custom event.
  // TODO: Maybe separate them from target and kill to allow for overlap?
  [key: string]: () => any;
}

export interface ReceivingInternalEvent extends EventFormat {
  channels: () => string[];
}

export interface ReceivingEvent extends EventFormat {
  data: () => any;
}

export interface FocusingEvent extends EventFormat {
  originator: () => Element;
}

const fromSource = <T extends EventFormat>(event: T, source: Cell<Element>): SimulatedEvent<T> => {
  const stopper = Cell(false);

  const cutter = Cell(false);

  const stop = () => {
    stopper.set(true);
  };

  const cut = () => {
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
const fromExternal = <T extends EventFormat>(event: T): SimulatedEvent<T> => {
  const stopper = Cell(false);

  const stop = () => {
    stopper.set(true);
  };

  return {
    stop,
    cut: Fun.noop, // cutting has no meaning for a broadcasted event
    isStopped: stopper.get,
    isCut: Fun.constant(false),
    event: Fun.constant(event),
    // Nor do targets really
    setSource: Fun.die('Cannot set source of a broadcasted event'),
    getSource: Fun.die('Cannot get source of a broadcasted event')
  };
};

const fromTarget = <T extends EventFormat>(event: T, target: Element): SimulatedEvent<T> => {
  const source = Cell(target);
  return fromSource(event, source);
};

export {
  fromSource,
  fromExternal,
  fromTarget
};