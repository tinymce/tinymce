import Chain from './Chain';
import UiFinder from './UiFinder';
import { Value } from '@ephox/sugar';

var cSetValue = function (newValue) {
  return Chain.op(function (element) {
    Value.set(element, newValue);
  });
};

var cGetValue = Chain.mapper(function (element) {
  return Value.get(element);
});

var sSetValue = function (element, newValue) {
  return Chain.asStep(element, [
    cSetValue(newValue)
  ]);
};

var sSetValueOn = function (container, selector, newValue) {
  return Chain.asStep(container, [
    UiFinder.cFindIn(selector),
    cSetValue(newValue)
  ]);
};

export default {
  sSetValueOn: sSetValueOn,
  sSetValue: sSetValue,

  cSetValue: cSetValue,
  cGetValue: cGetValue
};