import SizzleFind from '../alien/SizzleFind';
import Truncate from '../alien/Truncate';
import { Adt } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Result } from '@ephox/katamari';
import { Selectors } from '@ephox/sugar';

var targets = Adt.generate([
  { self: [ 'element', 'selector' ] },
  { children: [ 'element', 'selector' ] },
  { descendants: [ 'element', 'selector' ] }
]);

var derive = function (element, selector) {
  // Not sure if error is what I want here.
  if (selector === undefined) throw new Error('No selector passed through');
  else if (selector.indexOf('root:') === 0) {
    return targets.self(element, selector.substring('root:'.length)); 
  } else if (selector.indexOf('root>') === 0) {
    return targets.children(element, selector.substring('root>'.length));
  } else {
    return targets.descendants(element, selector);
  }
};

var matchesSelf = function (element, selector) {
  return SizzleFind.matches(element, selector) ? Option.some(element) : Option.none();
};

var optToArray = function (opt) {
  return opt.toArray();
};

var select = function (element, selector) {
  return derive(element, selector).fold(
    matchesSelf,
    SizzleFind.child,
    SizzleFind.descendant
  );
};

var selectAll = function (element, selector) {
  return derive(element, selector).fold(
    Fun.compose(optToArray, matchesSelf),
    SizzleFind.children,
    SizzleFind.descendants
  );
};

var toResult = function (message, option) {
  return option.fold(function () {
    return Result.error(message);
  }, Result.value);
};

var findIn = function (container, selector) {
  return toResult(
    'Could not find selector: ' + selector + ' in ' + Truncate.getHtml(container),
    select(container, selector)
  );
};

var findAllIn = function (container, selector) {
  return selectAll(container, selector);
};

export default <any> {
  select: select,
  findIn: findIn,
  findAllIn: findAllIn
};