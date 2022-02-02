/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Optional } from '@ephox/katamari';
import { Compare, Css, PredicateFind, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

const candidatesArray = [ '9px', '10px', '11px', '12px', '14px', '16px', '18px', '20px', '24px', '32px', '36px' ];

const defaultSize = 'medium';
const defaultIndex = 2;

const indexToSize = (index): Optional<string> =>
  Optional.from(candidatesArray[index]);

const sizeToIndex = (size): Optional<number> =>
  Arr.findIndex(candidatesArray, (v) => v === size);

const getRawOrComputed = (isRoot: (e: SugarElement<Node>) => boolean, rawStart: SugarElement<any>): string => {
  const optStart = SugarNode.isElement(rawStart) ? Optional.some(rawStart) : Traverse.parent(rawStart).filter(SugarNode.isElement);
  return optStart.map((start) => {
    const inline = PredicateFind.closest(start, (elem) => Css.getRaw(elem, 'font-size').isSome(), isRoot)
      .bind((elem) => Css.getRaw(elem, 'font-size'));

    return inline.getOrThunk(() => Css.get(start, 'font-size'));
  }).getOr('');
};

const getSize = (editor: Editor): string => {
  // This was taken from the tinymce approach (FontInfo is unlikely to be global)
  const node = editor.selection.getStart();
  const elem = SugarElement.fromDom(node);
  const root = SugarElement.fromDom(editor.getBody());

  const isRoot = (e) => Compare.eq(root, e);

  const elemSize = getRawOrComputed(isRoot, elem);
  return Arr.find(candidatesArray, (size) => elemSize === size).getOr(defaultSize);
};

const applySize = (editor: Editor, value: string): void => {
  const currentValue = getSize(editor);
  if (currentValue !== value) {
    editor.execCommand('fontSize', false, value);
  }
};

const get = (editor: Editor): number => {
  const size = getSize(editor);
  return sizeToIndex(size).getOr(defaultIndex);
};

const apply = (editor: Editor, index: number): void => {
  indexToSize(index).each((size) => {
    applySize(editor, size);
  });
};

const candidates = Fun.constant(candidatesArray);

export {
  candidates,
  get,
  apply
};
