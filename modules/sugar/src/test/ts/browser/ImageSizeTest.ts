import { Assert, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';

import * as ImageSize from 'ephox/sugar/api/view/ImageSize';

describe('browser.sugar.ImageSizeTest', () => {
  const base64ImgSrc = [
    'R0lGODdhZABkAHcAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQECgAAACwAAAAAZABkAIEAAAD78jY/',
    'P3SsMjIC/4SPqcvtD6OctNqLs968+w+G4kiW5ommR8C27gvHrxrK9g3TIM7f+tcL5n4doZFFLB6F',
    'Sc6SCRFIp9SqVTp6BiPXbjer5XG95Ck47IuWy2e0bLz2tt3DR5w8p7vgd2tej6TW5ycCGMM3aFZo',
    'OCOYqFjDuOf4KPAHiPh4qZeZuEnXOfjpFto3ilZ6dxqWGreq1br2+hTLtigZaFcJuYOb67DLC+Qb',
    'UIt3i2sshyzZtEFc7JwBLT1NXI2drb3N3e39DR4uPk5ebn6Onq6+zu488A4fLz9P335Aj58fb2+g',
    '71/P759AePwADBxY8KDAhAr9MWyY7yFEgPYmRgxokWK7jEYa2XGcJ/HjgJAfSXI0mRGlRZUTWUJ0',
    '2RCmQpkHaSLEKPKdzYU4c+78VzCo0KFEixo9ijSp0qVMmzp9CjWq1KlUq1q9eqEAADs='
  ].join('');
  const imgUrl = 'data:image/jpeg;base64,' + base64ImgSrc;
  const invalidImgUrl = 'data:image/png;base64,invalid';

  const pGetRejection = (promise: Promise<unknown>): Promise<Error> =>
    promise.then(() => Promise.reject(new Error('Expected the promise to reject')), Fun.identity);

  it('TINY-14411: getImageSizeFromUrl should return width and height for a valid URL', async () => {
    const { width, height } = await ImageSize.getImageSizeFromUrl(imgUrl);
    Assert.eq('width should be 100', 100, width);
    Assert.eq('height should be 100', 100, height);
  });

  it('TINY-14411: getImageSizeFromUrl should reject for an invalid URL', async () => {
    const error = await pGetRejection(ImageSize.getImageSizeFromUrl(invalidImgUrl));
    Assert.eq('Should reject with the URL in the message', `Failed to get image dimensions for: ${invalidImgUrl}`, error.message);
  });

  it('TINYMCE-14866: getImageSizeFromImg should wait for an image that is not loaded yet', async () => {
    const img = document.createElement('img');
    img.src = imgUrl;
    const { width, height } = await ImageSize.getImageSizeFromImg(img);
    Assert.eq('width should be 100', 100, width);
    Assert.eq('height should be 100', 100, height);
  });

  it('TINYMCE-14866: getImageSizeFromImg should resolve immediately for an image that is already loaded', async () => {
    const img = document.createElement('img');
    img.src = imgUrl;
    await ImageSize.getImageSizeFromImg(img);
    Assert.eq('Image should be complete', true, img.complete);
    const { width, height } = await ImageSize.getImageSizeFromImg(img);
    Assert.eq('width should be 100', 100, width);
    Assert.eq('height should be 100', 100, height);
  });

  it('TINYMCE-14866: getImageSizeFromImg should reject for an image with an invalid src', async () => {
    const img = document.createElement('img');
    img.src = invalidImgUrl;
    const error = await pGetRejection(ImageSize.getImageSizeFromImg(img));
    Assert.eq('Should reject with the src in the message', `Failed to get image dimensions for: ${invalidImgUrl}`, error.message);
  });
});
