/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Matcher from './Matcher';
import Measure from './Measure';
import { GeomRect } from 'tinymce/core/api/geom/Rect';
import { HTMLElement } from '@ephox/dom-globals';

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
