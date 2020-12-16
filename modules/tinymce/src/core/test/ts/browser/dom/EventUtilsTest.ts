import { Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { LegacyUnit } from '@ephox/mcagar';
import EventUtils from 'tinymce/core/api/dom/EventUtils';

declare const document: any;

UnitTest.asynctest('browser.tinymce.core.dom.EventUtilsTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();
  const eventUtils = EventUtils.Event;

  suite.test('unbind all', () => {
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
    LegacyUnit.deepEqual(result, { click: true, keydown1: true, keydown2: true });

    eventUtils.unbind(window);
    result = {};
    eventUtils.fire(window, 'click');
    eventUtils.fire(window, 'keydown');
    LegacyUnit.deepEqual(result, {});
  });

  suite.test('unbind event', () => {
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
    LegacyUnit.deepEqual(result, { click: true, keydown1: true, keydown2: true });

    eventUtils.unbind(window, 'click');
    result = {};
    eventUtils.fire(window, 'click');
    eventUtils.fire(window, 'keydown');
    LegacyUnit.deepEqual(result, { keydown1: true, keydown2: true });
  });

  suite.test('unbind event non existing', () => {
    eventUtils.unbind(window, 'noevent');
    LegacyUnit.equal(true, true, 'No exception');
  });

  suite.test('unbind callback', () => {
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
    LegacyUnit.deepEqual(result, { click: true, keydown1: true, keydown2: true });

    eventUtils.unbind(window, 'keydown', callback2);
    result = {};
    eventUtils.fire(window, 'click');
    eventUtils.fire(window, 'keydown');
    LegacyUnit.deepEqual(result, { click: true, keydown1: true });
  });

  suite.test('unbind multiple', () => {
    eventUtils.bind(window, 'mouseup mousedown click', (e) => {
      result[e.type] = true;
    });

    eventUtils.unbind(window, 'mouseup mousedown');

    const result = {};
    eventUtils.fire(window, 'mouseup');
    eventUtils.fire(window, 'mousedown');
    eventUtils.fire(window, 'click');
    LegacyUnit.deepEqual(result, { click: true });
  });

  suite.test('bind multiple', () => {
    eventUtils.bind(window, 'mouseup mousedown', (e) => {
      result[e.type] = true;
    });

    const result = {};
    eventUtils.fire(window, 'mouseup');
    eventUtils.fire(window, 'mousedown');
    eventUtils.fire(window, 'click');
    LegacyUnit.deepEqual(result, { mouseup: true, mousedown: true });
  });

  suite.test('bind/fire bubbling', () => {
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
    LegacyUnit.deepEqual(result, { window: true });

    result = {};
    eventUtils.fire(document, 'click');
    LegacyUnit.deepEqual(result, { document: true, window: true });

    result = {};
    eventUtils.fire(document.body, 'click');
    LegacyUnit.deepEqual(result, { body: true, document: true, window: true });

    result = {};
    eventUtils.fire(document.getElementById('content'), 'click');
    LegacyUnit.deepEqual(result, { content: true, body: true, document: true, window: true });

    result = {};
    eventUtils.fire(document.getElementById('inner'), 'click');
    LegacyUnit.deepEqual(result, { inner: true, content: true, body: true, document: true, window: true });
  });

  suite.test('bind/fire stopImmediatePropagation', () => {
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
    LegacyUnit.deepEqual(result, { click1: true, click2: true });
  });

  suite.test('bind/fire stopPropagation', () => {
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
    LegacyUnit.deepEqual(result, { click3: true });
  });

  suite.test('clean window', () => {
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
    LegacyUnit.deepEqual(result, { click1: true, click2: true, click3: true, click4: true });

    eventUtils.clean(window);
    result = {};
    eventUtils.fire(document.getElementById('inner'), 'click');
    LegacyUnit.deepEqual(result, {});
  });

  suite.test('clean document', () => {
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
    LegacyUnit.deepEqual(result, { click1: true, click2: true, click3: true, click4: true, click5: true });

    eventUtils.clean(document);
    result = {};
    eventUtils.fire(document.getElementById('inner'), 'click');
    LegacyUnit.deepEqual(result, { click1: true });
  });

  suite.test('clean element', () => {
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
    LegacyUnit.deepEqual(result, { click1: true, click2: true, click3: true, click4: true });

    eventUtils.clean(document.getElementById('content'));
    result = {};
    eventUtils.fire(document.getElementById('inner'), 'click');
    LegacyUnit.deepEqual(result, { click1: true, click2: true });
  });

  suite.test('mouseenter/mouseleave bind/unbind', () => {
    let result = {};

    eventUtils.bind(document.body, 'mouseenter mouseleave', (e) => {
      result[e.type] = true;
    });

    eventUtils.fire(document.body, 'mouseenter');
    eventUtils.fire(document.body, 'mouseleave');

    LegacyUnit.deepEqual(result, { mouseenter: true, mouseleave: true });

    result = {};
    eventUtils.clean(document.body);
    eventUtils.fire(document.body, 'mouseenter');
    eventUtils.fire(document.body, 'mouseleave');
    LegacyUnit.deepEqual(result, {});
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

      LegacyUnit.deepEqual(result, {focusin: 2, focusout: 1});
    }, 0);
  });
  */

  suite.test('bind unbind fire clean on null', () => {
    eventUtils.bind(null, 'click', Fun.noop);
    eventUtils.unbind(null, 'click', Fun.noop);
    eventUtils.fire(null, 'click', {});
    eventUtils.clean(null);
    LegacyUnit.equal(true, true, 'No exception');
  });

  suite.test('bind ready when page is loaded', () => {
    let ready;

    eventUtils.bind(window, 'ready', () => {
      ready = true;
    });

    LegacyUnit.equal(true, eventUtils.domLoaded, 'DomLoaded state true');
    LegacyUnit.equal(true, ready, 'Window is ready.');
  });

  suite.test('event states when event object is fired twice', () => {
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

    LegacyUnit.equal(true, event.isDefaultPrevented(), 'Default is prevented.');
    LegacyUnit.equal(true, event.isPropagationStopped(), 'Propagation is stopped.');
    LegacyUnit.equal(true, event.isImmediatePropagationStopped(), 'Immediate propagation is stopped.');

    LegacyUnit.deepEqual(result, { keydown: true, keyup: true });
  });

  suite.test('unbind inside callback', () => {
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
    LegacyUnit.equal(data, 'abc');

    data = '';
    eventUtils.fire(window, 'click', {});
    LegacyUnit.equal(data, 'ac');
  });

  suite.test('ready/DOMContentLoaded (domLoaded = true)', () => {
    let evt;

    eventUtils.bind(window, 'ready', (e) => {
      evt = e;
    });
    LegacyUnit.equal(evt.type, 'ready');
  });

  suite.test('ready/DOMContentLoaded (document.readyState check)', () => {
    let evt;

    try {
      document.readyState = 'loading';
    } catch (e) {
      LegacyUnit.equal(true, true, `IE doesn't allow us to set document.readyState`);
      return;
    }

    eventUtils.domLoaded = false;
    document.readyState = 'loading';
    eventUtils.bind(window, 'ready', (e) => {
      evt = e;
    });
    LegacyUnit.equal(true, typeof evt !== 'undefined');

    eventUtils.domLoaded = false;
    document.readyState = 'complete';
    eventUtils.bind(window, 'ready', (e) => {
      evt = e;
    });
    LegacyUnit.equal(evt.type, 'ready');
  });

  suite.test('isDefaultPrevented', () => {
    const testObj: any = {};
    const testCallback = () => {
      return 'hello';
    };
    testObj.isDefaultPrevented = testCallback;
    eventUtils.fire(window, 'testEvent', testObj);

    LegacyUnit.equal(testObj.isDefaultPrevented !== testCallback, true, 'Is overwritten by our isDefaultPrevented');
    LegacyUnit.equal(typeof testObj.isPropagationStopped, 'function', 'Has our isPropagationStopped');
    LegacyUnit.equal(typeof testObj.isImmediatePropagationStopped, 'function', 'Has our isImmediatePropagationStopped');
  });

  const sAddTestDiv = Step.sync(() => {
    const testDiv = document.createElement('div');
    testDiv.id = 'testDiv';
    testDiv.innerHTML = (
      '<div id="content" tabindex="0">' +
      '<div id="inner" tabindex="0"></div>' +
      '</div>'
    );

    document.body.appendChild(testDiv);
  });

  const sRemoveTestDiv = Step.sync(() => {
    const testDiv = document.querySelector('#testDiv');
    testDiv.parentNode.removeChild(testDiv);
  });

  let steps = Arr.bind(suite.toSteps({}), (step) => {
    return [
      step,
      Step.sync(() => {
        eventUtils.clean(window);
      })
    ];
  });

  steps = [ sAddTestDiv ].concat(steps).concat(sRemoveTestDiv);

  Pipeline.async({}, steps, success, failure);
});
