import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import EventDispatcher, { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

describe('browser.tinymce.core.util.EventDispatcherTest', () => {
  it('fire (no event listeners)', () => {
    const dispatcher = new EventDispatcher();
    let args: EditorEvent<any>;

    args = dispatcher.dispatch('click', { test: 1 });
    assert.equal(args.test, 1);
    assert.isFalse(args.isDefaultPrevented());
    assert.isFalse(args.isPropagationStopped());
    assert.isFalse(args.isImmediatePropagationStopped());
    assert.equal(args.target, dispatcher);

    args = dispatcher.dispatch('click');
    assert.isFalse(args.isDefaultPrevented());
    assert.isFalse(args.isPropagationStopped());
    assert.isFalse(args.isImmediatePropagationStopped());
  });

  it('fire (event listeners)', () => {
    const dispatcher = new EventDispatcher();
    let data = '';

    dispatcher.on('click', () => {
      data += 'a';
    });
    dispatcher.on('click', () => {
      data += 'b';
    });

    dispatcher.dispatch('click', { test: 1 });
    assert.equal(data, 'ab');
  });

  it('fire (event listeners) stopImmediatePropagation', () => {
    const dispatcher = new EventDispatcher();
    let data = '';

    dispatcher.on('click', (e) => {
      data += 'a'; e.stopImmediatePropagation();
    });
    dispatcher.on('click', () => {
      data += 'b';
    });

    dispatcher.dispatch('click', { test: 1 });
    assert.equal(data, 'a');
  });

  it('on', () => {
    const dispatcher = new EventDispatcher();
    let data = '';

    assert.equal(dispatcher.on('click', () => {
      data += 'a';
    }), dispatcher);
    assert.equal(dispatcher.on('click keydown', () => {
      data += 'b';
    }), dispatcher);

    dispatcher.dispatch('click');
    assert.equal(data, 'ab');

    dispatcher.dispatch('keydown');
    assert.equal(data, 'abb');
  });

  it('on (prepend)', () => {
    const dispatcher = new EventDispatcher();
    let data = '';

    assert.equal(dispatcher.on('click', () => {
      data += 'a';
    }), dispatcher);
    assert.equal(dispatcher.on('click', () => {
      data += 'b';
    }, true), dispatcher);

    dispatcher.dispatch('click');
    assert.equal(data, 'ba');
  });

  it('once', () => {
    const dispatcher = new EventDispatcher();
    let data = '';

    assert.equal(dispatcher.on('click', () => {
      data += 'a';
    }), dispatcher);
    assert.equal(dispatcher.once('click', () => {
      data += 'b';
    }), dispatcher);
    assert.equal(dispatcher.on('click', () => {
      data += 'c';
    }), dispatcher);

    dispatcher.dispatch('click');
    assert.equal(data, 'abc');

    dispatcher.dispatch('click');
    assert.equal(data, 'abcac');
  });

  it('once (prepend)', () => {
    const dispatcher = new EventDispatcher();
    let data = '';

    assert.equal(dispatcher.on('click', () => {
      data += 'a';
    }), dispatcher);
    assert.equal(dispatcher.once('click', () => {
      data += 'b';
    }, true), dispatcher);
    assert.equal(dispatcher.on('click', () => {
      data += 'c';
    }), dispatcher);

    dispatcher.dispatch('click');
    assert.equal(data, 'bac');

    dispatcher.dispatch('click');
    assert.equal(data, 'bacac');
  });

  it('once (unbind)', () => {
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

    dispatcher.dispatch('click');
    assert.equal(data, 'a');
  });

  it('once (multiple events)', () => {
    const dispatcher = new EventDispatcher();
    let data = '';

    dispatcher.once('click', () => {
      data += 'a';
    });
    dispatcher.once('keydown', () => {
      data += 'b';
    });

    dispatcher.dispatch('click');
    assert.equal(data, 'a');

    dispatcher.dispatch('keydown');
    assert.equal(data, 'ab');

    dispatcher.dispatch('click');
    dispatcher.dispatch('keydown');

    assert.equal(data, 'ab');
  });

  it('off (all)', () => {
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
    dispatcher.dispatch('click');
    dispatcher.dispatch('keydown');
    assert.equal(data, '');
  });

  it('off (all named)', () => {
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
    dispatcher.dispatch('click');
    dispatcher.dispatch('keydown');
    assert.equal(data, 'c');
  });

  it('off (all specific observer)', () => {
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
    dispatcher.dispatch('click');
    assert.equal(data, 'a');
  });

  it('scope setting', () => {
    let lastScope: any;
    let lastEvent: EditorEvent<any>;
    let dispatcher: EventDispatcher<any>;

    dispatcher = new EventDispatcher();
    dispatcher.on('click', function (this: EventDispatcher<any>) {
      // eslint-disable-next-line consistent-this
      lastScope = this;
    }).dispatch('click');
    assert.equal(dispatcher, lastScope);

    const scope = { test: 1 };
    dispatcher = new EventDispatcher({ scope });
    dispatcher.on('click', function (this: EventDispatcher<any>, e) {
      // eslint-disable-next-line consistent-this
      lastScope = this;
      lastEvent = e;
    }).dispatch('click');
    assert.equal(scope, lastScope);
    assert.equal(lastEvent.target, lastScope);
  });

  it('beforeFire setting', () => {
    let lastArgs: EditorEvent<any>;

    const dispatcher = new EventDispatcher({
      beforeFire: (args) => {
        lastArgs = args;
      }
    });

    const args = dispatcher.dispatch('click');
    assert.strictEqual(lastArgs, args);
  });

  it('beforeFire setting (stopImmediatePropagation)', () => {
    let lastArgs: EditorEvent<any>;
    let data = '';

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
    const args = dispatcher.dispatch('click');
    assert.strictEqual(lastArgs, args);
    assert.equal(data, '');
  });

  it('toggleEvent setting', () => {
    let lastName: string | undefined;
    let lastState: boolean | undefined;

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
    assert.equal(lastName, 'click');
    assert.isTrue(lastState);

    lastName = lastState = undefined;
    dispatcher.on('click', listenerB);
    assert.isUndefined(lastName);
    assert.isUndefined(lastState);

    dispatcher.off('click', listenerA);
    assert.isUndefined(lastName);
    assert.isUndefined(lastState);

    dispatcher.off('click', listenerB);
    assert.equal(lastName, 'click');
    assert.isFalse(lastState);
  });

  it('TINY-7436: Callbacks added or removed in an earlier handler do not run while firing the same event', () => {
    const dispatcher = new EventDispatcher();
    const logs: string[] = [];

    const func1 = () => {
      logs.push('func1');
      dispatcher.off('run', func2);
      dispatcher.on('run', func3);
    };
    const func2 = () => {
      logs.push('func2');
    };
    const func3 = () => {
      logs.push('func3');
    };

    dispatcher.on('run', func1);
    dispatcher.on('run', func2);

    assert.isEmpty(logs);
    dispatcher.dispatch('run');
    assert.deepEqual(logs, [ 'func1' ]);
  });

  it('TINY-3254: Does not mutate the original event args when firing', () => {
    const dispatcher = new EventDispatcher();
    const original = { type: 'custom' };

    dispatcher.on('run', (e) => {
      e.new = true;
    });
    const result = dispatcher.dispatch<'run', any>('run', original);

    assert.notDeepEqual(result, original);
    assert.equal(original.type, 'custom');
    assert.notProperty(original, 'new');
    assert.notProperty(original, 'preventDefault');
    assert.equal(result.type, 'run');
    assert.isTrue(result.new);
  });
});
