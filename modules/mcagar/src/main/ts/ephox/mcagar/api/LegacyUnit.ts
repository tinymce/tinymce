import { Assertions, Logger, Step } from '@ephox/agar';
import TinyDom from './TinyDom';

const test = function (message: string, fn: Function) {
  return function (editor) {
    return Logger.t(
      message,
      Step.sync(function () {
        fn(editor);
      })
    );
  };
};

const asyncTest = function (message: string, fn: Function) {
  return function (editor) {
    return Logger.t(
      message,
      Step.async(function (done, die) {
        fn(editor, done, die);
      })
    );
  };
};

const createSuite = function () {
  const tests = [];

  return {
    test (message: string, fn: Function) {
      tests.push(test(message, fn));
    },

    asyncTest (message: string, fn: Function) {
      tests.push(asyncTest(message, fn));
    },

    toSteps (editor) {
      return tests.map(function (test) {
        return test(editor);
      });
    }
  };
};

const execCommand = function execCommand(editor, cmd: string, ui?, value?) {
  if (editor.editorCommands.hasCustomCommand(cmd)) {
    editor.execCommand(cmd, ui, value);
  }
};

const findContainer = function (editor, selector: string) {
  let container;

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

const setSelection = function (editor, startSelector: string, startOffset: number, endSelector?: string, endOffset?: number) {
  const startContainer = findContainer(editor, startSelector);
  const endContainer = findContainer(editor, endSelector ? endSelector : startSelector);
  const rng = editor.dom.createRng();

  const setRange = function (container, offset, start) {
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

const trimBrs = function (html: string) {
  return html.toLowerCase().replace(/<br[^>]*>|[\r\n]+/gi, '');
};

const equalDom = function (actual, expected, message?: string) {
  Assertions.assertDomEq(typeof message !== 'undefined' ? message : 'Nodes are not equal', TinyDom.fromDom(expected), TinyDom.fromDom(actual));
};

const equal = function (actual, expected, message?: string) {
  Assertions.assertEq(typeof message !== 'undefined' ? message : 'No message specified', expected, actual);
};

export default {
  test,
  asyncTest,
  createSuite,

  execCommand,
  setSelection,

  trimBrs,

  equal,
  equalDom,
  strictEqual: equal,
  deepEqual: equal
};
