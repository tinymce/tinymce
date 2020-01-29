import { Assert } from '@ephox/bedrock-client';
import { Option } from '@ephox/katamari';
import { tElement } from './ElementInstances';
import * as Node from 'ephox/sugar/api/node/Node';
import { Element } from '@ephox/sugar';
import { Testable } from '@ephox/dispute';
import { KAssert } from '@ephox/katamari-assertions';

const { tArray } = Testable;

const checkOpt = (expected: Option<Element<unknown>>, actual: Option<Element<unknown>>) => {
  KAssert.eqOption('eq', expected, actual, tElement);
};

const checkList = (expected: ArrayLike<Element<unknown>>, actual: ArrayLike<Element<unknown>>) => {
  Assert.eq('eq', expected, actual, tArray(tElement));
};

const isName = (name) => (x) => Node.name(x) === name;

export default {
  checkOpt,
  checkList,
  isName,
};
