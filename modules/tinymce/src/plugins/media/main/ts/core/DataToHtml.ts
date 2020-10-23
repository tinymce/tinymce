/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import * as Settings from '../api/Settings';
import * as HtmlToData from './HtmlToData';
import * as Mime from './Mime';
import { MediaData } from './Types';
import * as UpdateHtml from './UpdateHtml';
import * as UrlPatterns from './UrlPatterns';
import * as VideoScript from './VideoScript';

export type DataToHtmlCallback = (data: MediaData) => string;

const getIframeHtml = function (data: MediaData) {
  const allowFullscreen = data.allowFullscreen ? ' allowFullscreen="1"' : '';
  return '<iframe src="' + data.source + '" width="' + data.width + '" height="' + data.height + '"' + allowFullscreen + '></iframe>';
};

const getFlashHtml = function (data: MediaData) {
  let html = '<object data="' + data.source + '" width="' + data.width + '" height="' + data.height + '" type="application/x-shockwave-flash">';

  if (data.poster) {
    html += '<img src="' + data.poster + '" width="' + data.width + '" height="' + data.height + '" />';
  }

  html += '</object>';

  return html;
};

const getAudioHtml = function (data: MediaData, audioTemplateCallback: DataToHtmlCallback) {
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

const getVideoHtml = function (data: MediaData, videoTemplateCallback: DataToHtmlCallback) {
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

const getScriptHtml = function (data: MediaData) {
  return '<script src="' + data.source + '"></script>';
};

const dataToHtml = function (editor: Editor, dataIn: MediaData) {
  const data: MediaData = Tools.extend({}, dataIn);

  if (!data.source) {
    Tools.extend(data, HtmlToData.htmlToData(Settings.getScripts(editor), data.embed));
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
    data.allowFullscreen = pattern.allowFullscreen;
    data.width = data.width || String(pattern.w);
    data.height = data.height || String(pattern.h);
  }

  if (data.embed) {
    return UpdateHtml.updateHtml(data.embed, data, true);
  } else {
    const videoScript = VideoScript.getVideoScriptMatch(Settings.getScripts(editor), data.source);
    if (videoScript) {
      data.type = 'script';
      data.width = String(videoScript.width);
      data.height = String(videoScript.height);
    }

    const audioTemplateCallback = Settings.getAudioTemplateCallback(editor);
    const videoTemplateCallback = Settings.getVideoTemplateCallback(editor);

    data.width = data.width || '300';
    data.height = data.height || '150';

    Tools.each(data, function (value, key) {
      data[key] = editor.dom.encode('' + value);
    });

    if (data.type === 'iframe') {
      return getIframeHtml(data);
    } else if (data.sourcemime === 'application/x-shockwave-flash') {
      return getFlashHtml(data);
    } else if (data.sourcemime.indexOf('audio') !== -1) {
      return getAudioHtml(data, audioTemplateCallback);
    } else if (data.type === 'script') {
      return getScriptHtml(data);
    } else {
      return getVideoHtml(data, videoTemplateCallback);
    }
  }
};

export {
  dataToHtml
};
