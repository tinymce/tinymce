/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Tools from 'tinymce/core/api/util/Tools';
import Settings from '../api/Settings';
import HtmlToData from './HtmlToData';
import Mime from './Mime';
import UpdateHtml from './UpdateHtml';
import * as UrlPatterns from './UrlPatterns';
import VideoScript from './VideoScript';

const getIframeHtml = function (data) {
  const allowFullscreen = data.allowFullscreen ? ' allowFullscreen="1"' : '';
  return '<iframe src="' + data.source1 + '" width="' + data.width + '" height="' + data.height + '"' + allowFullscreen + '></iframe>';
};

const getFlashHtml = function (data) {
  let html = '<object data="' + data.source1 + '" width="' + data.width + '" height="' + data.height + '" type="application/x-shockwave-flash">';

  if (data.poster) {
    html += '<img src="' + data.poster + '" width="' + data.width + '" height="' + data.height + '" />';
  }

  html += '</object>';

  return html;
};

const getAudioHtml = function (data, audioTemplateCallback) {
  if (audioTemplateCallback) {
    return audioTemplateCallback(data);
  } else {
    return (
      '<audio controls="controls" src="' + data.source1 + '">' +
      (
        data.source2 ?
          '\n<source src="' + data.source2 + '"' +
          (data.source2mime ? ' type="' + data.source2mime + '"' : '') +
          ' />\n' : '') +
      '</audio>'
    );
  }
};

const getVideoHtml = function (data, videoTemplateCallback) {
  if (videoTemplateCallback) {
    return videoTemplateCallback(data);
  } else {
    return (
      '<video width="' + data.width +
      '" height="' + data.height + '"' +
      (data.poster ? ' poster="' + data.poster + '"' : '') + ' controls="controls">\n' +
      '<source src="' + data.source1 + '"' +
      (data.source1mime ? ' type="' + data.source1mime + '"' : '') + ' />\n' +
      (data.source2 ? '<source src="' + data.source2 + '"' +
        (data.source2mime ? ' type="' + data.source2mime + '"' : '') + ' />\n' : '') +
      '</video>'
    );
  }
};

const getScriptHtml = function (data) {
  return '<script src="' + data.source1 + '"></script>';
};

const dataToHtml = function (editor, dataIn) {
  const data = Tools.extend({}, dataIn);

  if (!data.source1) {
    Tools.extend(data, HtmlToData.htmlToData(Settings.getScripts(editor), data.embed));
    if (!data.source1) {
      return '';
    }
  }

  if (!data.source2) {
    data.source2 = '';
  }

  if (!data.poster) {
    data.poster = '';
  }

  data.source1 = editor.convertURL(data.source1, 'source');
  data.source2 = editor.convertURL(data.source2, 'source');
  data.source1mime = Mime.guess(data.source1);
  data.source2mime = Mime.guess(data.source2);
  data.poster = editor.convertURL(data.poster, 'poster');

  const pattern = UrlPatterns.matchPattern(data.source1);

  if (pattern) {
    data.source1 = pattern.url;
    data.type = pattern.type;
    data.allowFullscreen = pattern.allowFullscreen;
    data.width = data.width || pattern.w;
    data.height = data.height || pattern.h;
  }

  if (data.embed) {
    return UpdateHtml.updateHtml(data.embed, data, true);
  } else {
    const videoScript = VideoScript.getVideoScriptMatch(Settings.getScripts(editor), data.source1);
    if (videoScript) {
      data.type = 'script';
      data.width = videoScript.width;
      data.height = videoScript.height;
    }

    const audioTemplateCallback = Settings.getAudioTemplateCallback(editor);
    const videoTemplateCallback = Settings.getVideoTemplateCallback(editor);

    data.width = data.width || 300;
    data.height = data.height || 150;

    Tools.each(data, function (value, key) {
      data[key] = editor.dom.encode(value);
    });

    if (data.type === 'iframe') {
      return getIframeHtml(data);
    } else if (data.source1mime === 'application/x-shockwave-flash') {
      return getFlashHtml(data);
    } else if (data.source1mime.indexOf('audio') !== -1) {
      return getAudioHtml(data, audioTemplateCallback);
    } else if (data.type === 'script') {
      return getScriptHtml(data);
    } else {
      return getVideoHtml(data, videoTemplateCallback);
    }
  }
};

export default {
  dataToHtml
};