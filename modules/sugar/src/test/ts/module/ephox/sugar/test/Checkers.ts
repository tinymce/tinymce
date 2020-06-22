import { Assert } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';
import { HTMLElementTagNameMap, Node as DomNode } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';
import { Element } from '@ephox/sugar';
import * as Node from 'ephox/sugar/api/node/Node';
import { tElement } from './ElementInstances';

const { tArray } = Testable;

const checkOpt = <T extends DomNode>(expected: Option<Element<T>>, actual: Option<Element<T>>) => {
  KAssert.eqOption('eq', expected, actual, tElement());
};

const checkList = <T extends DomNode>(expected: ArrayLike<Element<T>>, actual: ArrayLike<Element<T>>) => {
  Assert.eq('eq', expected, actual, tArray(tElement()));
};

const isName = <K extends keyof HTMLElementTagNameMap>(name: K) => (x: Element<DomNode>): x is Element<HTMLElementTagNameMap[K]> => Node.name(x) === name;

export {
  checkOpt,
  checkList,
  isName
};
