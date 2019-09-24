import { assert, TestLabel } from '@ephox/bedrock';
import { Arr, Fun, Obj, Option } from '@ephox/katamari';
import { Attr, Classes, Css, Element, Html, Node, Text, Traverse, Value } from '@ephox/sugar';

import * as Truncate from '../alien/Truncate';
import { assertEq } from '../api/RawAssertions';
import * as ApproxComparisons from './ApproxComparisons';

export interface StringAssert {
  show: () => void;
  strAssert: (label: TestLabel, actual: string) => void;
}

export interface ArrayAssert {
  show: () => void;
  arrAssert: (label: TestLabel, array: any[]) => void;
}

export interface ElementQueue {
  context(): string;
  current(): Option<Element>;
  peek(): Option<Element>;
  take(): Option<Element>;
  mark(): {
    reset: () => void ;
    atMark: () => boolean;
  };
}

export interface StructAssertBasic {
  type?: 'basic';
  doAssert: (actual: Element) => void;
}

export interface StructAssertAdv {
  type: 'advanced';
  doAssert: (queue: ElementQueue) => void;
}

export type StructAssert = StructAssertBasic | StructAssertAdv;

export interface ElementFields {
  attrs?: Record<string, StringAssert>;
  classes?: ArrayAssert[];
  styles?: Record<string, StringAssert>;
  html?: StringAssert;
  value?: StringAssert;
  children?: StructAssert[];
}

const elementQueue = function (items: Element[], container: Option<Element>): ElementQueue {
  let i = -1;

  const context = () => {
    return container.fold(() => {
      return '\nItem[' + i + ']:' +
      (i >= 0 && i < items.length ? '\n' + Truncate.getHtml(items[i]) : ' *missing*') +
      '\nComplete Structure:\n' + Arr.map(items, Html.getOuter).join('');
    }, (element) => {
      return '\nContainer:\n' + Truncate.getHtml(element) +
      '\nItem[' + i + ']:' +
      (i >= 0 && i < items.length ? '\n' + Truncate.getHtml(items[i]) : ' *missing*') +
      '\nComplete Structure:\n' + Html.getOuter(element);
    });
  };

  const current = () => i >= 0 && i < items.length ? Option.some(items[i]) : Option.none<Element<any>>();

  const peek = () => i + 1 < items.length ? Option.some(items[i + 1]) : Option.none<Element<any>>();

  const take = () => {
    i += 1;
    return current();
  };

  const mark = function () {
    const x = i;
    const reset = () => {
      i = x;
    };
    const atMark = () => i === x;
    return {
      reset,
      atMark,
    };
  };

  return {
    context,
    current,
    peek,
    take,
    mark,
  };
};

const element = function (tag: string, fields: ElementFields): StructAssert {
  const doAssert = function (actual: Element) {
    assertEq(() => 'Incorrect node name for: ' + Truncate.getHtml(actual), tag, Node.name(actual));
    const attrs = fields.attrs !== undefined ? fields.attrs : {};
    const classes = fields.classes !== undefined ? fields.classes : [];
    const styles = fields.styles !== undefined ? fields.styles : {};
    const html = fields.html !== undefined ? Option.some(fields.html) : Option.none<StringAssert>();
    const value = fields.value !== undefined ? Option.some(fields.value) : Option.none<StringAssert>();
    const children = fields.children !== undefined ? Option.some(fields.children) : Option.none<StructAssert[]>();
    assertAttrs(attrs, actual);
    assertClasses(classes, actual);
    assertStyles(styles, actual);
    assertHtml(html, actual);
    assertValue(value, actual);

    assertChildren(children, actual);
  };

  return {
    doAssert
  };
};

const text = function (s: StringAssert, combineSiblings = false): StructAssert {
  const doAssert = function (queue: ElementQueue) {
    queue.take().fold(() => {
      assert.fail('No more nodes, so cannot check if its text is: ' + s.show() + ' for ' + queue.context());
    }, (actual) => {
      Text.getOption(actual).fold(function () {
        assert.fail('Node is not a text node, so cannot check if its text is: ' + s.show() + ' for ' + queue.context());
      }, function (t: string) {
        let text = t;
        if (combineSiblings) {
          while (queue.peek().map(Node.isText).is(true)) {
            text += queue.take().bind(Text.getOption).getOr('');
          }
        }
        if (s.strAssert === undefined) {
          throw new Error(JSON.stringify(s) + ' is not a *string assertion*');
        }
        s.strAssert('Checking text content', text);
      });
    });
  };

  return {
    type: 'advanced',
    doAssert
  };
};

const applyAssert = function (structAssert: StructAssert, queue: ElementQueue) {
  if (structAssert.type === 'advanced') {
    structAssert.doAssert(queue);
  } else {
    queue.take().fold(() => {
      assert.fail('Expected more children to satisfy assertion for ' + queue.context());
    }, (item) => {
      structAssert.doAssert(item);
    });
  }
};

