/* tslint:disable:no-unimported-promise */
import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import { LazyValue } from 'ephox/katamari/api/LazyValue';
import * as LazyValues from 'ephox/katamari/api/LazyValues';
import { Option } from 'ephox/katamari/api/Option';
import { setTimeout } from '@ephox/dom-globals';
import { eqAsync, promiseTest } from 'ephox/katamari/test/AsyncProps';
import fc from 'fast-check';
import { tOption } from 'ephox/katamari/api/OptionInstances';

const lazyCounter = () => {
  let counter = 0;
  return LazyValue.nu((callback) => {
    counter++;
    callback(counter);
  });
};

promiseTest('LazyValue: get', () => new Promise((resolve, reject) => {
  const lazy = lazyCounter();

  lazy.get((val) => {
    eqAsync('LazyValue.get. The counter should be 1 after 1 call', 1, val, reject);
    lazy.get((val2) => {
      eqAsync('LazyValue.get. The counter should still be 1 because it is cached. Was: ' + val2, 1, val2, reject);
      resolve();
    });
  });
}));

promiseTest('LazyValue: map', () => new Promise((resolve, reject) => {
  const f = (x) => x + 'hello';

  const lazy = LazyValue.nu((callback) => {
    setTimeout(() => {
      callback('extra');
    }, 10);
  });

  lazy.map(f).get((fx) => {
    eqAsync('LazyValue.map. Expected: extrahello, was: ' + fx, 'extrahello', fx, reject);
    resolve();
  });
}));

promiseTest('LazyValue: isReady', () => new Promise((resolve, reject) => {
  const lazy = LazyValue.nu((callback) => {
    setTimeout(() => {
      callback('extra');
    }, 50);
  });

  eqAsync('LazyValue.isReady. Lazy value should not be ready yet.', false, lazy.isReady(), reject);
  lazy.get((_v) => {
    eqAsync('LazyValue.isReady. Lazy value should now be ready', true, lazy.isReady(), reject);
    resolve();
  });
}));

promiseTest('LazyValue: pure', () =>
  fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
    LazyValue.pure(i).get((v) => {
      eqAsync('LazyValue.pure', i, v, reject);
      resolve();
    });
  }))));

promiseTest('LazyValue: pure, map', () =>
  fc.assert(fc.asyncProperty(fc.integer(), fc.func(fc.string()), (i, f) => new Promise((resolve, reject) => {
    LazyValue.pure(i).map(f).get((v) => {
      eqAsync('LazyValue.map', f(i), v, reject);
      resolve();
    });
  }))));

promiseTest('LazyValue: delayed, map', () =>
  fc.assert(fc.asyncProperty(fc.integer(), fc.func(fc.string()), (i, f) => new Promise((resolve, reject) => {
    LazyValue.nu((c) => {
      setTimeout(() => {
        c(i);
      }, 2);
    }).map(f).get((v) => {
      eqAsync('LazyValue.map', f(i), v, reject);
      resolve();
    });
  }))));

promiseTest('LazyValue: parallel', () => new Promise((resolve, reject) => {
  const f = LazyValue.nu((callback) => {
    setTimeout(Fun.curry(callback, 'apple'), 10);
  });
  const g = LazyValue.nu((callback) => {
    setTimeout(Fun.curry(callback, 'banana'), 5);
  });
  const h = LazyValue.nu((callback) => {
    callback('carrot');
  });

  LazyValues.par([ f, g, h ]).get((r) => {
    eqAsync('r[0]', r[0], 'apple', reject);
    eqAsync('r[1]', r[1], 'banana', reject);
    eqAsync('r[2]', r[2], 'carrot', reject);
    resolve();
  });
}));

promiseTest('LazyValue: parallel spec', () => fc.assert(fc.asyncProperty(fc.array(fc.integer(), 0, 20), (vals) => new Promise((resolve, reject) => {
  const lazyVals = Arr.map(vals, LazyValue.pure);
  LazyValues.par(lazyVals).get((actual) => {
    eqAsync('pars', vals, actual, reject);
    resolve();
  });
}))));

promiseTest('LazyValue: TINY-6106: LazyValue should only use the value from the first time the callback is called', () => new Promise((resolve, reject) => {
  LazyValue.nu((completer) => {
    // Since lazyvalue kicks off the computation straight away, both completer calls happen before the callback is fired.
    // If the bug is present, the value will be 3. If the bug is fixed, the value will be 2.
    completer(2);
    completer(3);
  }).get((actual) => {
    eqAsync('should be 2', 2, actual, reject);
    resolve();
  });
}));

promiseTest('LazyValue: TINY-6107: LazyValues.withTimeout - never returns', () => new Promise((resolve, reject) => {
  LazyValues.withTimeout(() => {
  }, 1).get((actual) => {
    eqAsync('should time out', Option.none(), actual, reject, tOption());
    resolve();
  });
}));

promiseTest('LazyValue: TINY-6107: LazyValues.withTimeout - times out before it returns', () => new Promise((resolve, reject) => {
  LazyValues.withTimeout((cb) => {
    setTimeout(() => cb(88), 50);
  }, 1).get((actual) => {
    eqAsync('should timeout', Option.none(), actual, reject, tOption());
    resolve();
  });
}));

promiseTest('LazyValue: TINY-6107: LazyValues.withTimeout - times out after it returns', () => new Promise((resolve, reject) => {
  LazyValues.withTimeout<string>((cb) => {
    setTimeout(() => {
      cb('cat');
    }, 10);
  }, 100).get((actual) => {
    eqAsync('should not timeout', Option.some('cat'), actual, reject, tOption());
    resolve();
  });
}));

