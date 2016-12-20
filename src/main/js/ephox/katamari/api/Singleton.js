define(
  'ephox.katamari.api.Singleton',

  [
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Cell'
  ],

  function (Option, Cell) {
    var revocable = function (doRevoke) {
      var subject = Cell(Option.none());

      var revoke = function () {
        subject.get().each(doRevoke);
      };

      var clear = function () {
        revoke();
        subject.set(Option.none());
      };

      var set = function (s) {
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

    var destroyable = function () {
      return revocable(function (s) {
        s.destroy();
      });
    };

    var unbindable = function () {
      return revocable(function (s) {
        s.unbind();
      });
    };

    var api = function () {
      var subject = Cell(Option.none());

      var revoke = function () {
        subject.get().each(function (s) {
          s.destroy();
        });
      };

      var clear = function () {
        revoke();
        subject.set(Option.none());
      };

      var set = function (s) {
        revoke();
        subject.set(Option.some(s));
      };

      var run = function (f) {
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

    var value = function () {
      var subject = Cell(Option.none());

      var clear = function () {
        subject.set(Option.none());
      };

      var set = function (s) {
        subject.set(Option.some(s));
      };

      var on = function (f) {
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

    return {
      destroyable: destroyable,
      unbindable: unbindable,
      api: api,
      value: value
    };
  }
);