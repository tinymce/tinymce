
import { Arr, Optional, Strings, Type } from '@ephox/katamari';
import { Url } from '@ephox/polaris';

import AstNode from '../api/html/Node';

interface EmbedAttrs {
  readonly type?: string;
  readonly src?: string;
  readonly width?: string;
  readonly height?: string;
}

const sandboxIframe = (iframeNode: AstNode, exclusions: string[]): void => {
  if (Optional.from(iframeNode.attr('src')).bind(Url.extractHost).forall((host) => !Arr.contains(exclusions, host))) {
    iframeNode.attr('sandbox', '');
  }
};

const isMimeType = (mime: string, type: 'image' | 'video' | 'audio'): boolean => Strings.startsWith(mime, `${type}/`);

const getEmbedType = (type: string | undefined): 'iframe' | 'img' | 'video' | 'audio' => {
  if (Type.isUndefined(type)) {
    return 'iframe';
  } else if (isMimeType(type, 'image')) {
    return 'img';
  } else if (isMimeType(type, 'video')) {
    return 'video';
  } else if (isMimeType(type, 'audio')) {
    return 'audio';
  } else {
    return 'iframe';
  }
};

const createSafeEmbed = ({ type, src, width, height }: EmbedAttrs = {}, sandboxIframes: boolean, sandboxIframesExclusions: string[]): AstNode => {
  const name = getEmbedType(type);
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
