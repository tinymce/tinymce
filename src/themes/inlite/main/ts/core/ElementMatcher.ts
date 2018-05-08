/**
 * ElementMatcher.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Matcher from './Matcher';
import Measure from './Measure';
import { GeomRect } from 'tinymce/core/api/geom/Rect';

// element :: Element, [PredicateId] -> (Editor -> Matcher.result | Null)
const element = function (element: HTMLElement, predicateIds) {
  return function (editor) {
    for (let i = 0; i < predicateIds.length; i++) {
      if (predicateIds[i].predicate(element)) {
        const result: {id: string, rect: GeomRect} = Matcher.result(predicateIds[i].id, Measure.getElementRect(editor, element));
        return result;
      }
    }

    return null;
  };
};

// parent :: [Elements], [PredicateId] -> (Editor -> Matcher.result | Null)
const parent = function (elements: HTMLElement[], predicateIds) {
  return function (editor) {
    for (let i = 0; i < elements.length; i++) {
      for (let x = 0; x < predicateIds.length; x++) {
        if (predicateIds[x].predicate(elements[i])) {
          return Matcher.result(predicateIds[x].id, Measure.getElementRect(editor, elements[i]));
        }
      }
    }

    return null;
  };
};

export default {
  element,
  parent
};
