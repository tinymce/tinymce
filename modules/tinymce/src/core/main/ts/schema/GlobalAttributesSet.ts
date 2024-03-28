import { SchemaType } from './SchemaTypes';

export const getGlobalAttributeSet = (type: SchemaType): readonly string[] => {
  return Object.freeze([
    // Present on all schema types
    'id',
    'accesskey',
    'class',
    'dir',
    'lang',
    'style',
    'tabindex',
    'title',
    'role',

    // html5 and html5-strict extra attributes
    ...(
      type !== 'html4' ? [ 'contenteditable', 'contextmenu', 'draggable', 'dropzone', 'hidden', 'spellcheck', 'translate', 'itemprop', 'itemscope', 'itemtype' ] : []
    ),

    // html4 and html5 extra attributes
    ...(type !== 'html5-strict' ? [ 'xml:lang' ] : [])
  ]);
};

