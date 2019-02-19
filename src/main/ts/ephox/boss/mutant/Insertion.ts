import { Arr, Option } from '@ephox/katamari';
import { Gene } from '../api/Gene';
import Detach from './Detach';
import Locator from './Locator';
import Up from './Up';

const before = function (anchor: Gene, item: Gene) {
  Option.from(anchor.parent).each(function (parent) {
    const index = Locator.indexIn(parent, anchor);

    const detached = Detach.detach(Up.top(anchor), item).getOr(item);
    detached.parent = parent;
    index.each(function (ind) {
      parent.children = parent.children.slice(0, ind).concat([detached]).concat(parent.children.slice(ind));
    });
  });
};

const after = function (anchor: Gene, item: Gene) {
  Option.from(anchor.parent).each(function (parent) {
    const index = Locator.indexIn(parent, anchor);

    const detached = Detach.detach(Up.top(anchor), item).getOr(item);
    detached.parent = parent;
    index.each(function (ind) {
      parent.children = parent.children.slice(0, ind + 1).concat([detached]).concat(parent.children.slice(ind + 1));
    });
  });
};

const append = function (parent: Gene, item: Gene) {
  const detached = Detach.detach(Up.top(parent), item).getOr(item);
  parent.children = parent.children || [];
  parent.children = parent.children.concat([detached]);
  detached.parent = parent;
};

const appendAll = function (parent: Gene, items: Gene[]) {
  Arr.map(items, function (item) {
    append(parent, item);
  });
};

const afterAll = function (anchor: Gene, items: Gene[]) {
  Option.from(anchor.parent).each(function (parent) {
    const index = Locator.indexIn(parent, anchor);

    const detached = Arr.map(items, function (item) {
      const ditem = Detach.detach(Up.top(anchor), item).getOr(item);
      ditem.parent = parent;
      return ditem;
    });
    index.each(function (ind) {
      parent.children = parent.children.slice(0, ind + 1).concat(detached).concat(parent.children.slice(ind + 1));
    });
  });
};

const prepend = function (parent: Gene, item: Gene) {
  const detached = Detach.detach(Up.top(parent), item).getOr(item);
  parent.children = parent.children || [];
  parent.children = [detached].concat(parent.children);
  detached.parent = parent;
};

const wrap = function (anchor: Gene, wrapper: Gene) {
  // INVESTIGATE: At this stage, mutation is necessary to act like the DOM
  Option.from(anchor.parent).each(function (parent) {
    wrapper.parent = parent;
    parent.children = Arr.map(parent.children || [], function (c) {
      return c === anchor ? wrapper : c;
    });
    wrapper.children = [anchor];
    anchor.parent = wrapper;
  });
};

export default {
  before,
  after,
  afterAll,
  append,
  appendAll,
  prepend,
  wrap
};