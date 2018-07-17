import { assert } from '@ephox/bedrock';
import { Arr, Fun, Obj, Option } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';
import { Attr, Classes, Css, Element, Html, Node, Text, Traverse, Value } from '@ephox/sugar';

import * as Truncate from '../alien/Truncate';
import { assertEq } from '../api/RawAssertions';
import * as ApproxComparisons from './ApproxComparisons';

export interface StringAssert {
  show: () => void;
  strAssert: (label: string, actual: string) => void;
}

export interface ArrayAssert {
  show: () => void;
  arrAssert: (label: string, array: any[]) => void;
}

export interface StructAssert {
  doAssert: (actual: Element) => void;
}

export interface ElementFields {
  attrs?: Record<string, StringAssert>;
  classes?: ArrayAssert[];
  styles?: Record<string, StringAssert>;
  html?: StringAssert;
  value?: StringAssert;
  children?: StructAssert[];
}

const element = function (tag: string, fields: ElementFields): StructAssert {
  const doAssert = function (actual: Element) {
    assertEq('Incorrect node name for: ' + Truncate.getHtml(actual), tag, Node.name(actual));
    const attrs = fields.attrs !== undefined ? fields.attrs : {};
    const classes = fields.classes !== undefined ? fields.classes : [];
    const styles = fields.styles !== undefined ? fields.styles : {};
    const html = fields.html !== undefined ? Option.some(fields.html) : Option.none();
    const value = fields.value !== undefined ? Option.some(fields.value) : Option.none();
    const children = fields.children !== undefined ? Option.some(fields.children) : Option.none();
    assertAttrs(attrs, actual);
    assertClasses(classes, actual);
    assertStyles(styles, actual);
    assertHtml(html, actual);
    assertValue(value, actual);

    assertChildren(children, actual);
  };

  return {
    doAssert: doAssert
  };
};

const text = function (s: StringAssert): StructAssert {
  const doAssert = function (actual: Element) {
    Text.getOption(actual).fold(function () {
      assert.fail(Truncate.getHtml(actual) + ' is not a text node, so cannot check if its text is: ' + s.show());
    }, function (t: string) {
      if (s.strAssert === undefined) throw new Error(Json.stringify(s) + ' is not a *string assertion*');
      s.strAssert('Checking text content', t);
    });
  };

  return {
    doAssert: doAssert
  };
};

const anythingStruct: StructAssert = {
  doAssert: Fun.noop
};

const assertAttrs = function (expectedAttrs: Record<string, StringAssert>, actual: Element) {
  Obj.each(expectedAttrs, function (v, k) {
    if (v.strAssert === undefined) throw new Error(Json.stringify(v) + ' is not a *string assertion*.\nSpecified in *expected* attributes of ' + Truncate.getHtml(actual));
    const actualValue = Attr.has(actual, k) ? Attr.get(actual, k) : ApproxComparisons.missing();
    v.strAssert(
      'Checking attribute: "' + k + '" of ' + Truncate.getHtml(actual) + '\n',
      actualValue
    );
  });
};

const assertClasses = function (expectedClasses: ArrayAssert[], actual: Element) {
  const actualClasses = Classes.get(actual);
  Arr.each(expectedClasses, function (eCls) {
    if (eCls.arrAssert === undefined) throw new Error(Json.stringify(eCls) + ' is not an *array assertion*.\nSpecified in *expected* classes of ' + Truncate.getHtml(actual));
    eCls.arrAssert('Checking classes in ' + Truncate.getHtml(actual) + '\n', actualClasses);
  });
};

const assertStyles = function (expectedStyles: Record<string, StringAssert>, actual: Element) {
  Obj.each(expectedStyles, function (v, k) {
    const actualValue = Css.getRaw(actual, k).getOrThunk(ApproxComparisons.missing);
    if (v.strAssert === undefined) throw new Error(Json.stringify(v) + ' is not a *string assertion*.\nSpecified in *expected* styles of ' + Truncate.getHtml(actual));
    v.strAssert(
      'Checking style: "' + k + '" of ' + Truncate.getHtml(actual) + '\n',
      actualValue
    );
  });
};

const assertHtml = function (expectedHtml: Option<StringAssert>, actual: Element) {
  expectedHtml.each(function (expected) {
    const actualHtml = Html.get(actual);
    if (expected.strAssert === undefined) throw new Error(Json.stringify(expected) + ' is not a *string assertion*.\nSpecified in *expected* innerHTML of ' + Truncate.getHtml(actual));
    expected.strAssert('Checking HTML of ' + Truncate.getHtml(actual), actualHtml);
  });
};

const assertValue = function (expectedValue: Option<StringAssert>, actual: Element) {
  expectedValue.each(function (v) {
    if (v.strAssert === undefined) throw new Error(Json.stringify(v) + ' is not a *string assertion*.\nSpecified in *expected* value of ' + Truncate.getHtml(actual));
    v.strAssert(
      'Checking value of ' + Truncate.getHtml(actual),
      Value.get(actual)
    );
  });
};

const assertChildren = function (expectedChildren: Option<StructAssert[]>, actual) {
  expectedChildren.each(function (expected) {
    const children = Traverse.children(actual);
    assertEq(
      'Checking number of children of: ' + Truncate.getHtml(actual) + '\nComplete Structure: \n' + Html.getOuter(actual),
      expected.length,
      children.length
    );
    Arr.each(children, function (child, i) {
      const exp = expected[i];
      if (exp.doAssert === undefined) throw new Error(Json.stringify(exp) + ' is not a *structure assertion*.\nSpecified in *expected* children of ' + Truncate.getHtml(actual));
      exp.doAssert(child);
    });
  });
};

const anything = Fun.constant(anythingStruct);

export {
  // Force anything to require invoking
  anything,
  element,
  text
};