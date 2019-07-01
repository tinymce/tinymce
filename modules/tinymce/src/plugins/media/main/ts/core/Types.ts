/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

export interface MediaData {
  allowFullscreen?: boolean;
  source1: string;
  source1mime?: string;
  width: string;
  height: string;
  embed?: string;
  poster: string;
  source2: string;
  source2mime?: string;
  type?: 'ephox-embed-iri' | 'script' | 'object' | 'iframe' | 'embed' | 'video' | 'audio';
}
