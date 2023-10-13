import { SchemaType } from './SchemaTypes';

export interface ElementSets<T> {
  globalAttributes: T;
  blockContent: T;
  phrasingContent: T;
  flowContent: T;
}

export const getElementSetsAsStrings = (type: SchemaType): ElementSets<string> => {
  let globalAttributes: string, blockContent: string;
  let phrasingContent: string;

  // Attributes present on all elements
  globalAttributes = 'id accesskey class dir lang style tabindex title role';

  // Block content elements
  blockContent =
    'address blockquote div dl fieldset form h1 h2 h3 h4 h5 h6 hr menu ol p pre table ul';

  // Phrasing content elements from the HTML5 spec (inline)
  phrasingContent =
    'a abbr b bdo br button cite code del dfn em embed i iframe img input ins kbd ' +
    'label map noscript object q s samp script select small span strong sub sup ' +
    'textarea u var #text #comment';

  // Add HTML5 items to globalAttributes, blockContent, phrasingContent
  if (type !== 'html4') {
    const transparentContent = 'a ins del canvas map';
    globalAttributes += ' contenteditable contextmenu draggable dropzone ' +
      'hidden spellcheck translate';
    blockContent += ' article aside details dialog figure main header footer hgroup section nav ' + transparentContent;
    phrasingContent += ' audio canvas command datalist mark meter output picture ' +
      'progress time wbr video ruby bdi keygen svg';
  }

  // Add HTML4 elements unless it's html5-strict
  if (type !== 'html5-strict') {
    globalAttributes += ' xml:lang';

    const html4PhrasingContent = 'acronym applet basefont big font strike tt';
    phrasingContent = [ phrasingContent, html4PhrasingContent ].join(' ');

    const html4BlockContent = 'center dir isindex noframes';
    blockContent = [ blockContent, html4BlockContent ].join(' ');
  }

  // Flow content elements from the HTML5 spec (block+inline)
  const flowContent = [ blockContent, phrasingContent ].join(' ');

  return { globalAttributes, blockContent, phrasingContent, flowContent };
};
