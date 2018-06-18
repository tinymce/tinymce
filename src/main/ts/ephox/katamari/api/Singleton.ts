import { Option } from './Option';
import { Cell } from './Cell';

var revocable = function <T> (doRevoke: (data: T) => void) {
  var subject = Cell(Option.none<T>());

  var revoke = function () {
    subject.get().each(doRevoke);
  };

  var clear = function () {
    revoke();
    subject.set(Option.none());
  };

  var set = function (s: T) {
    revoke();
    subject.set(Option.some(s));
  };

  var isSet = function () {
    return subject.get().isSome();
  };

  return {
    clear: clear,
    isSet: isSet,
    set: set
  };
};

var destroyable = function <T extends { destroy: () => void; }> () {
  return revocable<T>(function (s) {
    s.destroy();
  });
};

var unbindable = function <T extends { unbind: () => void; }> () {
  return revocable<T>(function (s) {
    s.unbind();
  });
};

var api = function <T extends { destroy: () => void; }> () {
  var subject = Cell(Option.none<T>());

  var revoke = function () {
    subject.get().each(function (s) {
      s.destroy();
    });
  };

  var clear = function () {
    revoke();
    subject.set(Option.none());
  };

  var set = function (s: T) {
    revoke();
    subject.set(Option.some(s));
  };

  var run = function (f: (data: T) => void) {
    subject.get().each(f);
  };

  var isSet = function () {
    return subject.get().isSome();
  };

  return {
    clear: clear,
    isSet: isSet,
    set: set,
    run: run
  };
};

var value = function <T> () {
  var subject = Cell(Option.none<T>());

  var clear = function () {
    subject.set(Option.none());
  };

  var set = function (s: T) {
    subject.set(Option.some(s));
  };

  var on = function (f: (data: T) => void) {
    subject.get().each(f);
  };

  var isSet = function () {
    return subject.get().isSome();
  };

  return {
    clear: clear,
    set: set,
    isSet: isSet,
    on: on
  };
};

export default {
  destroyable: destroyable,
  unbindable: unbindable,
  api: api,
  value: value
};