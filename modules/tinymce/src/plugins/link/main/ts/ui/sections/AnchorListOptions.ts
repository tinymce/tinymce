import { Arr, Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import { ListItem } from '../DialogTypes';

// NOTE: you currently need anchors in the content for this field to appear

const getAnchors = (editor: Editor): Optional<ListItem[]> => {
  const anchorNodes = editor.dom.select<HTMLAnchorElement>('a:not([href])');
  const anchors = Arr.bind(anchorNodes, (anchor) => {
    const id = anchor.name || anchor.id;
    return id ? [{ text: id, value: '#' + id }] : [ ];
  });

  return anchors.length > 0 ? Optional.some([{ text: 'None', value: '' }].concat(anchors)) : Optional.none();
};

export const AnchorListOptions = {
  getAnchors
};
