import Attribution from '../mutant/Attribution';
import Comparator from '../mutant/Comparator';
import Creator from '../mutant/Creator';
import Down from '../mutant/Down';
import Insertion from '../mutant/Insertion';
import Locator from '../mutant/Locator';
import Logger from '../mutant/Logger';
import Properties from '../mutant/Properties';
import Query from '../mutant/Query';
import Removal from '../mutant/Removal';
import Styling from '../mutant/Styling';
import Tracks from '../mutant/Tracks';
import Up from '../mutant/Up';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Universe } from './Universe';
import { Gene } from './Gene';

export interface TestUniverseUp extends ReturnType<Universe<Gene, undefined>['up']> {
  top: (element: Gene) => Gene;
}

export interface TestUniverse extends Universe<Gene, undefined> {
  up: () => TestUniverseUp;
  find: (root: Gene, id: string) => Option<Gene>;
  get: () => Gene;
  shortlog: (f?: (e: Gene) => string) => string;
}

export const TestUniverse = function (raw: Gene): TestUniverse {
  let content = Tracks.track(raw, Option.none());

  // NOTE: The top point might change when we are wrapping.
  const wrap = function (anchor: Gene, wrapper: Gene) {
    Insertion.wrap(anchor, wrapper);
    content.parent.fold(Fun.noop, function (p) {
      content = p;
    });
  };

  const find = function (root: Gene, id: string) {
    return Locator.byId(root, id);
  };

  const get = function () {
    return content;
  };

  const shortlog = function (f?: (e: Gene) => string) {
    return f !== undefined ? Logger.custom(content, f) : Logger.basic(content);
  };

  return {
    up: Fun.constant({
      selector: Up.selector,
      closest: Up.closest,
      predicate: Up.predicate,
      all: Up.all,
      top: Up.top
    }),
    down: Fun.constant({
      selector: Down.selector,
      predicate: Down.predicate
    }),
    styles: Fun.constant({
      get: Styling.get,
      set: Styling.set,
      getRaw: Styling.getRaw,
      remove: Styling.remove
    }),
    attrs: Fun.constant({
      get: Attribution.get,
      set: Attribution.set,
      remove: Attribution.remove,
      copyTo: Attribution.copyTo
    }),
    insert: Fun.constant({
      before: Insertion.before,
      after: Insertion.after,
      append: Insertion.append,
      appendAll: Insertion.appendAll,
      afterAll: Insertion.afterAll,
      prepend: Insertion.prepend,
      wrap: wrap
    }),
    remove: Fun.constant({
      unwrap: Removal.unwrap,
      detach: Removal.detach,
      remove: Removal.remove
    }),
    create: Fun.constant({
      nu: Creator.nu,
      text: Creator.text,
      clone: Creator.clone
    }),
    query: Fun.constant({
      comparePosition: Query.comparePosition,
      nextSibling: Query.nextSibling,
      prevSibling: Query.prevSibling
    }),
    property: Fun.constant({
      children: Properties.children,
      name: Properties.name,
      parent: Properties.parent,
      document: Properties.document,
      isText: Properties.isText,
      isComment: Properties.isComment,
      isElement: Properties.isElement,
      setText: Properties.setText,
      getText: Properties.getText,
      isEmptyTag: Properties.isEmptyTag,
      isBoundary: Properties.isBoundary
    }),
    eq: Comparator.eq,
    is: Comparator.is,
    find: find,
    get: get,
    shortlog: shortlog
  };
};