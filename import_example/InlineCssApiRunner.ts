import { DomEvent, Insert, SelectorFind, SugarDocument, SugarElement, Value } from '@ephox/sugar';

import { TinyMCE } from 'tinymce/core/api/Tinymce';
declare let tinymce: TinyMCE;

const setup = (): void => {
  const runnerDiv = SelectorFind.descendant(SugarDocument.getDocument(), '#inlinecss-api-runner').getOrDie();

  const runnerHeading = SugarElement.fromHtml<HTMLHeadingElement>(`<h3>Inline CSS API Runner</h3>`);
  const runnerBtn = SugarElement.fromHtml<HTMLButtonElement>(`<button id="inline-css-btn" style="margin: 10px">Inline CSS</button>`);
  const outputIframe = SugarElement.fromHtml<HTMLIFrameElement>(`<iframe style="flex: 1; height: 100%; width: 100%"></iframe>`);
  const outputTextArea = SugarElement.fromHtml<HTMLTextAreaElement>('<textarea style="display: block;" row="30" col="30"></textarea>');
  const outputIframeContainer = SugarElement.fromHtml<HTMLDivElement>(
    `<div style="height: 400px; display: flex; flex-direction: column; overflow: hidden;"></div>`
  );

  Insert.append(runnerDiv, runnerHeading);
  Insert.append(runnerDiv, runnerBtn);
  Insert.append(runnerDiv, outputTextArea);
  Insert.append(runnerDiv, outputIframeContainer);
  Insert.append(outputIframeContainer, outputIframe);

  const rawDoc = outputIframe.dom.contentWindow?.document;

  DomEvent.bind(runnerBtn, 'click', () => {
    const pluginAPI = tinymce.get(0)?.plugins.inlinecss as any;
    pluginAPI.getContent().then((content: any) => {
      console.log('content', content.html);

      Value.set(outputTextArea, content.html);
      if (rawDoc) {
        rawDoc.open();
        rawDoc.write(content.html);
        rawDoc.close();
      }
    });
  });
};

export {
  setup
};
