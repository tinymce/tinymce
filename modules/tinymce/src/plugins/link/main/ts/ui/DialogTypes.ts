/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option } from '@ephox/katamari';
import { Types } from '@ephox/bridge';
import { HTMLAnchorElement } from '@ephox/dom-globals';

export interface ListValue {
  text: string;
  value: string;
}

export interface ListGroup {
  text: string;
  items: ListItem[];
}

// TODO TINY-2236 re-enable this (support will need to be added to bridge)
export type ListItem = ListValue/*  | ListGroup */;

export interface LinkDialogCatalog {
  link: Option<ListItem[]>;
  targets: Option<ListItem[]>;
  rels: Option<ListItem[]>;
  classes: Option<ListItem[]>;
  anchor: Option<ListItem[]>;
}

export interface LinkDialogInfo {
  anchor: {
    url: Option<string>;
    text: Option<string>;
    target: Option<string>;
    rel: Option<string>;
    linkClass: Option<string>;
    title: Option<string>;
  };
  catalogs: LinkDialogCatalog;
  flags: {
    titleEnabled: boolean;
  };
  optNode: Option<HTMLAnchorElement>;
  onSubmit?: (api: Types.Dialog.DialogInstanceApi<LinkDialogData>) => void;
}

export interface LinkDialogUrlData {
  value: string;
  meta?: LinkUrlMeta;
}

export interface LinkDialogData {
  url: LinkDialogUrlData;
  text: string;
  title: string;
  anchor: string;
  link: string;
  rel: string;
  target: string;
  linkClass: string;
}

export interface LinkDialogOutput {
  href: string;
  text: Option<string>;
  target: Option<string>;
  rel: Option<string>;
  class: Option<string>;
  title: Option<string>;
}

interface LinkUrlMeta {
  text?: string;
  title?: string;
  attach?: () => void;
  original?: {
    value: string;
  };
}

export interface AttachState {
  href?: string;
  attach?: () => void;
}
