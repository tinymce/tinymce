import { Chain, Guard, NamedChain } from '@ephox/agar';
import { Arr, Obj } from '@ephox/katamari';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { Element } from '@ephox/sugar';

// INVESTIGATE: Does cLogging have a place in vanilla agar?
const cLogging = <T, U>(label: string, chains: Array<Chain<T, U>>) => {
  const logChains = Arr.map(chains, (c) => Chain.control(c, Guard.addLogging(label)));

  return Chain.fromChains(logChains);
};

const cFindUid = (uid: string) => Chain.binder((context: any) => context.getByUid(uid));

const cFindUids = (gui: Record<string, any>, lookups: Record<string, string>) => {
  const keys = Obj.keys(lookups);
  const others = Arr.map(keys, (k) => NamedChain.direct('context', cFindUid(lookups[k]), k));

  return NamedChain.asChain(
    [
      NamedChain.writeValue('context', gui)
    ].concat(others)
  );
};

const cToElement = Chain.mapper((comp: any) => comp.element());

const eToComponent = (other: AlloyComponent): Chain<Element, AlloyComponent> => Chain.binder((elem) => other.getSystem().getByDom(elem));

export {
  cLogging,
  cFindUids,
  cToElement,
  eToComponent
};
