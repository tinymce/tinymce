import { describe, expect, it } from 'vitest';

import * as DefualtAvatar from '../../../../main/ts/defaultavatar/DefaultAvatar.ts';

describe('browser.defaultavatar.DefaultAvatarTest', () => {
  it('TINY-12211: Should return the same default avatar twice', () => {
    const user = { id: 'test-user-1', name: 'Test User' };
    const expectedAvatar = '<svg height="36" width="36" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="18" cy="18" r="18" fill="#006064"/>' +
      '<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" ' +
      'fill="#FFF" font-family="sans-serif" font-size="18">T</text>' +
      '</svg>';
    const expectedAvatarURL = 'data:image/svg+xml,' + encodeURIComponent(expectedAvatar);

    expect(DefualtAvatar.generateUserAvatar(user)).to.equal(expectedAvatarURL);
    expect(DefualtAvatar.generateUserAvatar(user)).to.equal(expectedAvatarURL);
  });
});
