import * as Arr from 'ephox/katamari/api/Arr';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest } from '@ephox/bedrock';

UnitTest.test('MonadLawsTest', function () {
  // return a >>= f ≡ f a
  Jsc.property('Monad law: left identity', 'string', 'string -> [integer]', function (a, f) {
    return Jsc.eq(
      Arr.bind(Arr.pure(a), f),
      f(a)
    );
  });

  // m >>= return ≡ m
  Jsc.property('Monad law: right identity', '[string]', function (m) {
    return Jsc.eq(
      Arr.bind(m, Arr.pure),
      m
    );
  });

  // (m >>= f) >>= g ≡ m >>= (\x -> f x >>= g)
  Jsc.property('Monad law: associativity', '[string]', 'string -> [integer]', 'integer -> [string]', function (m, f, g) {
    return Jsc.eq(
      Arr.bind(Arr.bind(m, f), g),
      Arr.bind(m, function (x) { return Arr.bind(f(x), g); })
    );
  });
});
