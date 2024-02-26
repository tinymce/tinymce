import { Arr, Type } from '@ephox/katamari';

import Env from '../api/Env';
import DomParser, { DomParserSettings } from '../api/html/DomParser';
import AstNode from '../api/html/Node';
import Tools from '../api/util/Tools';
import * as BlobCacheUtils from '../file/BlobCacheUtils';
import * as Embed from './Embed';

const isBogusImage = (img: AstNode): boolean =>
  Type.isNonNullable(img.attr('data-mce-bogus'));

const isInternalImageSource = (img: AstNode): boolean =>
  img.attr('src') === Env.transparentSrc || Type.isNonNullable(img.attr('data-mce-placeholder'));

const registerBase64ImageFilter = (parser: DomParser, settings: DomParserSettings): void => {
  const { blob_cache: blobCache } = settings;
  if (blobCache) {
    const processImage = (img: AstNode): void => {
      const inputSrc = img.attr('src');

      if (isInternalImageSource(img) || isBogusImage(img) || Type.isNullable(inputSrc)) {
        return;
      }

      BlobCacheUtils.dataUriToBlobInfo(blobCache, inputSrc, true).each((blobInfo) => {
        img.attr('src', blobInfo.blobUri());
      });
    };

    parser.addAttributeFilter('src', (nodes) => Arr.each(nodes, processImage));
  }
};

const register = (parser: DomParser, settings: DomParserSettings): void => {
  const schema = parser.schema;

  parser.addAttributeFilter('href', (nodes) => {
    let i = nodes.length;

    const appendRel = (rel: string) => {
      const parts = rel.split(' ').filter((p) => p.length > 0);
      return parts.concat([ 'noopener' ]).sort().join(' ');
    };

    const addNoOpener = (rel: string | undefined) => {
      const newRel = rel ? Tools.trim(rel) : '';
      if (!/\b(noopener)\b/g.test(newRel)) {
        return appendRel(newRel);
      } else {
        return newRel;
      }
    };

    if (!settings.allow_unsafe_link_target) {
      while (i--) {
        const node = nodes[i];
        if (node.name === 'a' && node.attr('target') === '_blank') {
          node.attr('rel', addNoOpener(node.attr('rel')));
        }
      }
    }
  });

  // Force anchor names closed, unless the setting "allow_html_in_named_anchor" is explicitly included.
  if (!settings.allow_html_in_named_anchor) {
    parser.addAttributeFilter('id,name', (nodes) => {
      let i = nodes.length, sibling, prevSibling, parent, node;

      while (i--) {
        node = nodes[i];
        if (node.name === 'a' && node.firstChild && !node.attr('href')) {
          parent = node.parent;

          // Move children after current node
          sibling = node.lastChild;
          while (sibling && parent) {
            prevSibling = sibling.prev;
            parent.insert(sibling, node);
            sibling = prevSibling;
          }
        }
      }
    });
  }

  if (settings.fix_list_elements) {
    parser.addNodeFilter('ul,ol', (nodes) => {
      let i = nodes.length, node, parentNode;

      while (i--) {
        node = nodes[i];
        parentNode = node.parent;

        if (parentNode && (parentNode.name === 'ul' || parentNode.name === 'ol')) {
          if (node.prev && node.prev.name === 'li') {
            node.prev.append(node);
          } else {
            const li = new AstNode('li', 1);
            li.attr('style', 'list-style-type: none');
            node.wrap(li);
          }
        }
      }
    });
  }

  const validClasses = schema.getValidClasses();
  if (settings.validate && validClasses) {
    parser.addAttributeFilter('class', (nodes) => {

      let i = nodes.length;
      while (i--) {
        const node = nodes[i];
        const clazz = node.attr('class') ?? '';
        const classList = Tools.explode(clazz, ' ');
        let classValue: string | null = '';

        for (let ci = 0; ci < classList.length; ci++) {
          const className = classList[ci];
          let valid = false;

          let validClassesMap = validClasses['*'];
          if (validClassesMap && validClassesMap[className]) {
            valid = true;
          }

          validClassesMap = validClasses[node.name];
          if (!valid && validClassesMap && validClassesMap[className]) {
            valid = true;
          }

          if (valid) {
            if (classValue) {
              classValue += ' ';
            }

            classValue += className;
          }
        }

        if (!classValue.length) {
          classValue = null;
        }

        node.attr('class', classValue);
      }
    });
  }

  registerBase64ImageFilter(parser, settings);

  const shouldSandboxIframes = settings.sandbox_iframes ?? false;
  const sandboxIframesExclusions = Arr.unique(settings.sandbox_iframes_exclusions ?? []);
  if (settings.convert_unsafe_embeds) {
    parser.addNodeFilter('object,embed', (nodes) => Arr.each(nodes, (node) => {
      node.replace(
        Embed.createSafeEmbed({
          type: node.attr('type'),
          src: node.name === 'object' ? node.attr('data') : node.attr('src'),
          width: node.attr('width'),
          height: node.attr('height'),
        },
        shouldSandboxIframes,
        sandboxIframesExclusions));
    }));
  }

  if (shouldSandboxIframes) {
    parser.addNodeFilter('iframe', (nodes) => Arr.each(nodes, (node) => Embed.sandboxIframe(node, sandboxIframesExclusions)));
  }
};

export {
  register
};
