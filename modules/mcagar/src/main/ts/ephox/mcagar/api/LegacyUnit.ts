import { Step } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Assertions } from '@ephox/agar';
import TinyDom from './TinyDom';

var test = function (message: string, fn: Function) {
  return function (editor) {
    return Logger.t(
      message,
      Step.sync(function () {
        fn(editor);
      })
    );
  };
};

var asyncTest = function (message: string, fn: Function) {
  return function (editor) {
    return Logger.t(
      message,
      Step.async(function (done, die) {
        fn(editor, done, die);
      })
    );
  };
};

var createSuite = function () {
  var tests = [];

  return {
    test: function (message: string, fn: Function) {
      tests.push(test(message, fn));
    },

    asyncTest: function (message: string, fn: Function) {
      tests.push(asyncTest(message, fn));
    },

    toSteps: function (editor) {
      return tests.map(function (test) {
        return test(editor);
      });
    }
  };
};

var execCommand = function execCommand(editor, cmd: string, ui?, value?) {
  if (editor.editorCommands.hasCustomCommand(cmd)) {
    editor.execCommand(cmd, ui, value);
  }
};

var findContainer = function (editor, selector: string) {
  var container;

  if (typeof selector === 'string') {
    container = editor.dom.select(selector)[0];
  } else {
    container = selector;
  }

  if (container.firstChild) {
    container = container.firstChild;
  }

  return container;
};

var setSelection = function (editor, startSelector: string, startOffset: number, endSelector?: string, endOffset?: number) {
  var startContainer = findContainer(editor, startSelector);
  var endContainer = findContainer(editor, endSelector ? endSelector : startSelector);
  var rng = editor.dom.createRng();

  var setRange = function (container, offset, start) {
    offset = offset ? offset : 0;

    if (offset === 'after') {
      if (start) {
        rng.setStartAfter(container);
      } else {
        rng.setEndAfter(container);
      }

      return;
    } else if (offset === 'afterNextCharacter') {
      container = container.nextSibling;
      offset = 1;
    }

    if (start) {
      rng.setStart(container, offset);
    } else {
      rng.setEnd(container, offset);
    }
  };

  setRange(startContainer, startOffset, true);
  setRange(endContainer, endSelector ? endOffset : startOffset, false);
  editor.selection.setRng(rng);
};

var trimBrs = function (html: string) {
  return html.toLowerCase().replace(/<br[^>]*>|[\r\n]+/gi, '');
};

var equalDom = function (actual, expected, message?: string) {
  Assertions.assertDomEq(typeof message !== "undefined" ? message : 'Nodes are not equal', TinyDom.fromDom(expected), TinyDom.fromDom(actual));
};

var equal = function (actual, expected, message?: string) {
  Assertions.assertEq(typeof message !== "undefined" ? message : 'No message specified', expected, actual);
};

export default {
  test: test,
  asyncTest: asyncTest,
  createSuite: createSuite,

  execCommand: execCommand,
  setSelection: setSelection,

  trimBrs: trimBrs,

  equal: equal,
  equalDom: equalDom,
  strictEqual: equal,
  deepEqual: equal
};