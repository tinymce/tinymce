export default (turnOff: () => void, turnOn: () => void, initial: boolean) => {
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
