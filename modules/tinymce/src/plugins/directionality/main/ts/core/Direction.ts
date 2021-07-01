/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optional } from '@ephox/katamari';
import { Traverse, Attribute, SugarElement, SugarNode } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

type Dir = 'rtl' | 'ltr';

const isListItem = SugarNode.isTag('li');

const getParentElementWithDir = (element: SugarElement<Element>): Optional<SugarElement<Element>> => {
  const parents = Traverse.parents(element).filter((e) => {
    return SugarNode.isHTMLElement(e) &&
      !isListItem(e) &&
      (Attribute.get(e, 'dir') === 'ltr' || Attribute.get(e, 'dir') === 'rtl');
  });

  return parents.length > 0 ? Optional.from(parents[0] as SugarElement<Element>) : Optional.none();
};

const setDir = (editor: Editor, dir: Dir) => {
  const selectedBlocks = editor.selection.getSelectedBlocks();
  if (selectedBlocks.length > 0) {
    Arr.each(selectedBlocks, (block) => {
      const sugarBlock = SugarElement.fromDom(block);
      if (isListItem(sugarBlock)) {
        const sugarBlockParent = Traverse.parent(sugarBlock).filter(SugarNode.isHTMLElement);
        sugarBlockParent.each((parent) => {
          const sugarBlockParentWithDir = getParentElementWithDir(parent);
          sugarBlockParentWithDir.fold(
            () => {
              Attribute.remove(sugarBlock, 'dir'); // li should not have dir
              Attribute.set(parent, 'dir', dir);
            },
            (parentWithDir) => {
              if (Attribute.get(parentWithDir, 'dir') === dir) {
                Attribute.remove(parent, 'dir');
              } else {
                Attribute.set(parent, 'dir', dir);
              }
            }
          );
        });
      } else {
        const sugarBlockParentWithDir = getParentElementWithDir(sugarBlock);
        sugarBlockParentWithDir.fold(
          () => Attribute.set(sugarBlock, 'dir', dir),
          (parentWithDir) => {
            if (Attribute.get(parentWithDir, 'dir') === dir) {
              Attribute.remove(sugarBlock, 'dir');
            } else {
              Attribute.set(sugarBlock, 'dir', dir);
            }
          }
        );
      }
    });

    editor.nodeChanged();
  }
};

export {
  setDir
};
