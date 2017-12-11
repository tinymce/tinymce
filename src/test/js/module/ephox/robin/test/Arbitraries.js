import { Arr } from '@ephox/katamari';
import Jsc from '@ephox/wrap-jsverify';

var getIds = function (item, predicate) {
  var rest = Arr.bind(item.children || [ ], function (id) { return getIds(id, predicate); });
  var self = predicate(item) && item.id !== 'root' ? [ item.id ] : [ ];
  return self.concat(rest);
};

var textIds = function (universe) {
  return getIds(universe.get(), universe.property().isText);
};

var arbTextIds = function (universe) {
  var ids = textIds(universe);
  return Jsc.elements(textIds(universe)).smap(function (id) {
    return {
      startId: id,
      textIds: ids
    };
  }, function (obj) {
    return obj.startId;
  });
};

var arbIds = function (universe, predicate) {
  var ids = getIds(universe.get(), predicate);

  return Jsc.elements(ids).smap(function (id) {
    return {
      startId: id,
      ids: ids
    };
  }, function (obj) {
    return obj.startId;
  }, function (obj) {
    return '[id :: ' + obj.startId + ']';
  });
};

var arbRangeIds = function (universe, predicate) {
  var ids = getIds(universe.get(), predicate);

  var generator = Jsc.integer(0, ids.length - 1).generator.flatMap(function (startIndex) {
    return Jsc.integer(startIndex, ids.length - 1).generator.map(function (finishIndex) {
      return {
        startId: ids[startIndex],
        finishId: ids[finishIndex],
        ids: ids
      };
    });
  });

  return Jsc.bless({
    generator: generator
  });
};

export default <any> {
  arbTextIds: arbTextIds,
  arbRangeIds: arbRangeIds,
  arbIds: arbIds
};