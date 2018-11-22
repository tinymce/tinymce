/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const isDomainLike = function (href: string) {
  return /^www\.|\.(com|org|edu|gov|uk|net|ca|de|jp|fr|au|us|ru|ch|it|nl|se|no|es|mil)$/i.test(href.trim());
};

const isAbsolute = function (href: string) {
  return /^https?:\/\//.test(href.trim());
};

export default {
  isDomainLike,
  isAbsolute
};