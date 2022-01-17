import { Cell, Fun } from '@ephox/katamari';
import { EventArgs, SugarElement } from '@ephox/sugar';

export interface EventFormat {
  readonly target: SugarElement<Node>;
  readonly kill: () => void;
  readonly prevent: () => void;
}

export interface SimulatedEvent<T extends EventFormat> {
  readonly stop: () => void;
  readonly cut: () => void;
  readonly isStopped: () => boolean;
  readonly isCut: () => boolean;
  readonly event: T;

  readonly getSource: () => SugarElement<Node>;
  readonly setSource: (elem: SugarElement<Node>) => void;
}

export type NativeSimulatedEvent<T = Event> = SimulatedEvent<EventArgs<T>>;
export type CustomSimulatedEvent = SimulatedEvent<CustomEvent>;

export interface CustomEvent extends EventFormat {
  // General properties on a custom event.
  // TODO: Maybe separate them from target and kill to allow for overlap?
  readonly [key: string]: any;
}

export interface ReceivingUniversalInternalEvent {
  readonly universal: true;
  readonly data: any;
}

export interface ReceivingChannelsInternalEvent {
  readonly universal: false;
  readonly channels: ReadonlyArray<string>;
  readonly data: any;
}

export type ReceivingInternalEvent = ReceivingUniversalInternalEvent | ReceivingChannelsInternalEvent;

export interface ReceivingEvent extends EventFormat {
  readonly data: any;
}

export interface FocusingEvent extends EventFormat {
  readonly originator: SugarElement<Node>;
}

const fromSource = <T extends EventFormat>(event: T, source: Cell<SugarElement<Node>>): SimulatedEvent<T> => {
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
    event,
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
    isCut: Fun.never,
    event,
    // Nor do targets really
    setSource: Fun.die('Cannot set source of a broadcasted event'),
    getSource: Fun.die('Cannot get source of a broadcasted event')
  };
};

const fromTarget = <T extends EventFormat>(event: T, target: SugarElement<Node>): SimulatedEvent<T> => {
  const source = Cell(target);
  return fromSource(event, source);
};

export {
  fromSource,
  fromExternal,
  fromTarget
};
