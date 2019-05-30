import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Unicode } from '@ephox/katamari';
import WordRange from '../data/WordRange';
import Clustering from '../words/Clustering';

var toEnd = function (cluster, start, soffset) {
  if (cluster.length === 0) return Option.none();
  var last = cluster[cluster.length - 1];
  return Option.some(WordRange(start, soffset, last.item(), last.finish()));
};

var fromStart = function (cluster, finish, foffset) {
  if (cluster.length === 0) return Option.none();
  var first = cluster[0];
  return Option.some(WordRange(first.item(), first.start(), finish, foffset));
};

var all = function (cluster) {
  if (cluster.length === 0) return Option.none();
  var first = cluster[0];
  var last = cluster[cluster.length - 1];
  return Option.some(WordRange(first.item(), first.start(), last.item(), last.finish()));
};

// The optimise parameter is passed through from the API, but it is no longer required.
// Remove optimise as a code quality task: TBIO-4356
var scan = function (universe, item, offset, optimise) {
  var text = universe.property().getText(item);
  var preLength = Arr.filter(text.substring(0, offset), function (s) {
    return s !== Unicode.zeroWidth();
  }).length;
  var postLength = Arr.filter(text.substring(offset, text.length), function (c) {
    return c === Unicode.zeroWidth();
  }).length;

  // We only want to identify words that are all the same language.
  var cluster = Clustering.byLanguage(universe, item);
  // We are at the left edge of the cluster.
  var atLeftEdge = preLength === 0 && cluster.left().length === 0;
  // We are at the right edge of the cluster.
  var atRightEdge = (offset + postLength) === text.length && cluster.right().length === 0;

  return {
    all: cluster.all,
    leftEdge: Fun.constant(atLeftEdge),
    rightEdge: Fun.constant(atRightEdge),
    text: Fun.constant(text)
  };
};


// There was only a break in the node before the current position, so
// as long as we are not already at the right edge of the node AND cluster, we extend to the
// end of the cluster.
var before = function (universe, item, offset, bindex, optimise) {
  var info = scan(universe, item, offset, optimise);
  return info.rightEdge() ? Option.none() : toEnd(info.all(), item, bindex);
};

// There was only a break in the node after the current position, so
// as long as we are not already at the left edge of the node AND cluster, we extend from the
// start of the cluster to the index.
var after = function (universe, item, offset, aindex, optimise) {
  var info = scan(universe, item, offset, optimise);
  return info.leftEdge() ? Option.none() : fromStart(info.all(), item, aindex);
};

// We don't need to use the cluster, because we are in the middle of two breaks. Only return something
// if the breaks aren't at the same position.
var both = function (universe, item, offset, bindex, aindex, _optimise) {
  return bindex === aindex ? Option.none() : Option.some(WordRange(item, bindex, item, aindex));
};

// There are no breaks in the current node, so as long as we aren't at either edge of node/cluster,
// then we extend the length of the cluster.
var neither = function (universe, item, offset, optimise) {
  var info = scan(universe, item, offset, optimise);
  return info.leftEdge() || info.rightEdge() ? Option.none() : all(info.all());
};

export default <any> {
  before: before,
  after: after,
  both: both,
  neither: neither
};