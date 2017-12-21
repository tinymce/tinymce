import { Chain } from '@ephox/agar';
import { Guard } from '@ephox/agar';
import { NamedChain } from '@ephox/agar';
import { Arr } from '@ephox/katamari';
import { Obj } from '@ephox/katamari';

// INVESTIGATE: Does cLogging have a place in vanilla agar?
var cLogging = function (label, chains) {
  var logChains = Arr.map(chains, function (c) {
    return Chain.control(c, Guard.addLogging(label));
  });

  return Chain.fromChains(logChains);
};

var cFindUid = function (uid) {
  return Chain.binder(function (context) {
    return context.getByUid(uid);
  });
};

var cFindUids = function (gui, lookups) {
  var keys = Obj.keys(lookups);
  var others = Arr.map(keys, function (k) {
    return NamedChain.direct('context', cFindUid(lookups[k]), k);
  });

  return NamedChain.asChain(
    [
      NamedChain.writeValue('context', gui)
    ].concat(others)
  );
};

var cToElement = Chain.mapper(function (comp) {
  return comp.element();
});

var eToComponent = function (other) {
  return Chain.binder(function (elem) {
    return other.getSystem().getByDom(elem);
  });
};

export default <any> {
  cLogging: cLogging,
  cFindUids: cFindUids,
  cToElement: cToElement,
  eToComponent: eToComponent
};