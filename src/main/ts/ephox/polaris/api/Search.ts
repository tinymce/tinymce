import Find from '../search/Find';
import Sleuth from '../search/Sleuth';

const findall = function (input, pattern) {
  return Find.all(input, pattern);
};

const findmany = function (input, targets) {
  return Sleuth.search(input, targets);
};

export default {
  findall,
  findmany
};