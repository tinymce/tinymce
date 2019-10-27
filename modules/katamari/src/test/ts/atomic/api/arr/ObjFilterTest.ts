import * as Obj from 'ephox/katamari/api/Obj';
import * as Fun from 'ephox/katamari/api/Fun';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import fc from 'fast-check';

UnitTest.test('Obj.filter: filter const true is identity', () => {
  fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.integer()), (obj) => {
    Assert.eq('id', obj, Obj.filter(obj, () => true));
  }));
});

UnitTest.test('Obj.filter: filter bottom of {} = {}', () => {
  Assert.eq('{}', {}, Obj.filter({}, Fun.die('boom')));
});

UnitTest.test('Obj.filter: unit tests', () => {
  Assert.eq('example 1', {a: 1}, Obj.filter({a: 1, b: 2}, (x) => x === 1));
  Assert.eq('example 2', {b: 2}, Obj.filter({a: 1, b: 2}, (x) => x === 2));
  Assert.eq('example 3', {b: 2, c: 5}, Obj.filter({c: 5, a: 1, b: 2}, (x) => x >= 2));
  Assert.eq('example 4', {c: 5}, Obj.filter({c: 5, a: 1, b: 2}, (x, i) => i === 'c'));
});
