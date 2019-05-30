
export default function (turnOff: () => void, turnOn: () => void, initial: boolean) {
  let active = initial || false;

  const on = function () {
    turnOn();
    active = true;
  };

  const off = function () {
    turnOff();
    active = false;
  };

  const toggle = function () {
    const f = active ? off : on;
    f();
  };

  const isOn = function () {
    return active;
  };

  return {
    on,
    off,
    toggle,
    isOn
  };
}