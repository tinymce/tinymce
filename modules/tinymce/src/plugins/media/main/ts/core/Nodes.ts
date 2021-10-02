/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import DomParser from 'tinymce/core/api/html/DomParser';
import AstNode from 'tinymce/core/api/html/Node';

import * as Settings from '../api/Settings';
import * as Sanitize from './Sanitize';
import * as VideoScript from './VideoScript';

declare let escape: any;

const isLiveEmbedNode = (node: AstNode): boolean => {
  const name = node.name;
  return name === 'iframe' || name === 'video' || name === 'audio';
};

const getDimension = (node: AstNode, styles: Record<string, string>, dimension: 'width' | 'height', defaultValue: string | null = null): string | null => {
  const value = node.attr(dimension);
  if (Type.isNonNullable(value)) {
    return value;
  } else if (!Obj.has(styles, dimension)) {
    return defaultValue;
  } else {
    return null;
  }
};

const setDimensions = (node: AstNode, previewNode: AstNode, styles: Record<string, string>): void => {
  // Apply dimensions for video elements to maintain legacy behaviour
  const useDefaults = previewNode.name === 'img' || node.name === 'video';

  // Determine the defaults
  const defaultWidth = useDefaults ? '300' : null;
  const fallbackHeight = node.name === 'audio' ? '30' : '150';
  const defaultHeight = useDefaults ? fallbackHeight : null;

  previewNode.attr({
    width: getDimension(node, styles, 'width', defaultWidth),
    height: getDimension(node, styles, 'height', defaultHeight)
  });
};

const appendNodeContent = (editor: Editor, nodeName: string, previewNode: AstNode, html: string): void => {
  const newNode = DomParser({ forced_root_block: false, validate: false }, editor.schema).parse(html, { context: nodeName });
  while (newNode.firstChild) {
    previewNode.append(newNode.firstChild);
  }
};

const createPlaceholderNode = (editor: Editor, node: AstNode): AstNode => {
  const name = node.name;

  const placeHolder = new AstNode('img', 1);
  placeHolder.shortEnded = true;

  retainAttributesAndInnerHtml(editor, node, placeHolder);

  setDimensions(node, placeHolder, {});
  placeHolder.attr({
    'style': node.attr('style'),
    'src': Env.transparentSrc,
    'data-mce-object': name,
    'class': 'mce-object mce-object-' + name
  });

  return placeHolder;
};

const createPreviewNode = (editor: Editor, node: AstNode): AstNode => {
  const name = node.name;

  const previewWrapper = new AstNode('span', 1);
  previewWrapper.attr({
    'contentEditable': 'false',
    'style': node.attr('style'),
    'data-mce-object': name,
    'class': 'mce-preview-object mce-object-' + name
  });

  retainAttributesAndInnerHtml(editor, node, previewWrapper);

  const styles = editor.dom.parseStyle(node.attr('style'));
  const previewNode = new AstNode(name, 1);
  setDimensions(node, previewNode, styles);
  previewNode.attr({
    src: node.attr('src'),
    style: node.attr('style'),
    class: node.attr('class')
  });

  if (name === 'iframe') {
    previewNode.attr({
      allowfullscreen: node.attr('allowfullscreen'),
      frameborder: '0'
    });
  } else {
    // Exclude autoplay as we don't want video/audio to play by default
    const attrs = [ 'controls', 'crossorigin', 'currentTime', 'loop', 'muted', 'poster', 'preload' ];
    Arr.each(attrs, (attrName) => {
      previewNode.attr(attrName, node.attr(attrName));
    });

    // Recreate the child nodes using the sanitized inner HTML
    const sanitizedHtml = previewWrapper.attr('data-mce-html');
    if (Type.isNonNullable(sanitizedHtml)) {
      appendNodeContent(editor, name, previewNode, unescape(sanitizedHtml));
    }
  }

  const shimNode = new AstNode('span', 1);
  shimNode.attr('class', 'mce-shim');

  previewWrapper.append(previewNode);
  previewWrapper.append(shimNode);

  return previewWrapper;
};

const retainAttributesAndInnerHtml = (editor: Editor, sourceNode: AstNode, targetNode: AstNode): void => {
  // Prefix all attributes except width, height and style since we
  // will add these to the placeholder
  const attribs = sourceNode.attributes;
  let ai = attribs.length;
  while (ai--) {
    const attrName = attribs[ai].name;
    let attrValue = attribs[ai].value;

    if (attrName !== 'width' && attrName !== 'height' && attrName !== 'style') {
      if (attrName === 'data' || attrName === 'src') {
        attrValue = editor.convertURL(attrValue, attrName);
      }

      targetNode.attr('data-mce-p-' + attrName, attrValue);
    }
  }

  // Place the inner HTML contents inside an escaped attribute
  // This enables us to copy/paste the fake object
  const innerHtml = sourceNode.firstChild && sourceNode.firstChild.value;
  if (innerHtml) {
    targetNode.attr('data-mce-html', escape(Sanitize.sanitize(editor, innerHtml)));
    targetNode.firstChild = null;
  }
};

const isPageEmbedWrapper = (node: AstNode): boolean => {
  const nodeClass = node.attr('class');
  return nodeClass && /\btiny-pageembed\b/.test(nodeClass);
};

const isWithinEmbedWrapper = (node: AstNode): boolean => {
  while ((node = node.parent)) {
    if (node.attr('data-ephox-embed-iri') || isPageEmbedWrapper(node)) {
      return true;
    }
  }

  return false;
};

const placeHolderConverter = (editor: Editor) => (nodes: AstNode[]): void => {
  let i = nodes.length;
  let node: AstNode;
  let videoScript: VideoScript.VideoScript | undefined;

  while (i--) {
    node = nodes[i];
    if (!node.parent) {
      continue;
    }

    if (node.parent.attr('data-mce-object')) {
      continue;
    }

    if (node.name === 'script') {
      videoScript = VideoScript.getVideoScriptMatch(Settings.getScripts(editor), node.attr('src'));
      if (!videoScript) {
        continue;
      }
    }

    if (videoScript) {
      if (videoScript.width) {
        node.attr('width', videoScript.width.toString());
      }

      if (videoScript.height) {
        node.attr('height', videoScript.height.toString());
      }
    }

    if (isLiveEmbedNode(node) && Settings.hasLiveEmbeds(editor) && Env.ceFalse) {
      if (!isWithinEmbedWrapper(node)) {
        node.replace(createPreviewNode(editor, node));
      }
    } else {
      if (!isWithinEmbedWrapper(node)) {
        node.replace(createPlaceholderNode(editor, node));
      }
    }
  }
};

export {
  createPreviewNode,
  createPlaceholderNode,
  placeHolderConverter
};
