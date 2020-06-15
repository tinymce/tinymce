/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Document, ShadowRoot } from '@ephox/dom-globals';
import { Arr, Obj, Results, Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { ReferrerPolicy } from '../SettingsTypes';
import * as StyleSheetGlobalLoader from '../../dom/StyleSheetGlobalLoader';

/**
 * This class handles loading of external stylesheets and fires events when these are loaded.
 *
 * @class tinymce.dom.StyleSheetLoader
 * @private
 */

export interface StyleSheetLoader {
  readonly load: (url: string, loadedCallback: () => void, errorCallback?: () => void) => void;
  readonly loadAll: (urls: string[], success: (urls: string[]) => void, failure: (urls: string[]) => void) => void;
  readonly _setReferrerPolicy: (referrerPolicy: ReferrerPolicy) => void;
}

export interface StyleSheetLoaderSettings {
  maxLoadTime: number;
  contentCssCors: boolean;
  referrerPolicy: ReferrerPolicy;
}

export function StyleSheetLoader(rootNode: Document | ShadowRoot, settings: Partial<StyleSheetLoaderSettings> = {}): StyleSheetLoader {
  const globalLoader = StyleSheetGlobalLoader.instance;
  const contentCssCors = settings.contentCssCors || false;

  Obj.get(settings, 'maxLoadTime').each(globalLoader.maxLoadTime.set);

  globalLoader.referrerPolicy.set(Obj.get(settings, 'referrerPolicy'));

  const _setReferrerPolicy = (referrerPolicy: ReferrerPolicy) => {
    globalLoader.referrerPolicy.set(Option.some(referrerPolicy));
  };

  const load = (url: string, loadedCallback: () => void, errorCallback?: () => void) => {
    globalLoader.load(Element.fromDom(rootNode), url, contentCssCors).get((result) => {
      result.fold(
        () => errorCallback && errorCallback(),
        loadedCallback
      );
    });
  };

  const loadAll = function (urls: string[], success: (urls: string[]) => void, failure: (urls: string[]) => void) {
    globalLoader.loadAll(Element.fromDom(rootNode), urls, contentCssCors).get((result) => {
      const parts = Arr.partition(result, (r) => r.isValue());
      if (parts.fail.length > 0) {
        failure(parts.fail.map(Results.unite));
      } else {
        success(parts.pass.map(Results.unite));
      }
    });
  };

  return {
    load,
    loadAll,
    _setReferrerPolicy
  };
}
