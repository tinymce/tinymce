/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';
import { Dialog } from 'tinymce/core/api/ui/Ui';

import { ImageData } from '../core/ImageData';
import { UploadHandler } from '../core/Uploader';

export type ListValue = Dialog.ListBoxSingleItemSpec;
export type ListGroup = Dialog.ListBoxNestedItemSpec;
export type ListItem = Dialog.ListBoxItemSpec;

export interface UserListItem {
  text?: string;
  title?: string;
  menu?: UserListItem[];
}

export interface ImageDialogInfo {
  image: ImageData;
  imageList: Optional<ListItem[]>;
  classList: Optional<ListItem[]>;
  hasAdvTab: boolean;
  hasUploadTab: boolean;
  hasUploadUrl: boolean;
  hasUploadHandler: boolean;
  hasDescription: boolean;
  hasImageTitle: boolean;
  hasDimensions: boolean;
  hasImageCaption: boolean;
  hasAccessibilityOptions: boolean;
  url: string;
  basePath: string;
  credentials: boolean;
  handler: UploadHandler;
  automaticUploads: boolean;
  prependURL: Optional<string>;
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
      isDecorative?: boolean;
    };
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
  isDecorative: boolean;
}

export type API = Dialog.DialogInstanceApi<ImageDialogData>;
