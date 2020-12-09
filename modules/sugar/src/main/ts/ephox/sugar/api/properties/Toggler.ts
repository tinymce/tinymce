export interface Toggler {
  readonly on: () => void;
  readonly off: () => void;
  readonly toggle: () => void;
  readonly isOn: () => boolean;
}

export const Toggler = (turnOff: () => void, turnOn: () => void, initial: boolean): Toggler => {
  let active = initial || false;

  const on = () => {
    turnOn();
    active = true;
  };

  const off = () => {
    turnOff();
    active = false;
  };

  const toggle = () => {
    const f = active ? off : on;
    f();
  };

  const isOn = () => active;

  return {
    on,
    off,
    toggle,
    isOn
  };
};
