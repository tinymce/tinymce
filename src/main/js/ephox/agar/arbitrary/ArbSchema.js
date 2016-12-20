define(
  'ephox.agar.arbitrary.ArbSchema',

  [
    'ephox.agar.arbitrary.ArbNodes',
    'ephox.wrap-jsverify.Jsc'
  ],

  function (ArbNodes, Jsc) {
    var formatting = {
      type: 'composite',
      tags: {
        'p': { weight: 1 },
        'h1': { weight: 1 }
      },
      components: {
        anytext: { weight: 0.5 },
        netext: { weight: 0.5 },
        inline: { weight: 1.0 },
        whitespace: { weight: 1.6 }
      }
    };

    var inline = {
      type: 'composite',
      recursionDepth: 3,
      // Underline, strikethrough
      tags: {
        'span-strikethrough': { weight: 1, styles: { 'text-decoration': 'line-through'} },
        'span': { weight: 1 },
        'font': { weight: 0 },
        'em': { weight: 1 },
        'strong': { weight: 1 },
        'b': { weight: 1 },
        'i': { weight: 1 },
        'span-underline': { weight: 1, styles: { 'text-decoration': 'underline' } }
      },
      components: {
        anytext: { weight: 0.5 },
        netext: { weight: 0.5 },
        inline: { useDepth: true, weight: 1.0 },
        '_': { weight: 5.0 }
      }
    };

    var container = {
      type: 'composite',
      recursionDepth: 3,
      tags: {
        'div': { weight: 1 },
        'blockquote': { weight: 1 }
      },
      components: {
        anytext: { weight: 0.5 },
        netext: { weight: 0.5 },
        inline: { weight: 1.0 },
        container: { weight: 0.4, useDepth: true },
        '_': { weight: 0.5 }
      }
    };

    var listitem = {
      type: 'composite',
      recursionDepth: 5,
      tag: 'li',
      components: {
        whitespace: { weight: 0.1 },
        anytext: { weight: 0.5 },
        list: { useDepth: true, weight: 1 }
      }
    };

    var list = {
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

    var table = {
      type: 'structure',
      tag: 'table',
      components: {
        caption: { chance: 0.4 },
        tbody: { chance: 1.0 },
        thead: { chance: 0.2 },
        tfoot: { chance: 0.2 }
      }
    };

    var tbody = {
      type: 'composite',
      tag: 'tbody',
      components: {
        tr: { weight: 1.5 },
        whitespace: { weight: 0.1 }
      }
    };

    var thead = {
      type: 'composite',
      tag: 'thead',
      components: {
        tr: { weight: 1.5 },
        whitespace: { weight: 0.1 }
      }
    };

    var tfoot = {
      type: 'composite',
      tag: 'tfoot',
      components: {
        tr: { weight: 1.5 },
        whitespace: { weight: 0.1 }
      }
    };

    var tr = {
      type: 'composite',
      tag: 'tr',
      components: {
        whitespace: { weight: 0.5 },
        tablecell: { weight: 3.5 }
      }
    };

    var tablecell = {
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

    var caption = {
      type: 'composite',
      tag: 'caption',
      components: {
        netext: { weight: 0.5 },
        anytext: { weight: 0.5 },
        whitespace: { weight: 1.0 }
      }
    };

    var image = {
      type: 'arbitrary',
      // INVESTIGATE: Represent these without this import (not sure if good idea)
      component: ArbNodes.elementOfArb(Jsc.elements([ 'img' ]))
    };
 
    var netext = {
      type: 'arbitrary',
      component: ArbNodes.textOfArb(Jsc.nestring)
    };

    var anytext = {
      type: 'arbitrary',
      component: ArbNodes.textOfArb(Jsc.string)
    };

    // TODO: Br?
    var whitespace = {
      type: 'arbitrary',
      component: ArbNodes.textOfArb(Jsc.elements([ ' ', '\n' ]))
    };

    var zerowidth = {
      type: 'arbitrary',
      component: ArbNodes.textOfArb(Jsc.constant('\uFEFF'))
    };

    var zerowidths = {
      type: 'arbitrary',
      component: ArbNodes.textOfArb(Jsc.elements([ '\u200B', '\uFEFF' ]))
    };

    var comment = {
      type: 'arbitrary',
      component: ArbNodes.comment
    };

    return {
      whitespace: whitespace,
      formatting: formatting,
      inline: inline,
      netext: netext,
      anytext: anytext,
      container: container,
      listitem: listitem,
      list: list,
      table: table,
      tbody: tbody,
      thead: thead,
      tfoot: tfoot,
      tr: tr,
      tablecell: tablecell,
      caption: caption,
      image: image,
      comment: comment,
      zerowidth: zerowidth,
      zerowidths: zerowidths
    };
  }
);