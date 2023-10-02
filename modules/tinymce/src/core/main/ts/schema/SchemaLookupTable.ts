import { Arr, Fun } from '@ephox/katamari';

import * as SchemaElementSets from './SchemaElementSets';
import { SchemaType } from './SchemaTypes';
import * as SchemaUtils from './SchemaUtils';

export interface SchemaLookupTable {
  [key: string]: {
    attributes: Record<string, {}>;
    attributesOrder: string[];
    children: Record<string, {}>;
  };
}

export const makeSchema = (type: SchemaType): SchemaLookupTable => {
  const { globalAttributes, phrasingContent, flowContent } = SchemaElementSets.getElementSetsAsStrings(type);
  const schema: SchemaLookupTable = {};

  const addElement = (name: string, attributes: string[], children: string[]) => {
    schema[name] = {
      attributes: Arr.mapToObject(attributes, Fun.constant({})),
      attributesOrder: attributes,
      children: Arr.mapToObject(children, Fun.constant({}))
    };
  };

  const add = (name: string, attributes: string = '', children: string = '') => {
    const childNames = SchemaUtils.split(children);
    const names = SchemaUtils.split(name);
    let ni = names.length;
    const allAttributes = SchemaUtils.split([ globalAttributes, attributes ].join(' '));
    while (ni--) {
      addElement(names[ni], allAttributes.slice(), childNames);
    }
  };

  const addAttrs = (name: string, attributes?: string) => {
    const names = SchemaUtils.split(name);
    const attrs = SchemaUtils.split(attributes);
    let ni = names.length;
    while (ni--) {
      const schemaItem = schema[names[ni]];
      for (let i = 0, l = attrs.length; i < l; i++) {
        schemaItem.attributes[attrs[i]] = {};
        schemaItem.attributesOrder.push(attrs[i]);
      }
    }
  };

  if (type !== 'html5-strict') {
    const html4PhrasingContent = 'acronym applet basefont big font strike tt';

    Arr.each(SchemaUtils.split(html4PhrasingContent), (name) => {
      add(name, '', phrasingContent);
    });

    const html4BlockContent = 'center dir isindex noframes';

    Arr.each(SchemaUtils.split(html4BlockContent), (name) => {
      add(name, '', flowContent);
    });
  }

  // HTML4 base schema TODO: Move HTML5 specific attributes to HTML5 specific if statement
  // Schema items <element name>, <specific attributes>, <children ..>
  add('html', 'manifest', 'head body');
  add('head', '', 'base command link meta noscript script style title');
  add('title hr noscript br');
  add('base', 'href target');
  add('link', 'href rel media hreflang type sizes hreflang');
  add('meta', 'name http-equiv content charset');
  add('style', 'media type scoped');
  add('script', 'src async defer type charset');
  add('body', 'onafterprint onbeforeprint onbeforeunload onblur onerror onfocus ' +
    'onhashchange onload onmessage onoffline ononline onpagehide onpageshow ' +
    'onpopstate onresize onscroll onstorage onunload', flowContent);
  add('dd div', '', flowContent);
  add('address dt caption', '', type === 'html4' ? phrasingContent : flowContent);
  add('h1 h2 h3 h4 h5 h6 pre p abbr code var samp kbd sub sup i b u bdo span legend em strong small s cite dfn', '', phrasingContent);
  add('blockquote', 'cite', flowContent);
  add('ol', 'reversed start type', 'li');
  add('ul', '', 'li');
  add('li', 'value', flowContent);
  add('dl', '', 'dt dd');
  add('a', 'href target rel media hreflang type', type === 'html4' ? phrasingContent : flowContent);
  add('q', 'cite', phrasingContent);
  add('ins del', 'cite datetime', flowContent);
  add('img', 'src sizes srcset alt usemap ismap width height');
  add('iframe', 'src name width height', flowContent);
  add('embed', 'src type width height');
  add('object', 'data type typemustmatch name usemap form width height', [ flowContent, 'param' ].join(' '));
  add('param', 'name value');
  add('map', 'name', [ flowContent, 'area' ].join(' '));
  add('area', 'alt coords shape href target rel media hreflang type');
  add('table', 'border', 'caption colgroup thead tfoot tbody tr' + (type === 'html4' ? ' col' : ''));
  add('colgroup', 'span', 'col');
  add('col', 'span');
  add('tbody thead tfoot', '', 'tr');
  add('tr', '', 'td th');
  add('td', 'colspan rowspan headers', flowContent);
  add('th', 'colspan rowspan headers scope abbr', flowContent);
  add('form', 'accept-charset action autocomplete enctype method name novalidate target', flowContent);
  add('fieldset', 'disabled form name', [ flowContent, 'legend' ].join(' '));
  add('label', 'form for', phrasingContent);
  add('input', 'accept alt autocomplete checked dirname disabled form formaction formenctype formmethod formnovalidate ' +
    'formtarget height list max maxlength min multiple name pattern readonly required size src step type value width'
  );
  add('button', 'disabled form formaction formenctype formmethod formnovalidate formtarget name type value',
    type === 'html4' ? flowContent : phrasingContent);
  add('select', 'disabled form multiple name required size', 'option optgroup');
  add('optgroup', 'disabled label', 'option');
  add('option', 'disabled label selected value');
  add('textarea', 'cols dirname disabled form maxlength name readonly required rows wrap');
  add('menu', 'type label', [ flowContent, 'li' ].join(' '));
  add('noscript', '', flowContent);

  // Extend with HTML5 elements
  if (type !== 'html4') {
    add('wbr');
    add('ruby', '', [ phrasingContent, 'rt rp' ].join(' '));
    add('figcaption', '', flowContent);
    add('mark rt rp bdi', '', phrasingContent);
    add('summary', '', [ phrasingContent, 'h1 h2 h3 h4 h5 h6' ].join(' '));
    add('canvas', 'width height', flowContent);
    add('video', 'src crossorigin poster preload autoplay mediagroup loop ' +
      'muted controls width height buffered', [ flowContent, 'track source' ].join(' '));
    add('audio', 'src crossorigin preload autoplay mediagroup loop muted controls ' +
      'buffered volume', [ flowContent, 'track source' ].join(' '));
    add('picture', '', 'img source');
    add('source', 'src srcset type media sizes');
    add('track', 'kind src srclang label default');
    add('datalist', '', [ phrasingContent, 'option' ].join(' '));
    add('article section nav aside main header footer', '', flowContent);
    add('hgroup', '', 'h1 h2 h3 h4 h5 h6');
    add('figure', '', [ flowContent, 'figcaption' ].join(' '));
    add('time', 'datetime', phrasingContent);
    add('dialog', 'open', flowContent);
    add('command', 'type label icon disabled checked radiogroup command');
    add('output', 'for form name', phrasingContent);
    add('progress', 'value max', phrasingContent);
    add('meter', 'value min max low high optimum', phrasingContent);
    add('details', 'open', [ flowContent, 'summary' ].join(' '));
    add('keygen', 'autofocus challenge disabled form keytype name');

    // SVGs only support a subset of the global attributes
    addElement('svg', 'id tabindex lang xml:space class style x y width height viewBox preserveAspectRatio zoomAndPan transform'.split(' '), []);
  }

  // Extend with HTML4 attributes unless it's html5-strict
  if (type !== 'html5-strict') {
    addAttrs('script', 'language xml:space');
    addAttrs('style', 'xml:space');
    addAttrs('object', 'declare classid code codebase codetype archive standby align border hspace vspace');
    addAttrs('embed', 'align name hspace vspace');
    addAttrs('param', 'valuetype type');
    addAttrs('a', 'charset name rev shape coords');
    addAttrs('br', 'clear');
    addAttrs('applet', 'codebase archive code object alt name width height align hspace vspace');
    addAttrs('img', 'name longdesc align border hspace vspace');
    addAttrs('iframe', 'longdesc frameborder marginwidth marginheight scrolling align');
    addAttrs('font basefont', 'size color face');
    addAttrs('input', 'usemap align');
    addAttrs('select');
    addAttrs('textarea');
    addAttrs('h1 h2 h3 h4 h5 h6 div p legend caption', 'align');
    addAttrs('ul', 'type compact');
    addAttrs('li', 'type');
    addAttrs('ol dl menu dir', 'compact');
    addAttrs('pre', 'width xml:space');
    addAttrs('hr', 'align noshade size width');
    addAttrs('isindex', 'prompt');
    addAttrs('table', 'summary width frame rules cellspacing cellpadding align bgcolor');
    addAttrs('col', 'width align char charoff valign');
    addAttrs('colgroup', 'width align char charoff valign');
    addAttrs('thead', 'align char charoff valign');
    addAttrs('tr', 'align char charoff valign bgcolor');
    addAttrs('th', 'axis align char charoff valign nowrap bgcolor width height');
    addAttrs('form', 'accept');
    addAttrs('td', 'abbr axis scope align char charoff valign nowrap bgcolor width height');
    addAttrs('tfoot', 'align char charoff valign');
    addAttrs('tbody', 'align char charoff valign');
    addAttrs('area', 'nohref');
    addAttrs('body', 'background bgcolor text link vlink alink');
  }

  // Extend with HTML5 attributes unless it's html4
  if (type !== 'html4') {
    addAttrs('input button select textarea', 'autofocus');
    addAttrs('input textarea', 'placeholder');
    addAttrs('a', 'download');
    addAttrs('link script img', 'crossorigin');
    addAttrs('img', 'loading');
    addAttrs('iframe', 'sandbox seamless allow allowfullscreen loading'); // Excluded: srcdoc
  }

  // Special: iframe, ruby, video, audio, label
  if (type !== 'html4') {
    // Video/audio elements cannot have nested children
    Arr.each([ schema.video, schema.audio ], (item) => {
      delete item.children.audio;
      delete item.children.video;
    });
  }

  // Delete children of the same name from it's parent
  // For example: form can't have a child of the name form
  Arr.each(SchemaUtils.split('a form meter progress dfn'), (name) => {
    if (schema[name]) {
      delete schema[name].children[name];
    }
  });

  // Delete header, footer, sectioning and heading content descendants
  /* each('dt th address', function(name) {
   delete schema[name].children[name];
   });*/

  // Caption can't have tables
  delete schema.caption.children.table;

  // Delete scripts by default due to possible XSS
  delete schema.script;

  // TODO: LI:s can only have value if parent is OL

  return schema;
};
