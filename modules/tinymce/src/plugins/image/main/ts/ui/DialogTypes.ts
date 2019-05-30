/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option } from '@ephox/katamari';

import { ImageData } from '../core/ImageData';
import { UploadHandler } from '../core/Uploader';
import { File } from '@ephox/dom-globals';
import { Types } from '@ephox/bridge';

export interface ListValue {
  text: string;
  value: string;
}

export interface ListGroup {
  text: string;
  items: ListItem[];
}

export type ListItem = ListValue | ListGroup;

export interface ImageDialogInfo {
  image: ImageData;
  imageList: Option<ListItem[]>;
  classList: Option<ListItem[]>;
  hasAdvTab: boolean;
  hasUploadTab: boolean;
  hasUploadUrl: boolean;
  hasUploadHandler: boolean;
  hasDescription: boolean;
  hasImageTitle: boolean;
  hasDimensions: boolean;
  hasImageCaption: boolean;
  url: string;
  basePath: string;
  credentials: boolean;
  handler: UploadHandler;
  prependURL: Option<string>;
}

export interface ImageDialogData {
  src: {
    value: string;
    meta?: {
      text?: string;
      width?: string;
      height?: string;
      alt?: string;
      title?: string;
      class?: string;
      style?: string;
      caption?: boolean;
      vspace?: string;
      border?: string;
      hspace?: string;
      borderstyle?: string;
    }
  };
  images: string;
  alt: string;
  title: string;
  dimensions: {
    width: string;
    height: string;
  };
  classes: string;
  caption: boolean;
  style: string; // we don't expose style anywhere
  vspace: string;
  border: string;
  hspace: string;
  borderstyle: string;
  fileinput: File[];
}

export type API = Types.Dialog.DialogInstanceApi<ImageDialogData>;