

export default function (turnOff: () => void, turnOn: () => void, initial: boolean) {
  var active = initial || false;

  var on = function () {
    turnOn();
    active = true;
  };

  var off = function () {
    turnOff();
    active = false;
  };

  var toggle = function () {
    var f = active ? off : on;
    f();
  };

  var isOn = function () {
    return active;
  };

  return {
    on: on,
    off: off,
    toggle: toggle,
    isOn: isOn
  };
};