import { Option } from '@ephox/katamari';

export interface Universe<E, D> {
  up: () => {
    selector: (scope: E, selector: string, isRoot?: (e: E) => boolean) => Option<E>;
    closest: (scope: E, selector: string, isRoot?: (e: E) => boolean) => Option<E>;
    predicate: (scope: E, predicate: (e: E) => boolean, isRoot?: (e: E) => boolean) => Option<E>;
    all: (element: E, isRoot?: (e: E) => boolean) => E[];
  };
  down: () => {
    selector: (scope: E, selector: string) => E[];
    predicate: (scope: E, predicate: (e: E) => boolean) => E[];
  };
  styles: () => {
    get: (element: E, property: string) => string;
    getRaw: (element: E, property: string) => Option<string>;
    set: (element: E, property: string, value: string) => void;
    remove: (element: E, property: string) => void;
  };
  attrs: () => {
    get: (element: E, key: string) => string;
    set: (element: E, key: string, value: string | number | boolean) => void;
    remove: (element: E, key: string) => void;
    copyTo: (source: E, destination: E) => void;
  };
  insert: () => {
    before: (marker: E, element: E) => void;
    after: (marker: E, element: E) => void;
    afterAll: (marker: E, elements: E[]) => void;
    append: (parent: E, element: E) => void;
    appendAll: (parent: E, elements: E[]) => void;
    prepend: (parent: E, element: E) => void;
    wrap: (element: E, wrapper: E) => void;
  };
  remove: () => {
    unwrap: (wrapper: E) => void;
    remove: (element: E) => void;
  };
  create: () => {
    nu: (tag: string, scope?: D) => E;
    clone: (element: E) => E;
    text: (text: string, scope?: D) => E;
  };
  query: () => {
    comparePosition: (element: E, other: E) => number;
    prevSibling: (element: E) => Option<E>;
    nextSibling: (element: E) => Option<E>;
  };
  property: () => {
    children: (element: E) => E[];
    name: (element: E) => string;
    parent: (element: E) => Option<E>;
    document: (element: E) => D;
    isText: (element: E) => boolean;
    isComment: (element: E) => boolean;
    isElement: (element: E) => boolean;
    getText: (element: E) => string;
    setText: (element: E, value: string) => void;
    isBoundary: (element: E) => boolean;
    isEmptyTag: (element: E) => boolean;
  };
  eq: (e1: E, e2: E) => boolean;
  is: (element: E, selector: string) => boolean;
}