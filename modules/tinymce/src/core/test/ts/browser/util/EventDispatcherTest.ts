import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit } from '@ephox/mcagar';
import EventDispatcher from 'tinymce/core/api/util/EventDispatcher';

UnitTest.asynctest('browser.tinymce.core.util.EventDispatcherTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();

  suite.test('fire (no event listeners)', () => {
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

  suite.test('fire (event listeners)', () => {
    const dispatcher = new EventDispatcher();
    let data = '';

    dispatcher.on('click', () => {
      data += 'a';
    });
    dispatcher.on('click', () => {
      data += 'b';
    });

    dispatcher.fire('click', { test: 1 });
    LegacyUnit.equal(data, 'ab');
  });

  suite.test('fire (event listeners) stopImmediatePropagation', () => {
    const dispatcher = new EventDispatcher();
    let data = '';

    dispatcher.on('click', (e) => {
      data += 'a'; e.stopImmediatePropagation();
    });
    dispatcher.on('click', () => {
      data += 'b';
    });

    dispatcher.fire('click', { test: 1 });
    LegacyUnit.equal(data, 'a');
  });

  suite.test('on', () => {
    const dispatcher = new EventDispatcher();
    let data = '';

    LegacyUnit.equal(dispatcher.on('click', () => {
      data += 'a';
    }), dispatcher);
    LegacyUnit.equal(dispatcher.on('click keydown', () => {
      data += 'b';
    }), dispatcher);

    dispatcher.fire('click');
    LegacyUnit.equal(data, 'ab');

    dispatcher.fire('keydown');
    LegacyUnit.equal(data, 'abb');
  });

  suite.test('on (prepend)', () => {
    const dispatcher = new EventDispatcher();
    let data = '';

    LegacyUnit.equal(dispatcher.on('click', () => {
      data += 'a';
    }), dispatcher);
    LegacyUnit.equal(dispatcher.on('click', () => {
      data += 'b';
    }, true), dispatcher);

    dispatcher.fire('click');
    LegacyUnit.equal(data, 'ba');
  });

  suite.test('once', () => {
    const dispatcher = new EventDispatcher();
    let data = '';

    LegacyUnit.equal(dispatcher.on('click', () => {
      data += 'a';
    }), dispatcher);
    LegacyUnit.equal(dispatcher.once('click', () => {
      data += 'b';
    }), dispatcher);
    LegacyUnit.equal(dispatcher.on('click', () => {
      data += 'c';
    }), dispatcher);

    dispatcher.fire('click');
    LegacyUnit.equal(data, 'abc');

    dispatcher.fire('click');
    LegacyUnit.equal(data, 'abcac');
  });

  suite.test('once (prepend)', () => {
    const dispatcher = new EventDispatcher();
    let data = '';

    LegacyUnit.equal(dispatcher.on('click', () => {
      data += 'a';
    }), dispatcher);
    LegacyUnit.equal(dispatcher.once('click', () => {
      data += 'b';
    }, true), dispatcher);
    LegacyUnit.equal(dispatcher.on('click', () => {
      data += 'c';
    }), dispatcher);

    dispatcher.fire('click');
    LegacyUnit.equal(data, 'bac');

    dispatcher.fire('click');
    LegacyUnit.equal(data, 'bacac');
  });

  suite.test('once (unbind)', () => {
    const dispatcher = new EventDispatcher();
    let data = '';

    const handler = () => {
      data += 'b';
    };

    dispatcher.once('click', () => {
      data += 'a';
    });
    dispatcher.once('click', handler);
    dispatcher.off('click', handler);

    dispatcher.fire('click');
    LegacyUnit.equal(data, 'a');
  });

  suite.test('once (multiple events)', () => {
    const dispatcher = new EventDispatcher();
    let data = '';

    dispatcher.once('click', () => {
      data += 'a';
    });
    dispatcher.once('keydown', () => {
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

  suite.test('off (all)', () => {
    const dispatcher = new EventDispatcher();
    let data = '';

    const listenerA = () => {
      data += 'a';
    };
    const listenerB = () => {
      data += 'b';
    };
    const listenerC = () => {
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

  suite.test('off (all named)', () => {
    const dispatcher = new EventDispatcher();
    let data = '';

    const listenerA = () => {
      data += 'a';
    };
    const listenerB = () => {
      data += 'b';
    };
    const listenerC = () => {
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

  suite.test('off (all specific observer)', () => {
    const dispatcher = new EventDispatcher();
    let data = '';

    const listenerA = () => {
      data += 'a';
    };
    const listenerB = () => {
      data += 'b';
    };

    dispatcher.on('click', listenerA);
    dispatcher.on('click', listenerB);
    dispatcher.off('click', listenerB);

    data = '';
    dispatcher.fire('click');
    LegacyUnit.equal(data, 'a');
  });

  suite.test('scope setting', () => {
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

  suite.test('beforeFire setting', () => {
    let lastArgs;

    const dispatcher = new EventDispatcher({
      beforeFire: (args) => {
        lastArgs = args;
      }
    });

    const args = dispatcher.fire('click');
    LegacyUnit.equal(lastArgs === args, true);
  });

  suite.test('beforeFire setting (stopImmediatePropagation)', () => {
    let lastArgs, data = '';

    const dispatcher = new EventDispatcher({
      beforeFire: (args) => {
        lastArgs = args;
        args.stopImmediatePropagation();
      }
    });

    const listenerA = () => {
      data += 'a';
    };

    dispatcher.on('click', listenerA);
    const args = dispatcher.fire('click');
    LegacyUnit.equal(lastArgs === args, true);
    LegacyUnit.equal(data, '');
  });

  suite.test('toggleEvent setting', () => {
    let lastName, lastState;

    const dispatcher = new EventDispatcher({
      toggleEvent: (name, state) => {
        lastName = name;
        lastState = state;
      }
    });

    // eslint-disable-next-line @tinymce/prefer-fun
    const listenerA = () => {};
    // eslint-disable-next-line @tinymce/prefer-fun
    const listenerB = () => {};

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

  Pipeline.async({}, suite.toSteps({}), () => {
    success();
  }, failure);
});
