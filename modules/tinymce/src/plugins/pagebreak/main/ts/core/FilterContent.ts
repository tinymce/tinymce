import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';

import * as Options from '../api/Options';

const pageBreakClass = 'mce-pagebreak';

const getPlaceholderHtml = (shouldSplitBlock: boolean): string => {
  const html = `<img src="${Env.transparentSrc}" class="${pageBreakClass}" data-mce-resize="false" data-mce-placeholder />`;
  return shouldSplitBlock ? `<p>${html}</p>` : html;
};

const setup = (editor: Editor): void => {
  const separatorHtml: string = Options.getSeparatorHtml(editor);
  const shouldSplitBlock = () => Options.shouldSplitBlock(editor);

  const pageBreakSeparatorRegExp = new RegExp(separatorHtml.replace(/[\?\.\*\[\]\(\)\{\}\+\^\$\:]/g, (a) => {
    return '\\' + a;
  }), 'gi');

  editor.on('BeforeSetContent', (e) => {
    e.content = e.content.replace(pageBreakSeparatorRegExp, getPlaceholderHtml(shouldSplitBlock()));
  });

  editor.on('PreInit', () => {
    editor.serializer.addNodeFilter('img', (nodes) => {
      let i = nodes.length, node, className;

      while (i--) {
        node = nodes[i];
        className = node.attr('class');
        if (className && className.indexOf(pageBreakClass) !== -1) {
          // Replace parent block node if pagebreak_split_block is enabled
          const parentNode = node.parent;
          if (parentNode && editor.schema.getBlockElements()[parentNode.name] && shouldSplitBlock()) {
            parentNode.type = 3;
            parentNode.value = separatorHtml;
            parentNode.raw = true;
            node.remove();
            continue;
          }

          node.type = 3;
          node.value = separatorHtml;
          node.raw = true;
        }
      }
    });
  });
};

export {
  pageBreakClass,
  getPlaceholderHtml,
  setup
};
