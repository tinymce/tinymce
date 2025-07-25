/*
TODO: Move to oxide-components

import { describe, it } from '@ephox/bedrock-client';
import { expect } from 'chai';

import * as DefaultAvatar from 'tinymce/core/lookup/DefaultAvatar';

describe('browser.tinymce.core.DefaultAvatarTest', () => {
  it('TINY-12528: Should return the same default avatar', () => {
    const userId = 'test-user-1';
    const userName = 'Test User';
    const expectedAvatar = '<svg height="36" width="36" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="18" cy="18" r="18" fill="#006064"/>' +
      '<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" ' +
      'fill="#FFF" font-family="sans-serif" font-size="18">T</text>' +
      '</svg>';
    const expectedAvatarURL = 'data:image/svg+xml,' + encodeURIComponent(expectedAvatar);

    expect(DefaultAvatar.derive(userId, userName)).to.equal(expectedAvatarURL);
    expect(DefaultAvatar.derive(userId, userName)).to.equal(expectedAvatarURL);
  });
});

*/