import { Assert } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';
import { Optional } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';

import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import { tElement } from 'ephox/sugar/api/node/SugarElementInstances';
import * as SugarNode from 'ephox/sugar/api/node/SugarNode';

const { tArray } = Testable;

const checkOpt = <T extends Node>(expected: Optional<SugarElement<T>>, actual: Optional<SugarElement<T>>): void => {
  KAssert.eqOptional('eq', expected, actual, tElement());
};

const checkList = <T extends Node>(expected: ArrayLike<SugarElement<T>>, actual: ArrayLike<SugarElement<T>>): void => {
  Assert.eq('eq', expected, actual, tArray(tElement()));
};

const isName = <K extends keyof HTMLElementTagNameMap>(name: K) => (x: SugarElement<Node>): x is SugarElement<HTMLElementTagNameMap[K]> =>
  SugarNode.name(x) === name;

export {
  checkOpt,
  checkList,
  isName
};
