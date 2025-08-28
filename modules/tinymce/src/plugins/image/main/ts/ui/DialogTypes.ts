import { Optional } from '@ephox/katamari';

import { Dialog } from 'tinymce/core/api/ui/Ui';

import { ImageData } from '../core/ImageData';

export type ListValue = Dialog.ListBoxSingleItemSpec;
export type ListGroup = Dialog.ListBoxNestedItemSpec;
export type ListItem = Dialog.ListBoxItemSpec;

export interface UserListItem {
  readonly text?: string;
  readonly title?: string;
  readonly value?: string;
  readonly url?: string;
  readonly menu?: UserListItem[];
}

export interface ImageDialogInfo {
  readonly image: ImageData;
  readonly imageList: Optional<ListItem[]>;
  readonly classList: Optional<ListItem[]>;
  readonly hasAdvTab: boolean;
  readonly hasUploadTab: boolean;
  readonly hasUploadUrl: boolean;
  readonly hasUploadHandler: boolean;
  readonly hasDescription: boolean;
  readonly hasImageTitle: boolean;
  readonly hasDimensions: boolean;
  readonly hasImageCaption: boolean;
  readonly hasAccessibilityOptions: boolean;
  readonly automaticUploads: boolean;
  readonly prependURL: Optional<string>;
}

export interface ImageMeta {
  text?: string;
  width?: string;
  height?: string;
  alt?: string | null;
  title?: string;
  class?: string;
  style?: string;
  caption?: boolean;
  vspace?: string;
  border?: string;
  hspace?: string;
  borderstyle?: string;
  isDecorative?: boolean;
}

export interface ImageDialogData {
  src: {
    value: string;
    meta?: ImageMeta;
  };
  images: string;
  alt: string | null;
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
