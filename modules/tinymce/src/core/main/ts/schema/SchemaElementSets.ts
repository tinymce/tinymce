import { SchemaType } from './SchemaTypes';

export interface ElementSets<T> {
  blockContent: T;
  phrasingContent: T;
  flowContent: T;
}

// Missing elements in `phrasing` compared to HTML5 spec at 2024-01-30 (timestamped since spec is constantly evolving)
//  area - required to be inside a map element so we should not add it to all elements.
//  link - required to be in the body so we should not add it to all elements.
//  math - currently not supported.
//  meta - Only allowed if the `itemprop` attribute is set so very special.
//  slot - We only want these to be accepted in registered custom components.
//  template - Not supported since the HTML inside it is stored in a `content` property fragment so needs special treatment.
// Extra element in `phrasing`: command keygen
//
// Missing elements in `flow` compared to HTML5 spec at 2034-01-30 (timestamped since the spec is constantly evolving)
//  search - Can be both in a block and inline position but is not a transparent element. So not supported at this time.
export const getElementSetsAsStrings = (type: SchemaType): ElementSets<string> => {
  let blockContent: string;
  let phrasingContent: string;

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
    blockContent += ' article aside details dialog figure main header footer hgroup section nav ' + transparentContent;
    phrasingContent += ' audio canvas command data datalist mark meter output picture ' +
      'progress time wbr video ruby bdi keygen svg';
  }

  // Add HTML4 elements unless it's html5-strict
  if (type !== 'html5-strict') {
    const html4PhrasingContent = 'acronym applet basefont big font strike tt';
    phrasingContent = [ phrasingContent, html4PhrasingContent ].join(' ');

    const html4BlockContent = 'center dir isindex noframes';
    blockContent = [ blockContent, html4BlockContent ].join(' ');
  }

  // Flow content elements from the HTML5 spec (block+inline)
  const flowContent = [ blockContent, phrasingContent ].join(' ');

  return { blockContent, phrasingContent, flowContent };
};

export const getElementSets = (type: SchemaType): ElementSets<readonly string[]> => {
  const { blockContent, phrasingContent, flowContent } = getElementSetsAsStrings(type);

  const toArr = (value: string) => {
    return Object.freeze(value.split(' '));
  };

  return Object.freeze({
    blockContent: toArr(blockContent),
    phrasingContent: toArr(phrasingContent),
    flowContent: toArr(flowContent)
  });
};

