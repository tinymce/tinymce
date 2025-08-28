import { Obj } from '@ephox/katamari';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import DomParser from 'tinymce/core/api/html/DomParser';
import AstNode from 'tinymce/core/api/html/Node';
import Schema from 'tinymce/core/api/html/Schema';
import Tools from 'tinymce/core/api/util/Tools';

import { MediaData } from './Types';

const DOM = DOMUtils.DOM;

const trimPx = (value: string): string =>
  value.replace(/px$/, '');

const getEphoxEmbedData = (node: AstNode): MediaData => {
  const style = node.attr('style');
  const styles = style ? DOM.parseStyle(style) : { };
  return {
    type: 'ephox-embed-iri',
    source: node.attr('data-ephox-embed-iri') as string,
    altsource: '',
    poster: '',
    width: Obj.get(styles, 'max-width').map(trimPx).getOr(''),
    height: Obj.get(styles, 'max-height').map(trimPx).getOr('')
  };
};

const htmlToData = (html: string, schema?: Schema): MediaData => {
  let data = {} as Partial<MediaData>;

  const parser = DomParser({ validate: false, forced_root_block: false }, schema);
  const rootNode = parser.parse(html);

  for (let node: AstNode | null | undefined = rootNode; node; node = node.walk()) {
    if (node.type === 1) {
      const name = node.name;

      if (node.attr('data-ephox-embed-iri')) {
        data = getEphoxEmbedData(node);
        // Don't continue to collect if we find an EME embed
        break;
      } else {
        if (!data.source && name === 'param') {
          data.source = node.attr('movie');
        }

        if (name === 'iframe' || name === 'object' || name === 'embed' || name === 'video' || name === 'audio') {
          if (!data.type) {
            data.type = name;
          }

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          data = Tools.extend(node.attributes!.map, data);
        }

        if (name === 'source') {
          if (!data.source) {
            data.source = node.attr('src');
          } else if (!data.altsource) {
            data.altsource = node.attr('src');
          }
        }

        if (name === 'img' && !data.poster) {
          data.poster = node.attr('src');
        }
      }
    }
  }

  data.source = data.source || data.src || '';
  data.altsource = data.altsource || '';
  data.poster = data.poster || '';

  return data as MediaData;
};

export {
  htmlToData
};
