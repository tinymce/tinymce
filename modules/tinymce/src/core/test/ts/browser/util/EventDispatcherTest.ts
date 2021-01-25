import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import EventDispatcher, { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

describe('browser.tinymce.core.util.EventDispatcherTest', () => {
  it('fire (no event listeners)', () => {
    const dispatcher = new EventDispatcher();
    let args: EditorEvent<any>;

    args = dispatcher.fire('click', { test: 1 });
    assert.equal(args.test, 1);
    assert.isFalse(args.isDefaultPrevented());
    assert.isFalse(args.isPropagationStopped());
    assert.isFalse(args.isImmediatePropagationStopped());
    assert.equal(args.target, dispatcher);

    args = dispatcher.fire('click');
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

    dispatcher.fire('click', { test: 1 });
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

    dispatcher.fire('click', { test: 1 });
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

    dispatcher.fire('click');
    assert.equal(data, 'ab');

    dispatcher.fire('keydown');
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

    dispatcher.fire('click');
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

    dispatcher.fire('click');
    assert.equal(data, 'abc');

    dispatcher.fire('click');
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

    dispatcher.fire('click');
    assert.equal(data, 'bac');

    dispatcher.fire('click');
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

    dispatcher.fire('click');
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

    dispatcher.fire('click');
    assert.equal(data, 'a');

    dispatcher.fire('keydown');
    assert.equal(data, 'ab');

    dispatcher.fire('click');
    dispatcher.fire('keydown');

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
    dispatcher.fire('click');
    dispatcher.fire('keydown');
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
    dispatcher.fire('click');
    dispatcher.fire('keydown');
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
    dispatcher.fire('click');
    assert.equal(data, 'a');
  });

  it('scope setting', () => {
    let lastScope: any;
    let lastEvent: EditorEvent<any>;
    let dispatcher: EventDispatcher<any>;

    dispatcher = new EventDispatcher();
    dispatcher.on('click', function () {
      // eslint-disable-next-line consistent-this
      lastScope = this;
    }).fire('click');
    assert.equal(dispatcher, lastScope);

    const scope = { test: 1 };
    dispatcher = new EventDispatcher({ scope });
    dispatcher.on('click', function (e) {
      // eslint-disable-next-line consistent-this
      lastScope = this;
      lastEvent = e;
    }).fire('click');
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

    const args = dispatcher.fire('click');
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
    const args = dispatcher.fire('click');
    assert.strictEqual(lastArgs, args);
    assert.equal(data, '');
  });

  it('toggleEvent setting', () => {
    let lastName: string;
    let lastState: boolean;

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

    lastName = lastState = null;
    dispatcher.on('click', listenerB);
    assert.isNull(lastName);
    assert.isNull(lastState);

    dispatcher.off('click', listenerA);
    assert.isNull(lastName);
    assert.isNull(lastState);

    dispatcher.off('click', listenerB);
    assert.equal(lastName, 'click');
    assert.isFalse(lastState);
  });
});
