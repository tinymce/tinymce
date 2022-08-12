import { Type } from '@ephox/katamari';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import AstNode from 'tinymce/core/api/html/Node';
import Schema from 'tinymce/core/api/html/Schema';
import HtmlSerializer from 'tinymce/core/api/html/Serializer';

import { Parser } from './Parser';
import { MediaData } from './Types';

const DOM = DOMUtils.DOM;

const addPx = (value: string): string =>
  /^[0-9.]+$/.test(value) ? (value + 'px') : value;

const updateEphoxEmbed = (data: Partial<MediaData>, node: AstNode) => {
  const style = node.attr('style');
  const styleMap = style ? DOM.parseStyle(style) : { };
  if (Type.isNonNullable(data.width)) {
    styleMap['max-width'] = addPx(data.width);
  }
  if (Type.isNonNullable(data.height)) {
    styleMap['max-height'] = addPx(data.height);
  }
  node.attr('style', DOM.serializeStyle(styleMap));
};

const sources = [ 'source', 'altsource' ] as const;

type Source = typeof sources[number];
type SourceMime = `${Source}mime`;

const updateHtml = (html: string, data: Partial<MediaData>, updateAll?: boolean, schema?: Schema): string => {
  let numSources = 0;
  let sourceCount = 0;

  const parser = Parser(schema);
  parser.addNodeFilter('source', (nodes) => numSources = nodes.length);
  const rootNode = parser.parse(html);

  for (let node: AstNode | null | undefined = rootNode; node; node = node.walk()) {
    if (node.type === 1) {
      const name = node.name;

      if (node.attr('data-ephox-embed-iri')) {
        updateEphoxEmbed(data, node);
        // Don't continue to update if we find an EME embed
        break;
      } else {
        switch (name) {
          case 'video':
          case 'object':
          case 'embed':
          case 'img':
          case 'iframe':
            if (data.height !== undefined && data.width !== undefined) {
              node.attr('width', data.width);
              node.attr('height', data.height);
            }
            break;
        }

        if (updateAll) {
          switch (name) {
            case 'video':
              node.attr('poster', data.poster);
              node.attr('src', null);

              // Add <source> child elements
              for (let index = numSources; index < 2; index++) {
                if (data[sources[index]]) {
                  const source = new AstNode('source', 1);
                  source.attr('src', data[sources[index]]);
                  source.attr('type', data[sources[index] + 'mime' as SourceMime] || null);
                  node.append(source);
                }
              }
              break;

            case 'iframe':
              node.attr('src', data.source);
              break;

            case 'object':
              const hasImage = node.getAll('img').length > 0;
              if (data.poster && !hasImage) {
                node.attr('src', data.poster);

                const img = new AstNode('img', 1);
                img.attr('src', data.poster);
                img.attr('width', data.width);
                img.attr('height', data.height);
                node.append(img);
              }
              break;

            case 'source':
              if (sourceCount < 2) {
                node.attr('src', data[sources[sourceCount]]);
                node.attr('type', data[sources[sourceCount] + 'mime' as SourceMime] || null);

                if (!data[sources[sourceCount]]) {
                  node.remove();
                  continue;
                }
              }
              sourceCount++;
              break;

            case 'img':
              if (!data.poster) {
                node.remove();
              }
              break;
          }
        }
      }
    }
  }

  return HtmlSerializer({}, schema).serialize(rootNode);
};

export {
  updateHtml
};
