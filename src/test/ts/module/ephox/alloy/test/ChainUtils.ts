import { Chain, Guard, NamedChain } from '@ephox/agar';
import { Arr, Obj } from '@ephox/katamari';

// INVESTIGATE: Does cLogging have a place in vanilla agar?
const cLogging = function (label, chains) {
  const logChains = Arr.map(chains, function (c) {
    return Chain.control(c, Guard.addLogging(label));
  });

  return Chain.fromChains(logChains);
};

const cFindUid = function (uid) {
  return Chain.binder(function (context) {
    return context.getByUid(uid);
  });
};

const cFindUids = function (gui, lookups) {
  const keys = Obj.keys(lookups);
  const others = Arr.map(keys, function (k) {
    return NamedChain.direct('context', cFindUid(lookups[k]), k);
  });

  return NamedChain.asChain(
    [
      NamedChain.writeValue('context', gui)
    ].concat(others)
  );
};

const cToElement = Chain.mapper(function (comp) {
  return comp.element();
});

const eToComponent = function (other) {
  return Chain.binder(function (elem) {
    return other.getSystem().getByDom(elem);
  });
};

export default <any> {
  cLogging,
  cFindUids,
  cToElement,
  eToComponent
};