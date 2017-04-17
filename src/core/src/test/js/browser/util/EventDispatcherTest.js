asynctest(
  'browser.tinymce.core.util.EventDispatcherTest',
  [
    'ephox.mcagar.api.LegacyUnit',
    'ephox.agar.api.Pipeline',
    'tinymce.core.util.EventDispatcher'
  ],
  function (LegacyUnit, Pipeline, EventDispatcher) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    suite.test("fire (no event listeners)", function () {
      var dispatcher = new EventDispatcher(), args;

      args = dispatcher.fire('click', { test: 1 });
      LegacyUnit.equal(args.test, 1);
      LegacyUnit.equal(args.isDefaultPrevented(), false);
      LegacyUnit.equal(args.isPropagationStopped(), false);
      LegacyUnit.equal(args.isImmediatePropagationStopped(), false);
      LegacyUnit.equal(args.target, dispatcher);

      args = dispatcher.fire('click');
      LegacyUnit.equal(args.isDefaultPrevented(), false);
      LegacyUnit.equal(args.isPropagationStopped(), false);
      LegacyUnit.equal(args.isImmediatePropagationStopped(), false);
    });

    suite.test("fire (event listeners)", function () {
      var dispatcher = new EventDispatcher(), data = '';

      dispatcher.on('click', function () {
        data += 'a';
      });
      dispatcher.on('click', function () {
        data += 'b';
      });

      dispatcher.fire('click', { test: 1 });
      LegacyUnit.equal(data, 'ab');
    });

    suite.test("fire (event listeners) stopImmediatePropagation", function () {
      var dispatcher = new EventDispatcher(), data = '';

      dispatcher.on('click', function (e) {
        data += 'a'; e.stopImmediatePropagation();
      });
      dispatcher.on('click', function () {
        data += 'b';
      });

      dispatcher.fire('click', { test: 1 });
      LegacyUnit.equal(data, 'a');
    });

    suite.test("on", function () {
      var dispatcher = new EventDispatcher(), data = '';

      LegacyUnit.equal(dispatcher.on('click', function () {
        data += 'a';
      }), dispatcher);
      LegacyUnit.equal(dispatcher.on('click keydown', function () {
        data += 'b';
      }), dispatcher);

      dispatcher.fire('click');
      LegacyUnit.equal(data, 'ab');

      dispatcher.fire('keydown');
      LegacyUnit.equal(data, 'abb');
    });

    suite.test("on (prepend)", function () {
      var dispatcher = new EventDispatcher(), data = '';

      LegacyUnit.equal(dispatcher.on('click', function () {
        data += 'a';
      }), dispatcher);
      LegacyUnit.equal(dispatcher.on('click', function () {
        data += 'b';
      }, true), dispatcher);

      dispatcher.fire('click');
      LegacyUnit.equal(data, 'ba');
    });

    suite.test("once", function () {
      var dispatcher = new EventDispatcher(), data = '';

      LegacyUnit.equal(dispatcher.on('click', function () {
        data += 'a';
      }), dispatcher);
      LegacyUnit.equal(dispatcher.once('click', function () {
        data += 'b';
      }), dispatcher);
      LegacyUnit.equal(dispatcher.on('click', function () {
        data += 'c';
      }), dispatcher);

      dispatcher.fire('click');
      LegacyUnit.equal(data, 'abc');

      dispatcher.fire('click');
      LegacyUnit.equal(data, 'abcac');
    });

    suite.test("once (prepend)", function () {
      var dispatcher = new EventDispatcher(), data = '';

      LegacyUnit.equal(dispatcher.on('click', function () {
        data += 'a';
      }), dispatcher);
      LegacyUnit.equal(dispatcher.once('click', function () {
        data += 'b';
      }, true), dispatcher);
      LegacyUnit.equal(dispatcher.on('click', function () {
        data += 'c';
      }), dispatcher);

      dispatcher.fire('click');
      LegacyUnit.equal(data, 'bac');

      dispatcher.fire('click');
      LegacyUnit.equal(data, 'bacac');
    });

    suite.test("once (unbind)", function () {
      var dispatcher = new EventDispatcher(), data = '';

      var handler = function () {
        data += 'b';
      };

      dispatcher.once('click', function () {
        data += 'a';
      });
      dispatcher.once('click', handler);
      dispatcher.off('click', handler);

      dispatcher.fire('click');
      LegacyUnit.equal(data, 'a');
    });

    suite.test("once (multiple events)", function () {
      var dispatcher = new EventDispatcher(), data = '';

      dispatcher.once('click', function () {
        data += 'a';
      });
      dispatcher.once('keydown', function () {
        data += 'b';
      });

      dispatcher.fire('click');
      LegacyUnit.equal(data, 'a');

      dispatcher.fire('keydown');
      LegacyUnit.equal(data, 'ab');

      dispatcher.fire('click');
      dispatcher.fire('keydown');

      LegacyUnit.equal(data, 'ab');
    });

    suite.test("off (all)", function () {
      var dispatcher = new EventDispatcher(), data = '';

      var listenerA = function () {
        data += 'a';
      };
      var listenerB = function () {
        data += 'b';
      };
      var listenerC = function () {
        data += 'c';
      };

      dispatcher.on('click', listenerA);
      dispatcher.on('click', listenerB);
      dispatcher.on('keydown', listenerC);

      dispatcher.off();

      data = '';
      dispatcher.fire('click');
      dispatcher.fire('keydown');
      LegacyUnit.equal(data, '');
    });

    suite.test("off (all named)", function () {
      var dispatcher = new EventDispatcher(), data = '';

      var listenerA = function () {
        data += 'a';
      };
      var listenerB = function () {
        data += 'b';
      };
      var listenerC = function () {
        data += 'c';
      };

      dispatcher.on('click', listenerA);
      dispatcher.on('click', listenerB);
      dispatcher.on('keydown', listenerC);

      dispatcher.off('click');

      data = '';
      dispatcher.fire('click');
      dispatcher.fire('keydown');
      LegacyUnit.equal(data, 'c');
    });

    suite.test("off (all specific observer)", function () {
      var dispatcher = new EventDispatcher(), data = '';

      var listenerA = function () {
        data += 'a';
      };
      var listenerB = function () {
        data += 'b';
      };

      dispatcher.on('click', listenerA);
      dispatcher.on('click', listenerB);
      dispatcher.off('click', listenerB);

      data = '';
      dispatcher.fire('click');
      LegacyUnit.equal(data, 'a');
    });

    suite.test("scope setting", function () {
      var lastScope, lastEvent, dispatcher;

      dispatcher = new EventDispatcher();
      dispatcher.on('click', function () {
        // eslint-disable-next-line consistent-this
        lastScope = this;
      }).fire('click');
      LegacyUnit.equal(dispatcher, lastScope);

      var scope = { test: 1 };
      dispatcher = new EventDispatcher({ scope: scope });
      dispatcher.on('click', function (e) {
        // eslint-disable-next-line consistent-this
        lastScope = this;
        lastEvent = e;
      }).fire('click');
      LegacyUnit.equal(scope, lastScope);
      LegacyUnit.equal(lastEvent.target, lastScope);
    });

    suite.test("beforeFire setting", function () {
      var lastArgs, dispatcher, args;

      dispatcher = new EventDispatcher({
        beforeFire: function (args) {
          lastArgs = args;
        }
      });

      args = dispatcher.fire('click');
      LegacyUnit.equal(lastArgs === args, true);
    });

    suite.test("beforeFire setting (stopImmediatePropagation)", function () {
      var lastArgs, dispatcher, args, data = '';

      dispatcher = new EventDispatcher({
        beforeFire: function (args) {
          lastArgs = args;
          args.stopImmediatePropagation();
        }
      });

      var listenerA = function () {
        data += 'a';
      };

      dispatcher.on('click', listenerA);
      args = dispatcher.fire('click');
      LegacyUnit.equal(lastArgs === args, true);
      LegacyUnit.equal(data, '');
    });

    suite.test("toggleEvent setting", function () {
      var lastName, lastState, dispatcher;

      dispatcher = new EventDispatcher({
        toggleEvent: function (name, state) {
          lastName = name;
          lastState = state;
        }
      });

      var listenerA = function () {
      };
      var listenerB = function () {
      };

      dispatcher.on('click', listenerA);
      LegacyUnit.equal(lastName, 'click');
      LegacyUnit.equal(lastState, true);

      lastName = lastState = null;
      dispatcher.on('click', listenerB);
      LegacyUnit.equal(lastName, null);
      LegacyUnit.equal(lastState, null);

      dispatcher.off('click', listenerA);
      LegacyUnit.equal(lastName, null);
      LegacyUnit.equal(lastState, null);

      dispatcher.off('click', listenerB);
      LegacyUnit.equal(lastName, 'click');
      LegacyUnit.equal(lastState, false);
    });

    Pipeline.async({}, suite.toSteps({}), function () {
      success();
    }, failure);
  }
);