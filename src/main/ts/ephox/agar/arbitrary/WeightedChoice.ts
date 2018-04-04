import { Arr } from '@ephox/katamari';
import { Obj } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Struct } from '@ephox/katamari';
import Jsc from '@ephox/wrap-jsverify';

var weighted = Struct.immutable('list', 'total');

var choose = function (candidates) {
  var result = Arr.foldl(candidates, function (rest, d) {
    var newTotal = rest.total + d.weight;
    var merged = Merger.merge(d, {
      accWeight: newTotal
    });
    return {
      total: newTotal,
      list: rest.list.concat([ merged ])
    };
  }, { list: [ ], total: 0 });

  return weighted(result.list, result.total);
};

var gChoose = function (weighted) {
  return Jsc.number(0, weighted.total()).generator.map(function (w) {
    var raw = Arr.find(weighted.list(), function (d) {
      return w <= d.accWeight;
    });

    var keys = raw.map(Obj.keys).getOr([ ]) as any[];
    return keys.length === [ 'weight', 'accWeight' ].length ? Option.none() : raw;
  });
};

var generator = function (candidates) {
  var list = choose(candidates);
  return gChoose(list);
};

export default {
  generator: generator
};