import { Assertions, Logger, Step } from '@ephox/agar';
import { Editor } from '../alien/EditorTypes';
import { TinyDom } from './TinyDom';

type SyncTestCallback<T> = (initValue: T) => void;
type AsyncTestCallback<T> = (initValue: T, done: () => void, die: (err?: any) => void) => void;
type Offset = 'after' | 'afterNextCharacter' | number;

interface Suite<T> {
  readonly test: (message: string, fn: SyncTestCallback<T>) => void;
  readonly asyncTest: (message: string, fn: AsyncTestCallback<T>) => void;
  readonly toSteps: (initValue: T) => Step<any, any>[];
}

const test = function <T> (message: string, fn: SyncTestCallback<T>) {
  return function (initValue: T): Step<T, T> {
    return Logger.t(
      message,
      Step.sync(function () {
        fn(initValue);
      })
    );
  };
};

const asyncTest = function <T> (message: string, fn: AsyncTestCallback<T>) {
  return function (initValue: T): Step<T, T> {
    return Logger.t(
      message,
      Step.async(function (done, die) {
        fn(initValue, done, die);
      })
    );
  };
};

const createSuite = function <T = any> (): Suite<T> {
  const tests: Array<(initValue: T) => Step<any, any>> = [];

  return {
    test(message: string, fn: SyncTestCallback<T>) {
      tests.push(test(message, fn));
    },

    asyncTest(message: string, fn: AsyncTestCallback<T>) {
      tests.push(asyncTest(message, fn));
    },

    toSteps(initValue: T) {
      return tests.map(function (test) {
        return test(initValue);
      });
    }
  };
};

const execCommand = function <T extends Editor = Editor> (editor: T, cmd: string, ui?: boolean, value?: any): void {
  if (editor.editorCommands.hasCustomCommand(cmd)) {
    editor.execCommand(cmd, ui, value);
  }
};

const findContainer = function <T extends Editor = Editor> (editor: T, selector: string | Node) {
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

const setSelection = function <T extends Editor = Editor> (editor: T, startSelector: string, startOffset: Offset, endSelector?: string, endOffset?: Offset): void {
  const startContainer = findContainer(editor, startSelector);
  const endContainer = findContainer(editor, endSelector ? endSelector : startSelector);
  const rng = editor.dom.createRng();

  const setRange = function (container: Node, offset: Offset | undefined, start: boolean) {
    offset = offset ? offset : 0;

    if (offset === 'after') {
      if (start) {
        rng.setStartAfter(container);
      } else {
        rng.setEndAfter(container);
      }

      return;
    } else if (offset === 'afterNextCharacter') {
      container = container.nextSibling as Node;
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

const trimBrs = function (html: string): string {
  return html.toLowerCase().replace(/<br[^>]*>|[\r\n]+/gi, '');
};

const equalDom = function <T extends Node> (actual: T, expected: T, message?: string): void {
  Assertions.assertDomEq(typeof message !== 'undefined' ? message : 'Nodes are not equal', TinyDom.fromDom(expected), TinyDom.fromDom(actual));
};

const equal = function <T> (actual: T, expected: T, message?: string): void {
  Assertions.assertEq(typeof message !== 'undefined' ? message : 'No message specified', expected, actual);
};

const strictEqual = equal;
const deepEqual = equal;

export {
  test,
  asyncTest,
  createSuite,

  execCommand,
  setSelection,

  trimBrs,

  equal,
  equalDom,
  strictEqual,
  deepEqual
};
