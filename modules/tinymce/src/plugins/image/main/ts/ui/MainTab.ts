/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';

import { Dialog } from 'tinymce/core/api/ui/Ui';

import { ImageDialogInfo, ListItem } from './DialogTypes';

const makeItems = (info: ImageDialogInfo): Dialog.BodyComponentSpec[] => {
  const imageUrl = {
    name: 'src',
    type: 'urlinput',
    filetype: 'image',
    label: 'Source'
  };
  const imageList = info.imageList.map((items) => ({
    name: 'images',
    type: 'listbox',
    label: 'Image list',
    items
  }));
  const imageDescription = {
    name: 'alt',
    type: 'input',
    label: 'Alternative description',
    disabled: info.hasAccessibilityOptions && info.image.isDecorative
  };
  const imageTitle = {
    name: 'title',
    type: 'input',
    label: 'Image title'
  };
  const imageDimensions = {
    name: 'dimensions',
    type: 'sizeinput'
  };
  const isDecorative = {
    type: 'label',
    label: 'Accessibility',
    items: [{
      name: 'isDecorative',
      type: 'checkbox',
      label: 'Image is decorative'
    }]
  };

  interface DialogItems {
    type: string;
    name?: string;
    label: string;
    items?: Array<DialogItems | ListItem>;
  }
  // TODO: the original listbox supported styled items but bridge does not seem to support this
  const classList = info.classList.map((items): DialogItems => ({
    name: 'classes',
    type: 'listbox',
    label: 'Class',
    items
  }));
  const caption: DialogItems = {
    type: 'label',
    label: 'Caption',
    items: [
      {
        type: 'checkbox',
        name: 'caption',
        label: 'Show caption'
      }
    ]
  };

  const getDialogContainerType = (useColumns: boolean) => useColumns ? { type: 'grid', columns: 2 } : { type: 'panel' };

  return Arr.flatten<any>([
    [ imageUrl ],
    imageList.toArray(),
    info.hasAccessibilityOptions && info.hasDescription ? [ isDecorative ] : [],
    info.hasDescription ? [ imageDescription ] : [],
    info.hasImageTitle ? [ imageTitle ] : [],
    info.hasDimensions ? [ imageDimensions ] : [],
    [{
      ...getDialogContainerType(info.classList.isSome() && info.hasImageCaption),
      items: Arr.flatten([
        classList.toArray(),
        info.hasImageCaption ? [ caption ] : []
      ])
    }]
  ]);
};

const makeTab = (info: ImageDialogInfo): Dialog.TabSpec => ({
  title: 'General',
  name: 'general',
  items: makeItems(info)
});

export const MainTab = {
  makeTab,
  makeItems
};
