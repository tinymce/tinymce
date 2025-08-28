import { Unicode } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import * as fc from 'fast-check';

import * as ArbNodes from './ArbNodes';
import { ArbitraryDetail, CompositeDetail, StructureDetail } from './ArbSchemaTypes';

const formatting: CompositeDetail = {
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

const inline: CompositeDetail = {
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

const container: CompositeDetail = {
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

const listitem: CompositeDetail = {
  type: 'composite',
  recursionDepth: 5,
  tag: 'li',
  components: {
    whitespace: { weight: 0.1 },
    anytext: { weight: 0.5 },
    list: { useDepth: true, weight: 1 }
  }
};

const list: CompositeDetail = {
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

const table: StructureDetail = {
  type: 'structure',
  tag: 'table',
  components: {
    caption: { chance: 0.4 },
    tbody: { chance: 1.0 },
    thead: { chance: 0.2 },
    tfoot: { chance: 0.2 }
  }
};

const tbody: CompositeDetail = {
  type: 'composite',
  tag: 'tbody',
  components: {
    tr: { weight: 1.5 },
    whitespace: { weight: 0.1 }
  }
};

const thead: CompositeDetail = {
  type: 'composite',
  tag: 'thead',
  components: {
    tr: { weight: 1.5 },
    whitespace: { weight: 0.1 }
  }
};

const tfoot: CompositeDetail = {
  type: 'composite',
  tag: 'tfoot',
  components: {
    tr: { weight: 1.5 },
    whitespace: { weight: 0.1 }
  }
};

const tr: CompositeDetail = {
  type: 'composite',
  tag: 'tr',
  components: {
    whitespace: { weight: 0.5 },
    tablecell: { weight: 3.5 }
  }
};

const tablecell: CompositeDetail = {
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

const caption: CompositeDetail = {
  type: 'composite',
  tag: 'caption',
  components: {
    netext: { weight: 0.5 },
    anytext: { weight: 0.5 },
    whitespace: { weight: 1.0 }
  }
};

const image: ArbitraryDetail<SugarElement<HTMLElement>> = {
  type: 'arbitrary',
  // INVESTIGATE: Represent these without this import (not sure if good idea)
  component: ArbNodes.elementOfArb(fc.constantFrom('img'))
};

const netext: ArbitraryDetail<SugarElement<Text>> = {
  type: 'arbitrary',
  component: ArbNodes.textOfArb(fc.string({ minLength: 1 }))
};

const anytext: ArbitraryDetail<SugarElement<Text>> = {
  type: 'arbitrary',
  component: ArbNodes.textOfArb(fc.string())
};

// TODO: Br?
const whitespace: ArbitraryDetail<SugarElement<Text>> = {
  type: 'arbitrary',
  component: ArbNodes.textOfArb(fc.constantFrom(' ', '\n'))
};

const zerowidth: ArbitraryDetail<SugarElement<Text>> = {
  type: 'arbitrary',
  component: ArbNodes.textOfArb(fc.constant(Unicode.zeroWidth))
};

const zerowidths: ArbitraryDetail<SugarElement<Text>> = {
  type: 'arbitrary',
  component: ArbNodes.textOfArb(fc.constantFrom('\u200B', Unicode.zeroWidth))
};

const comment: ArbitraryDetail<SugarElement<Comment>> = {
  type: 'arbitrary',
  component: ArbNodes.comment
};

export const ArbSchema = {
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

export type ArbSchema = typeof ArbSchema;
