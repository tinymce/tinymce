import Jsc from '@ephox/wrap-jsverify';

import * as ArbNodes from './ArbNodes';
import { Unicode } from '@ephox/katamari';

const formatting = {
  type: 'composite',
  tags: {
    p: { weight: 1 },
    h1: { weight: 1 }
  },
  components: {
    anytext: { weight: 0.5 },
    netext: { weight: 0.5 },
    inline: { weight: 1.0 },
    whitespace: { weight: 1.6 }
  }
};

const inline = {
  type: 'composite',
  recursionDepth: 3,
  // Underline, strikethrough
  tags: {
    'span-strikethrough': { weight: 1, styles: { 'text-decoration': 'line-through' }},
    'span': { weight: 1 },
    'font': { weight: 0 },
    'em': { weight: 1 },
    'strong': { weight: 1 },
    'b': { weight: 1 },
    'i': { weight: 1 },
    'span-underline': { weight: 1, styles: { 'text-decoration': 'underline' }}
  },
  components: {
    anytext: { weight: 0.5 },
    netext: { weight: 0.5 },
    inline: { useDepth: true, weight: 1.0 },
    _: { weight: 5.0 }
  }
};

const container = {
  type: 'composite',
  recursionDepth: 3,
  tags: {
    div: { weight: 1 },
    blockquote: { weight: 1 }
  },
  components: {
    anytext: { weight: 0.5 },
    netext: { weight: 0.5 },
    inline: { weight: 1.0 },
    container: { weight: 0.4, useDepth: true },
    _: { weight: 0.5 }
  }
};

const listitem = {
  type: 'composite',
  recursionDepth: 5,
  tag: 'li',
  components: {
    whitespace: { weight: 0.1 },
    anytext: { weight: 0.5 },
    list: { useDepth: true, weight: 1 }
  }
};

const list = {
  type: 'composite',
  recursionDepth: 5,
  tags: {
    ol: { weight: 1.0 },
    ul: { weight: 1.0 }
  },
  components: {
    listitem: { weight: 1, useDepth: true },
    whitespace: { weight: 1 }
  }
};

const table = {
  type: 'structure',
  tag: 'table',
  components: {
    caption: { chance: 0.4 },
    tbody: { chance: 1.0 },
    thead: { chance: 0.2 },
    tfoot: { chance: 0.2 }
  }
};

const tbody = {
  type: 'composite',
  tag: 'tbody',
  components: {
    tr: { weight: 1.5 },
    whitespace: { weight: 0.1 }
  }
};

const thead = {
  type: 'composite',
  tag: 'thead',
  components: {
    tr: { weight: 1.5 },
    whitespace: { weight: 0.1 }
  }
};

const tfoot = {
  type: 'composite',
  tag: 'tfoot',
  components: {
    tr: { weight: 1.5 },
    whitespace: { weight: 0.1 }
  }
};

const tr = {
  type: 'composite',
  tag: 'tr',
  components: {
    whitespace: { weight: 0.5 },
    tablecell: { weight: 3.5 }
  }
};

const tablecell = {
  type: 'composite',
  tags: {
    th: { weight: 1.0 },
    td: { weight: 1.0 }
  },
  components: {
    netext: { weight: 0.5 },
    anytext: { weight: 0.5 },
    whitespace: { weight: 1.0 }
  }
};

const caption = {
  type: 'composite',
  tag: 'caption',
  components: {
    netext: { weight: 0.5 },
    anytext: { weight: 0.5 },
    whitespace: { weight: 1.0 }
  }
};

const image = {
  type: 'arbitrary',
  // INVESTIGATE: Represent these without this import (not sure if good idea)
  component: ArbNodes.elementOfArb(Jsc.elements([ 'img' ]))
};

const netext = {
  type: 'arbitrary',
  component: ArbNodes.textOfArb(Jsc.nestring)
};

const anytext = {
  type: 'arbitrary',
  component: ArbNodes.textOfArb(Jsc.string)
};

// TODO: Br?
const whitespace = {
  type: 'arbitrary',
  component: ArbNodes.textOfArb(Jsc.elements([ ' ', '\n' ]))
};

const zerowidth = {
  type: 'arbitrary',
  component: ArbNodes.textOfArb(Jsc.constant(Unicode.zeroWidth))
};

const zerowidths = {
  type: 'arbitrary',
  component: ArbNodes.textOfArb(Jsc.elements([ '\u200B', Unicode.zeroWidth ]))
};

const comment = {
  type: 'arbitrary',
  component: ArbNodes.comment
};

export {
  whitespace,
  formatting,
  inline,
  netext,
  anytext,
  container,
  listitem,
  list,
  table,
  tbody,
  thead,
  tfoot,
  tr,
  tablecell,
  caption,
  image,
  comment,
  zerowidth,
  zerowidths
};
