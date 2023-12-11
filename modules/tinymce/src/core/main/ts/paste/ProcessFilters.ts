import Editor from '../api/Editor';
import * as Events from '../api/Events';
import DomParser from '../api/html/DomParser';
import HtmlSerializer from '../api/html/Serializer';
import * as Options from '../api/Options';
import Tools from '../api/util/Tools';

interface ProcessResult {
  readonly content: string;
  readonly cancelled: boolean;
}

const preProcess = (editor: Editor, html: string): string => {
  const parser = DomParser({ sanitize: Options.shouldSanitizeXss(editor), sandbox_iframes: Options.shouldSandboxIframes(editor) }, editor.schema);

  // Strip meta elements
  parser.addNodeFilter('meta', (nodes) => {
    Tools.each(nodes, (node) => {
      node.remove();
    });
  });

  const fragment = parser.parse(html, { forced_root_block: false, isRootContent: true });
  return HtmlSerializer({ validate: true }, editor.schema).serialize(fragment);
};

const processResult = (content: string, cancelled: boolean): ProcessResult => ({ content, cancelled });

const postProcessFilter = (editor: Editor, html: string, internal: boolean): ProcessResult => {
  const tempBody = editor.dom.create('div', { style: 'display:none' }, html);
  const postProcessArgs = Events.firePastePostProcess(editor, tempBody, internal);
  return processResult(postProcessArgs.node.innerHTML, postProcessArgs.isDefaultPrevented());
};

const filterContent = (editor: Editor, content: string, internal: boolean): ProcessResult => {
  const preProcessArgs = Events.firePastePreProcess(editor, content, internal);

  // Filter the content to remove potentially dangerous content (eg scripts)
  const filteredContent = preProcess(editor, preProcessArgs.content);

  if (editor.hasEventListeners('PastePostProcess') && !preProcessArgs.isDefaultPrevented()) {
    return postProcessFilter(editor, filteredContent, internal);
  } else {
    return processResult(filteredContent, preProcessArgs.isDefaultPrevented());
  }
};

const process = (editor: Editor, html: string, internal: boolean): ProcessResult => {
  return filterContent(editor, html, internal);
};

export {
  process
};