const either = (structAsserts: StructAssert[]): StructAssert => {
  const doAssert = function (queue: ElementQueue) {
    const mark = queue.mark();
    for (let i = 0; i < structAsserts.length - 1; i++) {
      try {
        applyAssert(structAsserts[i], queue);
        return;
      } catch (e) {
        mark.reset();
      }
    }
    if (structAsserts.length > 0) {
      applyAssert(structAsserts[structAsserts.length - 1], queue);
    }
  };
  return {
    type: 'advanced',
    doAssert
  };
};

const repeat = (min: number, max: number | true = min) => (structAssert: StructAssert): StructAssert => {
  const doAssert = function (queue: ElementQueue) {
    let i = 0;
    for (; i < min; i++) {
      applyAssert(structAssert, queue);
    }
    for (; (max === true || i < max) && queue.peek().isSome(); i++) {
      const mark = queue.mark();
      try {
        applyAssert(structAssert, queue);
      } catch (e) {
        mark.reset();
      }
      if (mark.atMark()) {
        break;
      }
    }
  };
  return {
    type: 'advanced',
    doAssert
  };
};

const zeroOrOne = repeat(0, 1);

const zeroOrMore = repeat(0, true);

const oneOrMore = repeat(1, true);

const anythingStruct: StructAssert = {
  doAssert: Fun.noop
};

const assertAttrs = function (expectedAttrs: Record<string, StringAssert>, actual: Element) {
  Obj.each(expectedAttrs, function (v, k) {
    if (v.strAssert === undefined) {
      throw new Error(JSON.stringify(v) + ' is not a *string assertion*.\nSpecified in *expected* attributes of ' + Truncate.getHtml(actual));
    }
    const actualValue = Attr.has(actual, k) ? Attr.get(actual, k) : ApproxComparisons.missing();
    v.strAssert(
      () => 'Checking attribute: "' + k + '" of ' + Truncate.getHtml(actual) + '\n',
      actualValue
    );
  });
};

const assertClasses = function (expectedClasses: ArrayAssert[], actual: Element) {
  const actualClasses = Classes.get(actual);
  Arr.each(expectedClasses, function (eCls) {
    if (eCls.arrAssert === undefined) {
      throw new Error(JSON.stringify(eCls) + ' is not an *array assertion*.\nSpecified in *expected* classes of ' + Truncate.getHtml(actual));
    }
    eCls.arrAssert(() => 'Checking classes in ' + Truncate.getHtml(actual) + '\n', actualClasses);
  });
};

const assertStyles = function (expectedStyles: Record<string, StringAssert>, actual: Element) {
  Obj.each(expectedStyles, function (v, k) {
    const actualValue = Css.getRaw(actual, k).getOrThunk(ApproxComparisons.missing);
    if (v.strAssert === undefined) {
      throw new Error(JSON.stringify(v) + ' is not a *string assertion*.\nSpecified in *expected* styles of ' + Truncate.getHtml(actual));
    }
    v.strAssert(
      () => 'Checking style: "' + k + '" of ' + Truncate.getHtml(actual) + '\n',
      actualValue
    );
  });
};

const assertHtml = function (expectedHtml: Option<StringAssert>, actual: Element) {
  expectedHtml.each(function (expected) {
    const actualHtml = Html.get(actual);
    if (expected.strAssert === undefined) {
      throw new Error(JSON.stringify(expected) + ' is not a *string assertion*.\nSpecified in *expected* innerHTML of ' + Truncate.getHtml(actual));
    }
    expected.strAssert(() => 'Checking HTML of ' + Truncate.getHtml(actual), actualHtml);
  });
};

const assertValue = function (expectedValue: Option<StringAssert>, actual: Element) {
  expectedValue.each(function (v) {
    if (v.strAssert === undefined) {
      throw new Error(JSON.stringify(v) + ' is not a *string assertion*.\nSpecified in *expected* value of ' + Truncate.getHtml(actual));
    }
    v.strAssert(
      () => 'Checking value of ' + Truncate.getHtml(actual),
      Value.get(actual)
    );
  });
};

const assertChildren = function (expectedChildren: Option<StructAssert[]>, actual) {
  expectedChildren.each(function (expected) {
    const children = elementQueue(Traverse.children(actual), Option.some(actual));
    Arr.each(expected, function (structExpectation, i) {
      if (structExpectation.doAssert === undefined) {
        throw new Error(JSON.stringify(structExpectation) + ' is not a *structure assertion*.\n' +
          'Specified in *expected* children of ' + Truncate.getHtml(actual));
      }
      if (structExpectation.type === 'advanced') {
        structExpectation.doAssert(children);
      } else {
        children.take().fold(() => {
          assert.fail('Expected more children to satisfy assertion ' + i + ' for ' + children.context());
        }, (item) => {
          structExpectation.doAssert(item);
        });
      }
    });
    if (children.peek().isSome()) {
      assert.fail('More children than expected for ' + children.context());
    }
  });
};

const anything = Fun.constant(anythingStruct);

const theRest = Fun.constant(zeroOrMore(anythingStruct));

export {
  elementQueue,
  anything,
  element,
  text,
  either,
  repeat,
  zeroOrOne,
  zeroOrMore,
  oneOrMore,
  theRest,
};
