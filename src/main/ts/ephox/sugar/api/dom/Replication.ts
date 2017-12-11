import Attr from '../properties/Attr';
import Element from '../node/Element';
import Insert from './Insert';
import InsertAll from './InsertAll';
import Remove from './Remove';
import Traverse from '../search/Traverse';

var clone = function (original, deep) {
  return Element.fromDom(original.dom().cloneNode(deep));
};

/** Shallow clone - just the tag, no children */
var shallow = function (original) {
  return clone(original, false);
};

/** Deep clone - everything copied including children */
var deep = function (original) {
  return clone(original, true);
};

/** Shallow clone, with a new tag */
var shallowAs = function (original, tag) {
  var nu = Element.fromTag(tag);

  var attributes = Attr.clone(original);
  Attr.setAll(nu, attributes);

  return nu;
};

/** Deep clone, with a new tag */
var copy = function (original, tag) {
  var nu = shallowAs(original, tag);

  // NOTE
  // previously this used serialisation:
  // nu.dom().innerHTML = original.dom().innerHTML;
  //
  // Clone should be equivalent (and faster), but if TD <-> TH toggle breaks, put it back.

  var cloneChildren = Traverse.children(deep(original));
  InsertAll.append(nu, cloneChildren);

  return nu;
};

/** Change the tag name, but keep all children */
var mutate = function (original, tag) {
  var nu = shallowAs(original, tag);

  Insert.before(original, nu);
  var children = Traverse.children(original);
  InsertAll.append(nu, children);
  Remove.remove(original);
  return nu;
};

export default <any> {
  shallow: shallow,
  shallowAs: shallowAs,
  deep: deep,
  copy: copy,
  mutate: mutate
};