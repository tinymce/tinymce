import Detach from './Detach';
import Locator from './Locator';
import Up from './Up';
import { Arr } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

var before = function (anchor, item) {
  anchor.parent.each(function (parent) {
    var index = Locator.indexIn(parent, anchor);

    var detached = Detach.detach(Up.top(anchor), item).getOr(item);
    detached.parent = Option.some(parent);
    index.each(function (ind) {
      parent.children = parent.children.slice(0, ind).concat([detached]).concat(parent.children.slice(ind));
    });
  });
};

var after = function (anchor, item) {
  anchor.parent.each(function (parent) {
    var index = Locator.indexIn(parent, anchor);

    var detached = Detach.detach(Up.top(anchor), item).getOr(item);
    detached.parent = Option.some(parent);
    index.each(function (ind) {
      parent.children = parent.children.slice(0, ind + 1).concat([detached]).concat(parent.children.slice(ind + 1));
    });
  });
};

var append = function (parent, item) {
  var detached = Detach.detach(Up.top(parent), item).getOr(item);
  parent.children = parent.children || [];
  parent.children = parent.children.concat([ detached ]);
  detached.parent = Option.some(parent);
};

var appendAll = function (parent, items) {
  Arr.map(items, function (item) {
    append(parent, item);
  });
};

var afterAll = function (anchor, items) {
  anchor.parent.each(function (parent) {
    var index = Locator.indexIn(parent, anchor);

    var detached = Arr.map(items, function (item) {
      var ditem = Detach.detach(Up.top(anchor), item).getOr(item);
      ditem.parent = Option.some(parent);
      return ditem;
    });
    index.each(function (ind) {
      parent.children = parent.children.slice(0, ind + 1).concat(detached).concat(parent.children.slice(ind + 1));
    });
  });
};

var prepend = function (parent, item) {
  var detached = Detach.detach(Up.top(parent), item).getOr(item);
  parent.children = parent.children || [];
  parent.children = [detached].concat(parent.children);
  detached.parent = Option.some(parent);
};

var wrap = function (anchor, wrapper) {
  // INVESTIGATE: At this stage, mutation is necessary to act like the DOM
  anchor.parent.each(function (parent) {
    wrapper.parent = Option.some(parent);
    parent.children = Arr.map(parent.children || [], function (c) {
      return c === anchor ? wrapper : c;
    });
    wrapper.children = [ anchor ];
    anchor.parent = Option.some(wrapper);
  });
};

export default <any> {
  before: before,
  after: after,
  afterAll: afterAll,
  append: append,
  appendAll: appendAll,
  prepend: prepend,
  wrap: wrap
};