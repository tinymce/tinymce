import { Obj } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';
import * as DataToHtml from './DataToHtml';
import { MediaData } from './Types';

export interface EmbedResult {
  readonly url: string;
  readonly html: string;
}

interface EmbedResponse {
  readonly html?: string;
}

export type MediaResolver = (data: { url: string }, resolve: (response: EmbedResponse) => void, reject: (reason?: any) => void) => void;

const cache: Record<string, EmbedResponse> = {};

const embedPromise = (data: MediaData, dataToHtml: DataToHtml.DataToHtmlCallback, handler: MediaResolver): Promise<EmbedResult> => {
  return new Promise((res, rej) => {
    const wrappedResolve = (response: EmbedResponse) => {
      if (response.html) {
        cache[data.source] = response;
      }
      return res({
        url: data.source,
        html: response.html ? response.html : dataToHtml(data)
      });
    };
    if (cache[data.source]) {
      wrappedResolve(cache[data.source]);
    } else {
      handler({ url: data.source }, wrappedResolve, rej);
    }
  });
};

const defaultPromise = (data: MediaData, dataToHtml: DataToHtml.DataToHtmlCallback): Promise<EmbedResult> =>
  Promise.resolve({ html: dataToHtml(data), url: data.source });

const loadedData = (editor: Editor) => (data: MediaData): string =>
  DataToHtml.dataToHtml(editor, data);

const getEmbedHtml = (editor: Editor, data: MediaData): Promise<EmbedResult> => {
  const embedHandler = Options.getUrlResolver(editor);

  return embedHandler ? embedPromise(data, loadedData(editor), embedHandler) : defaultPromise(data, loadedData(editor));
};

const isCached = (url: string): boolean =>
  Obj.has(cache, url);

export {
  getEmbedHtml,
  isCached
};
