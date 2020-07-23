/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';
import { Optional } from '@ephox/katamari';

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

export interface LinkDialogInfo {
  anchor: {
    url: Optional<string>;
    text: Optional<string>;
    target: Optional<string>;
    rel: Optional<string>;
    linkClass: Optional<string>;
    title: Optional<string>;
  };
  catalogs: {
    link: Optional<ListItem[]>;
    targets: Optional<ListItem[]>;
    rels: Optional<ListItem[]>;
    classes: Optional<ListItem[]>;
    anchor: Optional<ListItem[]>;
  };
  flags: {
    titleEnabled: boolean;
  };
  optNode: Optional<HTMLAnchorElement>;
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
  text: Optional<string>;
  target: Optional<string>;
  rel: Optional<string>;
  class: Optional<string>;
  title: Optional<string>;
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
