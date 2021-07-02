import { after, afterEach, before, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { assert } from 'chai';

import EventUtils from 'tinymce/core/api/dom/EventUtils';

describe('browser.tinymce.core.dom.EventUtilsTest', () => {
  const eventUtils = EventUtils.Event;

  before(() => {
    const testDiv = document.createElement('div');
    testDiv.id = 'testDiv';
    testDiv.innerHTML = (
      '<div id="content" tabindex="0">' +
      '<div id="inner" tabindex="0"></div>' +
      '</div>'
    );

    document.body.appendChild(testDiv);
  });

  after(() => {
    const testDiv = document.querySelector('#testDiv');
    testDiv.parentNode.removeChild(testDiv);
  });

  afterEach(() => {
    eventUtils.clean(window);
  });

  it('unbind all', () => {
    let result;

    eventUtils.bind(window, 'click', () => {
      result.click = true;
    });

    eventUtils.bind(window, 'keydown', () => {
      result.keydown1 = true;
    });

    eventUtils.bind(window, 'keydown', () => {
      result.keydown2 = true;
    });

    result = {};
    eventUtils.fire(window, 'click');
    eventUtils.fire(window, 'keydown');
    assert.deepEqual(result, { click: true, keydown1: true, keydown2: true });

    eventUtils.unbind(window);
    result = {};
    eventUtils.fire(window, 'click');
    eventUtils.fire(window, 'keydown');
    assert.deepEqual(result, {});
  });

  it('unbind event', () => {
    let result;

    eventUtils.bind(window, 'click', () => {
      result.click = true;
    });

    eventUtils.bind(window, 'keydown', () => {
      result.keydown1 = true;
    });

    eventUtils.bind(window, 'keydown', () => {
      result.keydown2 = true;
    });

    result = {};
    eventUtils.fire(window, 'click');
    eventUtils.fire(window, 'keydown');
    assert.deepEqual(result, { click: true, keydown1: true, keydown2: true });

    eventUtils.unbind(window, 'click');
    result = {};
    eventUtils.fire(window, 'click');
    eventUtils.fire(window, 'keydown');
    assert.deepEqual(result, { keydown1: true, keydown2: true });
  });

  it('unbind event non existing', () => {
    eventUtils.unbind(window, 'noevent');
    assert.ok(true, 'No exception');
  });

  it('unbind callback', () => {
    let result;

    eventUtils.bind(window, 'click', () => {
      result.click = true;
    });

    eventUtils.bind(window, 'keydown', () => {
      result.keydown1 = true;
    });

    const callback2 = () => {
      result.keydown2 = true;
    };

    eventUtils.bind(window, 'keydown', callback2);

    result = {};
    eventUtils.fire(window, 'click');
    eventUtils.fire(window, 'keydown');
    assert.deepEqual(result, { click: true, keydown1: true, keydown2: true });

    eventUtils.unbind(window, 'keydown', callback2);
    result = {};
    eventUtils.fire(window, 'click');
    eventUtils.fire(window, 'keydown');
    assert.deepEqual(result, { click: true, keydown1: true });
  });

  it('unbind multiple', () => {
    eventUtils.bind(window, 'mouseup mousedown click', (e) => {
      result[e.type] = true;
    });

    eventUtils.unbind(window, 'mouseup mousedown');

    const result = {};
    eventUtils.fire(window, 'mouseup');
    eventUtils.fire(window, 'mousedown');
    eventUtils.fire(window, 'click');
    assert.deepEqual(result, { click: true });
  });

  it('bind multiple', () => {
    eventUtils.bind(window, 'mouseup mousedown', (e) => {
      result[e.type] = true;
    });

    const result = {};
    eventUtils.fire(window, 'mouseup');
    eventUtils.fire(window, 'mousedown');
    eventUtils.fire(window, 'click');
    assert.deepEqual(result, { mouseup: true, mousedown: true });
  });

  it('bind/fire bubbling', () => {
    let result;

    eventUtils.bind(window, 'click', () => {
      result.window = true;
    });

    eventUtils.bind(document, 'click', () => {
      result.document = true;
    });

    eventUtils.bind(document.body, 'click', () => {
      result.body = true;
    });

    eventUtils.bind(document.getElementById('content'), 'click', () => {
      result.content = true;
    });

    eventUtils.bind(document.getElementById('inner'), 'click', () => {
      result.inner = true;
    });

    result = {};
    eventUtils.fire(window, 'click');
    assert.deepEqual(result, { window: true });

    result = {};
    eventUtils.fire(document, 'click');
    assert.deepEqual(result, { document: true, window: true });

    result = {};
    eventUtils.fire(document.body, 'click');
    assert.deepEqual(result, { body: true, document: true, window: true });

    result = {};
    eventUtils.fire(document.getElementById('content'), 'click');
    assert.deepEqual(result, { content: true, body: true, document: true, window: true });

    result = {};
    eventUtils.fire(document.getElementById('inner'), 'click');
    assert.deepEqual(result, { inner: true, content: true, body: true, document: true, window: true });
  });

  it('bubbling with prevented default', () => {
    let result;

    eventUtils.bind(window, 'click', (e) => {
      result.window = true;
      result.windowPrevented = e.defaultPrevented;
      result.windowIsPrevented = e.isDefaultPrevented();
    });

    eventUtils.bind(document.getElementById('inner'), 'click', (e) => {
      result.inner = true;
      e.preventDefault();
    });

    result = {};
    eventUtils.fire(window, 'click', { defaultPrevented: false, cancelBubble: false });
    assert.deepEqual(result, { window: true, windowPrevented: false, windowIsPrevented: false });

    result = {};
    eventUtils.fire(document.getElementById('inner'), 'click', { defaultPrevented: false, cancelBubble: false });
    assert.deepEqual(result, { inner: true, window: true, windowPrevented: true, windowIsPrevented: true });
  });

  it('bind/fire stopImmediatePropagation', () => {
    eventUtils.bind(window, 'click', () => {
      result.click1 = true;
    });

    eventUtils.bind(window, 'click', (e) => {
      result.click2 = true;
      e.stopImmediatePropagation();
    });

    eventUtils.bind(window, 'click', () => {
      result.click3 = true;
    });

    const result = {} as Record<string, any>;
    eventUtils.fire(window, 'click');
    assert.deepEqual(result, { click1: true, click2: true });
  });

  it('bind/fire stopPropagation', () => {
    eventUtils.bind(window, 'click', () => {
      result.click1 = true;
    });

    eventUtils.bind(document.body, 'click', () => {
      result.click2 = true;
    });

    eventUtils.bind(document.getElementById('inner'), 'click', (e) => {
      result.click3 = true;
      e.stopPropagation();
    });

    const result = {} as Record<string, any>;
    eventUtils.fire(document.getElementById('inner'), 'click');
    assert.deepEqual(result, { click3: true });
  });

  it('clean window', () => {
    let result;

    eventUtils.bind(window, 'click', () => {
      result.click1 = true;
    });

    eventUtils.bind(document.body, 'click', () => {
      result.click2 = true;
    });

    eventUtils.bind(document.getElementById('content'), 'click', () => {
      result.click3 = true;
    });

    eventUtils.bind(document.getElementById('inner'), 'click', () => {
      result.click4 = true;
    });

    result = {};
    eventUtils.fire(document.getElementById('inner'), 'click');
    assert.deepEqual(result, { click1: true, click2: true, click3: true, click4: true });

    eventUtils.clean(window);
    result = {};
    eventUtils.fire(document.getElementById('inner'), 'click');
    assert.deepEqual(result, {});
  });

  it('clean document', () => {
    let result;

    eventUtils.bind(window, 'click', () => {
      result.click1 = true;
    });

    eventUtils.bind(document, 'click', () => {
      result.click2 = true;
    });

    eventUtils.bind(document.body, 'click', () => {
      result.click3 = true;
    });

    eventUtils.bind(document.getElementById('content'), 'click', () => {
      result.click4 = true;
    });

    eventUtils.bind(document.getElementById('inner'), 'click', () => {
      result.click5 = true;
    });

    result = {};
    eventUtils.fire(document.getElementById('inner'), 'click');
    assert.deepEqual(result, { click1: true, click2: true, click3: true, click4: true, click5: true });

    eventUtils.clean(document);
    result = {};
    eventUtils.fire(document.getElementById('inner'), 'click');
    assert.deepEqual(result, { click1: true });
  });

  it('clean element', () => {
    let result;

    eventUtils.bind(window, 'click', () => {
      result.click1 = true;
    });

    eventUtils.bind(document.body, 'click', () => {
      result.click2 = true;
    });

    eventUtils.bind(document.getElementById('content'), 'click', () => {
      result.click3 = true;
    });

    eventUtils.bind(document.getElementById('inner'), 'click', () => {
      result.click4 = true;
    });

    result = {};
    eventUtils.fire(document.getElementById('inner'), 'click');
    assert.deepEqual(result, { click1: true, click2: true, click3: true, click4: true });

    eventUtils.clean(document.getElementById('content'));
    result = {};
    eventUtils.fire(document.getElementById('inner'), 'click');
    assert.deepEqual(result, { click1: true, click2: true });
  });

  it('mouseenter/mouseleave bind/unbind', () => {
    let result = {};

    eventUtils.bind(document.body, 'mouseenter mouseleave', (e) => {
      result[e.type] = true;
    });

    eventUtils.fire(document.body, 'mouseenter');
    eventUtils.fire(document.body, 'mouseleave');

    assert.deepEqual(result, { mouseenter: true, mouseleave: true });

    result = {};
    eventUtils.clean(document.body);
    eventUtils.fire(document.body, 'mouseenter');
    eventUtils.fire(document.body, 'mouseleave');
    assert.deepEqual(result, {});
  });

  /*
  asyncTest("focusin/focusout bind/unbind", function() {
    var result = {};

    window.setTimeout(function() {
      eventUtils.bind(document.body, 'focusin focusout', function(e) {
        // IE will fire a focusout on the parent element if you focus an element within not a big deal so lets detect it in the test
        if (e.type == "focusout" && e.target.contains(document.activeElement)) {
          return;
        }

        result[e.type] = result[e.type] ? ++result[e.type] : 1;
      });

      start();
      document.getElementById('content').focus();
      document.getElementById('inner').focus();

      assert.deepEqual(result, {focusin: 2, focusout: 1});
    }, 0);
  });
  */

  it('bind unbind fire clean on null', () => {
    eventUtils.bind(null, 'click', Fun.noop);
    eventUtils.unbind(null, 'click', Fun.noop);
    eventUtils.fire(null, 'click', {});
    eventUtils.clean(null);
    assert.ok(true, 'No exception');
  });

  it('bind ready when page is loaded', () => {
    let ready;

    eventUtils.bind(window, 'ready', () => {
      ready = true;
    });

    assert.equal(true, eventUtils.domLoaded, 'DomLoaded state true');
    assert.equal(true, ready, 'Window is ready.');
  });

  it('event states when event object is fired twice', () => {
    const result = {};

    eventUtils.bind(window, 'keydown', (e) => {
      result[e.type] = true; e.preventDefault(); e.stopPropagation();
    });
    eventUtils.bind(window, 'keyup', (e) => {
      result[e.type] = true; e.stopImmediatePropagation();
    });

    const event: any = {};
    eventUtils.fire(window, 'keydown', event);
    eventUtils.fire(window, 'keyup', event);

    assert.equal(true, event.isDefaultPrevented(), 'Default is prevented.');
    assert.equal(true, event.isPropagationStopped(), 'Propagation is stopped.');
    assert.equal(true, event.isImmediatePropagationStopped(), 'Immediate propagation is stopped.');

    assert.deepEqual(result, { keydown: true, keyup: true });
  });

  it('unbind inside callback', () => {
    let data;

    const append = (value) => {
      return () => {
        data += value;
      };
    };

    const callback = () => {
      eventUtils.unbind(window, 'click', callback);
      data += 'b';
    };

    data = '';
    eventUtils.bind(window, 'click', append('a'));
    eventUtils.bind(window, 'click', callback);
    eventUtils.bind(window, 'click', append('c'));

    eventUtils.fire(window, 'click', {});
    assert.equal(data, 'abc');

    data = '';
    eventUtils.fire(window, 'click', {});
    assert.equal(data, 'ac');
  });

  it('ready/DOMContentLoaded (domLoaded = true)', () => {
    let evt;

    eventUtils.bind(window, 'ready', (e) => {
      evt = e;
    });
    assert.equal(evt.type, 'ready');
  });

  it('ready/DOMContentLoaded (document.readyState check)', () => {
    const doc = document as any;
    let evt;

    try {
      doc.readyState = 'loading';
    } catch (e) {
      assert.equal(true, true, `IE doesn't allow us to set document.readyState`);
      return;
    }

    eventUtils.domLoaded = false;
    doc.readyState = 'loading';
    eventUtils.bind(window, 'ready', (e) => {
      evt = e;
    });
    assert.equal(true, typeof evt !== 'undefined');

    eventUtils.domLoaded = false;
    doc.readyState = 'complete';
    eventUtils.bind(window, 'ready', (e) => {
      evt = e;
    });
    assert.equal(evt.type, 'ready');
  });

  it('isDefaultPrevented', () => {
    const testObj: any = {};
    const testCallback = Fun.constant('hello');
    testObj.isDefaultPrevented = testCallback;
    eventUtils.fire(window, 'testEvent', testObj);

    assert.notEqual(testObj.isDefaultPrevented, testCallback, 'Is overwritten by our isDefaultPrevented');
    assert.equal(typeof testObj.isPropagationStopped, 'function', 'Has our isPropagationStopped');
    assert.equal(typeof testObj.isImmediatePropagationStopped, 'function', 'Has our isImmediatePropagationStopped');
  });
});
