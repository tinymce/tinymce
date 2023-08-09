import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

import * as Options from '../api/Options';
import * as HtmlToData from './HtmlToData';
import * as Mime from './Mime';
import { MediaData } from './Types';
import * as UpdateHtml from './UpdateHtml';
import * as UrlPatterns from './UrlPatterns';

export type DataToHtmlCallback = (data: MediaData) => string;

const getIframeHtml = (data: MediaData, iframeTemplateCallback: DataToHtmlCallback | undefined): string => {
  if (iframeTemplateCallback) {
    return iframeTemplateCallback(data);
  } else {
    const allowFullscreen = data.allowfullscreen ? ' allowFullscreen="1"' : '';
    return '<iframe src="' + data.source + '" width="' + data.width + '" height="' + data.height + '"' + allowFullscreen + '></iframe>';
  }
};

const getFlashHtml = (data: MediaData): string => {
  let html = '<object data="' + data.source + '" width="' + data.width + '" height="' + data.height + '" type="application/x-shockwave-flash">';

  if (data.poster) {
    html += '<img src="' + data.poster + '" width="' + data.width + '" height="' + data.height + '" />';
  }

  html += '</object>';

  return html;
};

const getAudioHtml = (data: MediaData, audioTemplateCallback: DataToHtmlCallback | undefined): string => {
  if (audioTemplateCallback) {
    return audioTemplateCallback(data);
  } else {
    return (
      '<audio controls="controls" src="' + data.source + '">' +
      (
        data.altsource ?
          '\n<source src="' + data.altsource + '"' +
          (data.altsourcemime ? ' type="' + data.altsourcemime + '"' : '') +
          ' />\n' : '') +
      '</audio>'
    );
  }
};

const getVideoHtml = (data: MediaData, videoTemplateCallback: DataToHtmlCallback | undefined): string => {
  if (videoTemplateCallback) {
    return videoTemplateCallback(data);
  } else {
    return (
      '<video width="' + data.width +
      '" height="' + data.height + '"' +
      (data.poster ? ' poster="' + data.poster + '"' : '') + ' controls="controls">\n' +
      '<source src="' + data.source + '"' +
      (data.sourcemime ? ' type="' + data.sourcemime + '"' : '') + ' />\n' +
      (data.altsource ? '<source src="' + data.altsource + '"' +
        (data.altsourcemime ? ' type="' + data.altsourcemime + '"' : '') + ' />\n' : '') +
      '</video>'
    );
  }
};

const dataToHtml = (editor: Editor, dataIn: MediaData): string => {
  const data: MediaData = Tools.extend({}, dataIn);

  if (!data.source) {
    Tools.extend(data, HtmlToData.htmlToData(data.embed ?? '', editor.schema));
    if (!data.source) {
      return '';
    }
  }

  if (!data.altsource) {
    data.altsource = '';
  }

  if (!data.poster) {
    data.poster = '';
  }

  data.source = editor.convertURL(data.source, 'source');
  data.altsource = editor.convertURL(data.altsource, 'source');
  data.sourcemime = Mime.guess(data.source);
  data.altsourcemime = Mime.guess(data.altsource);
  data.poster = editor.convertURL(data.poster, 'poster');

  const pattern = UrlPatterns.matchPattern(data.source);

  if (pattern) {
    data.source = pattern.url;
    data.type = pattern.type;
    data.allowfullscreen = pattern.allowFullscreen;
    data.width = data.width || String(pattern.w);
    data.height = data.height || String(pattern.h);
  }

  if (data.embed) {
    return UpdateHtml.updateHtml(data.embed, data, true, editor.schema);
  } else {
    const audioTemplateCallback = Options.getAudioTemplateCallback(editor);
    const videoTemplateCallback = Options.getVideoTemplateCallback(editor);
    const iframeTemplateCallback = Options.getIframeTemplateCallback(editor);

    data.width = data.width || '300';
    data.height = data.height || '150';

    Tools.each(data, (value, key) => {
      (data as Record<string, string>)[key] = editor.dom.encode('' + value);
    });

    if (data.type === 'iframe') {
      return getIframeHtml(data, iframeTemplateCallback);
    } else if (data.sourcemime === 'application/x-shockwave-flash') {
      return getFlashHtml(data);
    } else if (data.sourcemime.indexOf('audio') !== -1) {
      return getAudioHtml(data, audioTemplateCallback);
    } else {
      return getVideoHtml(data, videoTemplateCallback);
    }
  }
};

export {
  dataToHtml
};
