export default (turnOff: () => void, turnOn: () => void, initial: boolean) => {
  let active = initial || false;

  const on = (): void => {
    turnOn();
    active = true;
  };

  const off = (): void => {
    turnOff();
    active = false;
  };

  const toggle = (): void => {
    const f = active ? off : on;
    f();
  };

  const isOn = (): boolean =>
    active;

  return {
    on,
    off,
    toggle,
    isOn
  };
};
