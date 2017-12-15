import Arr from 'ephox/katamari/api/Arr';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest } from '@ephox/bedrock';

UnitTest.test('ArrHeadLastTest', function() {
  Jsc.property('Head and tail on arrays', '[json]', function(xs) {
    var head = Arr.head(xs);
    var last = Arr.last(xs);

    if (xs.length > 1) {
      return head.getOrDie('Should be some.') === xs[0] && last.getOrDie('Should be some.') === xs[xs.length - 1];
    } else if (xs.length === 1) {
      return head.getOrDie('Should be some.') === last.getOrDie('Should be some.');
    } else {
      return head.isNone() && last.isNone();
    }
  });
});

