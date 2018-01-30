import { Pipeline, Step } from '@ephox/agar';
import { Arr } from '@ephox/katamari';
import { LegacyUnit } from '@ephox/mcagar';
import EventUtils from 'tinymce/core/api/dom/EventUtils';
import { UnitTest } from '@ephox/bedrock';

declare const document: any;

UnitTest.asynctest('browser.tinymce.core.dom.EventUtilsTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();
  const eventUtils = EventUtils.Event;

  suite.test('unbind all', function () {
    let result;

    eventUtils.bind(window, 'click', function () {
      result.click = true;
    });

    eventUtils.bind(window, 'keydown', function () {
      result.keydown1 = true;
    });

    eventUtils.bind(window, 'keydown', function () {
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

  suite.test('unbind event', function () {
    let result;

    eventUtils.bind(window, 'click', function () {
      result.click = true;
    });

    eventUtils.bind(window, 'keydown', function () {
      result.keydown1 = true;
    });

    eventUtils.bind(window, 'keydown', function () {
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

  suite.test('unbind event non existing', function () {
    eventUtils.unbind(window, 'noevent');
    LegacyUnit.equal(true, true, 'No exception');
  });

  suite.test('unbind callback', function () {
    let result;

    eventUtils.bind(window, 'click', function () {
      result.click = true;
    });

    eventUtils.bind(window, 'keydown', function () {
      result.keydown1 = true;
    });

    const callback2 = function () {
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

  suite.test('unbind multiple', function () {
    let result;

    eventUtils.bind(window, 'mouseup mousedown click', function (e) {
      result[e.type] = true;
    });

    eventUtils.unbind(window, 'mouseup mousedown');

    result = {};
    eventUtils.fire(window, 'mouseup');
    eventUtils.fire(window, 'mousedown');
    eventUtils.fire(window, 'click');
    LegacyUnit.deepEqual(result, { click: true });
  });

  suite.test('bind multiple', function () {
    let result;

    eventUtils.bind(window, 'mouseup mousedown', function (e) {
      result[e.type] = true;
    });

    result = {};
    eventUtils.fire(window, 'mouseup');
    eventUtils.fire(window, 'mousedown');
    eventUtils.fire(window, 'click');
    LegacyUnit.deepEqual(result, { mouseup: true, mousedown: true });
  });

  suite.test('bind/fire bubbling', function () {
    let result;

    eventUtils.bind(window, 'click', function () {
      result.window = true;
    });

    eventUtils.bind(document, 'click', function () {
      result.document = true;
    });

    eventUtils.bind(document.body, 'click', function () {
      result.body = true;
    });

    eventUtils.bind(document.getElementById('content'), 'click', function () {
      result.content = true;
    });

    eventUtils.bind(document.getElementById('inner'), 'click', function () {
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

  suite.test('bind/fire stopImmediatePropagation', function () {
    let result;

    eventUtils.bind(window, 'click', function () {
      result.click1 = true;
    });

    eventUtils.bind(window, 'click', function (e) {
      result.click2 = true;
      e.stopImmediatePropagation();
    });

    eventUtils.bind(window, 'click', function () {
      result.click3 = true;
    });

    result = {};
    eventUtils.fire(window, 'click');
    LegacyUnit.deepEqual(result, { click1: true, click2: true });
  });

  suite.test('bind/fire stopPropagation', function () {
    let result;

    eventUtils.bind(window, 'click', function () {
      result.click1 = true;
    });

    eventUtils.bind(document.body, 'click', function () {
      result.click2 = true;
    });

    eventUtils.bind(document.getElementById('inner'), 'click', function (e) {
      result.click3 = true;
      e.stopPropagation();
    });

    result = {};
    eventUtils.fire(document.getElementById('inner'), 'click');
    LegacyUnit.deepEqual(result, { click3: true });
  });

  suite.test('clean window', function () {
    let result;

    eventUtils.bind(window, 'click', function () {
      result.click1 = true;
    });

    eventUtils.bind(document.body, 'click', function () {
      result.click2 = true;
    });

    eventUtils.bind(document.getElementById('content'), 'click', function () {
      result.click3 = true;
    });

    eventUtils.bind(document.getElementById('inner'), 'click', function () {
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

  suite.test('clean document', function () {
    let result;

    eventUtils.bind(window, 'click', function () {
      result.click1 = true;
    });

    eventUtils.bind(document, 'click', function () {
      result.click2 = true;
    });

    eventUtils.bind(document.body, 'click', function () {
      result.click3 = true;
    });

    eventUtils.bind(document.getElementById('content'), 'click', function () {
      result.click4 = true;
    });

    eventUtils.bind(document.getElementById('inner'), 'click', function () {
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

  suite.test('clean element', function () {
    let result;

    eventUtils.bind(window, 'click', function () {
      result.click1 = true;
    });

    eventUtils.bind(document.body, 'click', function () {
      result.click2 = true;
    });

    eventUtils.bind(document.getElementById('content'), 'click', function () {
      result.click3 = true;
    });

    eventUtils.bind(document.getElementById('inner'), 'click', function () {
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

  suite.test('mouseenter/mouseleave bind/unbind', function () {
    let result = {};

    eventUtils.bind(document.body, 'mouseenter mouseleave', function (e) {
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

  suite.test('bind unbind fire clean on null', function () {
    eventUtils.bind(null, 'click', function () {});
    eventUtils.unbind(null, 'click', function () {});
    eventUtils.fire(null, {});
    eventUtils.clean(null);
    LegacyUnit.equal(true, true, 'No exception');
  });

  suite.test('bind ready when page is loaded', function () {
    let ready;

    eventUtils.bind(window, 'ready', function () {
      ready = true;
    });

    LegacyUnit.equal(true, eventUtils.domLoaded, 'DomLoaded state true');
    LegacyUnit.equal(true, ready, 'Window is ready.');
  });

  suite.test('event states when event object is fired twice', function () {
    const result = {};

    eventUtils.bind(window, 'keydown', function (e) {
      result[e.type] = true; e.preventDefault(); e.stopPropagation();
    });
    eventUtils.bind(window, 'keyup', function (e) {
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

  suite.test('unbind inside callback', function () {
    let data;

    const append = function (value) {
      return function () {
        data += value;
      };
    };

    const callback = function () {
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

  suite.test('ready/DOMContentLoaded (domLoaded = true)', function () {
    let evt;

    eventUtils.bind(window, 'ready', function (e) {
      evt = e;
    });
    LegacyUnit.equal(evt.type, 'ready');
  });

  suite.test('ready/DOMContentLoaded (document.readyState check)', function () {
    let evt;

    try {
      document.readyState = 'loading';
    } catch (e) {
      LegacyUnit.equal(true, true, 'IE doesn\'t allow us to set document.readyState');
      return;
    }

    eventUtils.domLoaded = false;
    document.readyState = 'loading';
    eventUtils.bind(window, 'ready', function (e) {
      evt = e;
    });
    LegacyUnit.equal(true, typeof (evt) !== 'undefined');

    eventUtils.domLoaded = false;
    document.readyState = 'complete';
    eventUtils.bind(window, 'ready', function (e) {
      evt = e;
    });
    LegacyUnit.equal(evt.type, 'ready');
  });

  suite.test('isDefaultPrevented', function () {
    const testObj: any = {};
    const testCallback = function () {
      return 'hello';
    };
    testObj.isDefaultPrevented = testCallback;
    eventUtils.fire(window, 'testEvent', testObj);

    LegacyUnit.equal(testObj.isDefaultPrevented !== testCallback, true, 'Is overwritten by our isDefaultPrevented');
    LegacyUnit.equal(typeof testObj.isPropagationStopped, 'function', 'Has our isPropagationStopped');
    LegacyUnit.equal(typeof testObj.isImmediatePropagationStopped, 'function', 'Has our isImmediatePropagationStopped');
  });

  const sAddTestDiv = Step.sync(function () {
    const testDiv = document.createElement('div');
    testDiv.id = 'testDiv';
    testDiv.innerHTML = (
      '<div id="content" tabindex="0">' +
      '<div id="inner" tabindex="0"></div>' +
      '</div>'
    );

    document.body.appendChild(testDiv);
  });

  const sRemoveTestDiv = Step.sync(function () {
    const testDiv = document.querySelector('#testDiv');
    testDiv.parentNode.removeChild(testDiv);
  });

  let steps = Arr.bind(suite.toSteps({}), function (step) {
    return [
      step,
      Step.sync(function () {
        eventUtils.clean(window);
      })
    ];
  });

  steps = [sAddTestDiv].concat(steps).concat(sRemoveTestDiv);

  Pipeline.async({}, steps, function () {
    success();
  }, failure);
});
