import Find from '../search/Find';
import Sleuth from '../search/Sleuth';

var findall = function (input, pattern) {
  return Find.all(input, pattern);
};

var findmany = function (input, targets) {
  return Sleuth.search(input, targets);
};

export default <any> {
  findall: findall,
  findmany: findmany
};