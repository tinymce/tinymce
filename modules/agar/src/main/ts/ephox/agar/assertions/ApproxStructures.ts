import { Assert, assert, TestLabel } from '@ephox/bedrock-client';
import { Arr, Fun, Obj, Optional } from '@ephox/katamari';
import { Attribute, Classes, Css, Html, SugarElement, SugarNode, SugarText, Traverse, Truncate, Value } from '@ephox/sugar';

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
  current(): Optional<SugarElement<any>>;
  peek(): Optional<SugarElement<any>>;
  take(): Optional<SugarElement<any>>;
  mark(): {
    reset: () => void ;
    atMark: () => boolean;
  };
}

export interface StructAssertBasic {
  type?: 'basic';
  doAssert: (actual: SugarElement<any>) => void;
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

const elementQueue = (items: SugarElement<any>[], container: Optional<SugarElement<any>>): ElementQueue => {
  let i = -1;

  const context = () => {
    const hasItem = i >= 0 && i < items.length;
    const itemHtml = hasItem ? '\n' + Truncate.getHtml(items[i]) : ' *missing*';
    const itemInfo = '\nItem[' + i + ']:' + itemHtml;
    return container.fold(
      () => {
        const structHtml = Arr.map(items, Html.getOuter).join('');
        const structInfo = '\nComplete Structure:\n' + structHtml;
        return itemInfo + structInfo;
      },
      (element) => {
        const containerHtml = Truncate.getHtml(element);
        const containerInfo = '\nContainer:\n' + containerHtml;
        const structHtml = Html.getOuter(element);
        const structInfo = '\nComplete Structure:\n' + structHtml;
        return containerInfo + itemInfo + structInfo;
      }
    );
  };

  const current = () => i >= 0 && i < items.length ? Optional.some(items[i]) : Optional.none<SugarElement<any>>();

  const peek = () => i + 1 < items.length ? Optional.some(items[i + 1]) : Optional.none<SugarElement<any>>();

  const take = () => {
    i += 1;
    return current();
  };

  const mark = () => {
    const x = i;
    const reset = () => {
      i = x;
    };
    const atMark = () => i === x;
    return {
      reset,
      atMark
    };
  };

  return {
    context,
    current,
    peek,
    take,
    mark
  };
};

const element = (tag: string, fields: ElementFields): StructAssert => {
  const doAssert = (actual: SugarElement<any>): void => {
    Assert.eq(() => 'Incorrect node name for: ' + Truncate.getHtml(actual), tag, SugarNode.name(actual));
    const attrs = fields.attrs !== undefined ? fields.attrs : {};
    const classes = fields.classes !== undefined ? fields.classes : [];
    const styles = fields.styles !== undefined ? fields.styles : {};
    const html = fields.html !== undefined ? Optional.some(fields.html) : Optional.none<StringAssert>();
    const value = fields.value !== undefined ? Optional.some(fields.value) : Optional.none<StringAssert>();
    const children = fields.children !== undefined ? Optional.some(fields.children) : Optional.none<StructAssert[]>();
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

const text = (s: StringAssert, combineSiblings = false): StructAssert => {
  const doAssert = (queue: ElementQueue): void => {
    queue.take().fold(() => {
      assert.fail('No more nodes, so cannot check if its text is: ' + s.show() + ' for ' + queue.context());
    }, (actual) => {
      SugarText.getOption(actual).fold(() => {
        assert.fail('Node is not a text node, so cannot check if its text is: ' + s.show() + ' for ' + queue.context());
      }, (t: string) => {
        let text = t;
        if (combineSiblings) {
          while (queue.peek().map(SugarNode.isText).is(true)) {
            text += queue.take().bind(SugarText.getOption).getOr('');
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

const applyAssert = (structAssert: StructAssert, queue: ElementQueue) => {
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
  const doAssert = (queue: ElementQueue) => {
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
  const doAssert = (queue: ElementQueue) => {
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

const assertAttrs = (expectedAttrs: Record<string, StringAssert>, actual: SugarElement<any>) => {
  Obj.each(expectedAttrs, (v, k) => {
    if (v.strAssert === undefined) {
      throw new Error(JSON.stringify(v) + ' is not a *string assertion*.\nSpecified in *expected* attributes of ' + Truncate.getHtml(actual));
    }
    const actualValue = Attribute.getOpt(actual, k).getOrThunk(ApproxComparisons.missing);
    v.strAssert(
      () => 'Checking attribute: "' + k + '" of ' + Truncate.getHtml(actual) + '\n',
      actualValue
    );
  });
};

const assertClasses = (expectedClasses: ArrayAssert[], actual: SugarElement<any>) => {
  const actualClasses = Classes.get(actual);
  Arr.each(expectedClasses, (eCls) => {
    if (eCls.arrAssert === undefined) {
      throw new Error(JSON.stringify(eCls) + ' is not an *array assertion*.\nSpecified in *expected* classes of ' + Truncate.getHtml(actual));
    }
    eCls.arrAssert(() => 'Checking classes in ' + Truncate.getHtml(actual) + '\n', actualClasses);
  });
};

const assertStyles = (expectedStyles: Record<string, StringAssert>, actual: SugarElement<any>) => {
  Obj.each(expectedStyles, (v, k) => {
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

const assertHtml = (expectedHtml: Optional<StringAssert>, actual: SugarElement<any>) => {
  expectedHtml.each((expected) => {
    const actualHtml = Html.get(actual);
    if (expected.strAssert === undefined) {
      throw new Error(JSON.stringify(expected) + ' is not a *string assertion*.\nSpecified in *expected* innerHTML of ' + Truncate.getHtml(actual));
    }
    expected.strAssert(() => 'Checking HTML of ' + Truncate.getHtml(actual), actualHtml);
  });
};

const assertValue = (expectedValue: Optional<StringAssert>, actual: SugarElement<any>) => {
  expectedValue.each((v) => {
    if (v.strAssert === undefined) {
      throw new Error(JSON.stringify(v) + ' is not a *string assertion*.\nSpecified in *expected* value of ' + Truncate.getHtml(actual));
    }
    v.strAssert(
      () => 'Checking value of ' + Truncate.getHtml(actual),
      Value.get(actual)
    );
  });
};

const assertChildren = (expectedChildren: Optional<StructAssert[]>, actual) => {
  expectedChildren.each((expected) => {
    const children = elementQueue(Traverse.children(actual), Optional.some(actual));
    Arr.each(expected, (structExpectation, i) => {
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
  theRest
};
