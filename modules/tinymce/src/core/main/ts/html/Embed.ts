import { Obj, Optional, Strings, Type } from '@ephox/katamari';
import { Strings as PStrings } from '@ephox/polaris';

import AstNode from '../api/html/Node';

interface EmbedAttrs {
  readonly type?: string;
  readonly src?: string;
  readonly width?: string;
  readonly height?: string;
}

const sandboxIframe = (iframeNode: AstNode, exclusions: Record<string, {}>): void => {
  if (Optional.from(iframeNode.attr('src')).bind(PStrings.extractUrlHost).forall((host) => !Obj.has(exclusions, host))) {
    iframeNode.attr('sandbox', '');
  }
};

const isMimeType = (mime: string, type: 'image' | 'video' | 'audio'): boolean => Strings.startsWith(mime, `${type}/`);

const createSafeEmbed = ({ type, src, width, height }: EmbedAttrs = {}, sandboxIframes: boolean, sandboxIframesExclusions: Record<string, {}>): AstNode => {
  let name: 'iframe' | 'img' | 'video' | 'audio';
  if (Type.isUndefined(type)) {
    name = 'iframe';
  } else if (isMimeType(type, 'image')) {
    name = 'img';
  } else if (isMimeType(type, 'video')) {
    name = 'video';
  } else if (isMimeType(type, 'audio')) {
    name = 'audio';
  } else {
    name = 'iframe';
  }

  const embed = new AstNode(name, 1);
  embed.attr(name === 'audio' ? { src } : { src, width, height });

  // TINY-10349: Show controls for audio and video so the replaced embed is visible in editor.
  if (name === 'audio' || name === 'video') {
    embed.attr('controls', '');
  }

  if (name === 'iframe' && sandboxIframes) {
    sandboxIframe(embed, sandboxIframesExclusions);
  }
  return embed;
};

export {
  createSafeEmbed,
  sandboxIframe
};
