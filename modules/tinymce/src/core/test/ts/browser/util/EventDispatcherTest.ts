import { LegacyUnit } from '@ephox/mcagar';
import { Pipeline } from '@ephox/agar';
import EventDispatcher from 'tinymce/core/api/util/EventDispatcher';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.asynctest('browser.tinymce.core.util.EventDispatcherTest', function (success, failure) {
  const suite = LegacyUnit.createSuite();

  suite.test('fire (no event listeners)', function () {
    const dispatcher = new EventDispatcher();
    let args;

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

  suite.test('fire (event listeners)', function () {
    const dispatcher = new EventDispatcher();
    let data = '';

    dispatcher.on('click', function () {
      data += 'a';
    });
    dispatcher.on('click', function () {
      data += 'b';
    });

    dispatcher.fire('click', { test: 1 });
    LegacyUnit.equal(data, 'ab');
  });

  suite.test('fire (event listeners) stopImmediatePropagation', function () {
    const dispatcher = new EventDispatcher();
    let data = '';

    dispatcher.on('click', function (e) {
      data += 'a'; e.stopImmediatePropagation();
    });
    dispatcher.on('click', function () {
      data += 'b';
    });

    dispatcher.fire('click', { test: 1 });
    LegacyUnit.equal(data, 'a');
  });

  suite.test('on', function () {
    const dispatcher = new EventDispatcher();
    let data = '';

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

  suite.test('on (prepend)', function () {
    const dispatcher = new EventDispatcher();
    let data = '';

    LegacyUnit.equal(dispatcher.on('click', function () {
      data += 'a';
    }), dispatcher);
    LegacyUnit.equal(dispatcher.on('click', function () {
      data += 'b';
    }, true), dispatcher);

    dispatcher.fire('click');
    LegacyUnit.equal(data, 'ba');
  });

  suite.test('once', function () {
    const dispatcher = new EventDispatcher();
    let data = '';

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

  suite.test('once (prepend)', function () {
    const dispatcher = new EventDispatcher();
    let data = '';

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

  suite.test('once (unbind)', function () {
    const dispatcher = new EventDispatcher();
    let data = '';

    const handler = function () {
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

  suite.test('once (multiple events)', function () {
    const dispatcher = new EventDispatcher();
    let data = '';

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

  suite.test('off (all)', function () {
    const dispatcher = new EventDispatcher();
    let data = '';

    const listenerA = function () {
      data += 'a';
    };
    const listenerB = function () {
      data += 'b';
    };
    const listenerC = function () {
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

  suite.test('off (all named)', function () {
    const dispatcher = new EventDispatcher();
    let data = '';

    const listenerA = function () {
      data += 'a';
    };
    const listenerB = function () {
      data += 'b';
    };
    const listenerC = function () {
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

  suite.test('off (all specific observer)', function () {
    const dispatcher = new EventDispatcher();
    let data = '';

    const listenerA = function () {
      data += 'a';
    };
    const listenerB = function () {
      data += 'b';
    };

    dispatcher.on('click', listenerA);
    dispatcher.on('click', listenerB);
    dispatcher.off('click', listenerB);

    data = '';
    dispatcher.fire('click');
    LegacyUnit.equal(data, 'a');
  });

  suite.test('scope setting', function () {
    let lastScope, lastEvent, dispatcher;

    dispatcher = new EventDispatcher();
    dispatcher.on('click', function () {
      // eslint-disable-next-line consistent-this
      lastScope = this;
    }).fire('click');
    LegacyUnit.equal(dispatcher, lastScope);

    const scope = { test: 1 };
    dispatcher = new EventDispatcher({ scope });
    dispatcher.on('click', function (e) {
      // eslint-disable-next-line consistent-this
      lastScope = this;
      lastEvent = e;
    }).fire('click');
    LegacyUnit.equal(scope, lastScope);
    LegacyUnit.equal(lastEvent.target, lastScope);
  });

  suite.test('beforeFire setting', function () {
    let lastArgs, dispatcher, args;

    dispatcher = new EventDispatcher({
      beforeFire (args) {
        lastArgs = args;
      }
    });

    args = dispatcher.fire('click');
    LegacyUnit.equal(lastArgs === args, true);
  });

  suite.test('beforeFire setting (stopImmediatePropagation)', function () {
    let lastArgs, dispatcher, args, data = '';

    dispatcher = new EventDispatcher({
      beforeFire (args) {
        lastArgs = args;
        args.stopImmediatePropagation();
      }
    });

    const listenerA = function () {
      data += 'a';
    };

    dispatcher.on('click', listenerA);
    args = dispatcher.fire('click');
    LegacyUnit.equal(lastArgs === args, true);
    LegacyUnit.equal(data, '');
  });

  suite.test('toggleEvent setting', function () {
    let lastName, lastState, dispatcher;

    dispatcher = new EventDispatcher({
      toggleEvent (name, state) {
        lastName = name;
        lastState = state;
      }
    });

    const listenerA = function () {
    };
    const listenerB = function () {
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
});
