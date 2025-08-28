import { Arr, Cell, Obj, Optional, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

import * as Options from '../api/Options';
import { dataToHtml } from '../core/DataToHtml';
import * as HtmlToData from '../core/HtmlToData';
import { isMediaElement } from '../core/Selection';
import * as Service from '../core/Service';
import { DialogSubData, MediaData, MediaDataType, MediaDialogData } from '../core/Types';
import * as UpdateHtml from '../core/UpdateHtml';
import * as UrlPatterns from '../core/UrlPatterns';

type SourceInput = 'source' | 'altsource' | 'poster' | 'dimensions';

const extractMeta = (sourceInput: Exclude<SourceInput, 'dimensions'>, data: MediaDialogData): Optional<Record<string, string>> =>
  Obj.get(data, sourceInput).bind((mainData) => Obj.get(mainData, 'meta'));

const getValue = (data: MediaDialogData, metaData: Record<string, string>, sourceInput?: SourceInput) => (prop: keyof MediaDialogData): Record<string, string> => {
  // Cases:
  // 1. Get the nested value prop (component is the executed urlinput)
  // 2. Get from metadata (a urlinput was executed but urlinput != this component)
  // 3. Not a urlinput so just get string
  // If prop === sourceInput do 1, 2 then 3, else do 2 then 1 or 3
  // ASSUMPTION: we only want to get values for props that already exist in data
  const getFromData = (): Optional<string | Record<string, string> | DialogSubData> => Obj.get(data, prop);
  const getFromMetaData = (): Optional<string> => Obj.get(metaData, prop);
  const getNonEmptyValue = (c: Record<string, string>): Optional<string> => Obj.get(c, 'value').bind((v: string) => v.length > 0 ? Optional.some(v) : Optional.none());

  const getFromValueFirst = () => getFromData().bind((child) => Type.isObject(child)
    ? getNonEmptyValue(child as Record<string, string>).orThunk(getFromMetaData)
    : getFromMetaData().orThunk(() => Optional.from(child as string)));

  const getFromMetaFirst = () => getFromMetaData().orThunk(() => getFromData().bind((child) => Type.isObject(child)
    ? getNonEmptyValue(child as Record<string, string>)
    : Optional.from(child as string)));

  return { [prop]: (prop === sourceInput ? getFromValueFirst() : getFromMetaFirst()).getOr('') };
};

const getDimensions = (data: MediaDialogData, metaData: Record<string, string>): MediaDialogData['dimensions'] => {
  const dimensions: MediaDialogData['dimensions'] = {};
  Obj.get(data, 'dimensions').each((dims) => {
    Arr.each([ 'width', 'height' ] as ('width' | 'height')[], (prop) => {
      Obj.get(metaData, prop).orThunk(() => Obj.get(dims, prop)).each((value) => dimensions[prop] = value);
    });
  });
  return dimensions;
};

const unwrap = (data: MediaDialogData, sourceInput?: SourceInput): MediaData => {
  const metaData = sourceInput && sourceInput !== 'dimensions' ? extractMeta(sourceInput, data).getOr({}) : {};
  const get = getValue(data, metaData, sourceInput);
  return {
    ...get('source'),
    ...get('altsource'),
    ...get('poster'),
    ...get('embed'),
    ...getDimensions(data, metaData)
  } as MediaData;
};

const wrap = (data: MediaData): MediaDialogData => {
  const wrapped: MediaDialogData = {
    ...data,
    source: { value: Obj.get(data, 'source').getOr('') },
    altsource: { value: Obj.get(data, 'altsource').getOr('') },
    poster: { value: Obj.get(data, 'poster').getOr('') }
  };

  // Add additional size values that may or may not have been in the html
  Arr.each([ 'width', 'height' ] as const, (prop) => {
    Obj.get(data, prop).each((value) => {
      const dimensions: MediaDialogData['dimensions'] = wrapped.dimensions || {};
      dimensions[prop] = value;
      wrapped.dimensions = dimensions;
    });
  });

  return wrapped;
};

const handleError = (editor: Editor) => (error?: { msg: string }): void => {
  const errorMessage = error && error.msg ?
    'Media embed handler error: ' + error.msg :
    'Media embed handler threw unknown error.';
  editor.notificationManager.open({ type: 'error', text: errorMessage });
};

const getEditorData = (editor: Editor): MediaData => {
  const element = editor.selection.getNode();
  const snippet = isMediaElement(element) ? editor.serializer.serialize(element, { selection: true }) : '';
  const data = HtmlToData.htmlToData(snippet, editor.schema);

  const getDimensionsOfElement = (): MediaDialogData['dimensions'] => {
    if (isEmbedIframe(data.source, data.type)) {
      const rect = editor.dom.getRect(element);
      return {
        width: rect.w.toString().replace(/px$/, ''),
        height: rect.h.toString().replace(/px$/, ''),
      };
    } else {
      return {};
    }
  };

  const dimensions = getDimensionsOfElement();

  return {
    embed: snippet,
    ...data,
    ...dimensions
  };
};

const addEmbedHtml = (api: Dialog.DialogInstanceApi<MediaDialogData>, editor: Editor) => (response: Service.EmbedResult): void => {
  // Only set values if a URL has been defined
  if (Type.isString(response.url) && response.url.trim().length > 0) {
    const html = response.html;
    const snippetData = HtmlToData.htmlToData(html, editor.schema);
    const nuData: MediaData = {
      ...snippetData,
      source: response.url,
      embed: html
    };

    api.setData(wrap(nuData));
  }
};

const selectPlaceholder = (editor: Editor, beforeObjects: HTMLElement[]): void => {
  const afterObjects = editor.dom.select('*[data-mce-object]');

  // Find new image placeholder so we can select it
  for (let i = 0; i < beforeObjects.length; i++) {
    for (let y = afterObjects.length - 1; y >= 0; y--) {
      if (beforeObjects[i] === afterObjects[y]) {
        afterObjects.splice(y, 1);
      }
    }
  }

  editor.selection.select(afterObjects[0]);
};

const handleInsert = (editor: Editor, html: string): void => {
  const beforeObjects = editor.dom.select('*[data-mce-object]');

  editor.insertContent(html);
  selectPlaceholder(editor, beforeObjects);
  editor.nodeChanged();
};

const isEmbedIframe = (url: string, mediaDataType?: MediaDataType) =>
  Type.isNonNullable(mediaDataType) && mediaDataType === 'ephox-embed-iri' && Type.isNonNullable(UrlPatterns.matchPattern(url));

const shouldInsertAsNewIframe = (prevData: MediaData, newData: MediaData) => {
  const hasDimensionsChanged = (prevData: MediaData, newData: MediaData) =>
    prevData.width !== newData.width || prevData.height !== newData.height;

  return hasDimensionsChanged(prevData, newData) && isEmbedIframe(newData.source, prevData.type);
};

const submitForm = (prevData: MediaData, newData: MediaData, editor: Editor): void => {
  newData.embed =
    shouldInsertAsNewIframe(prevData, newData) && Options.hasDimensions(editor)
      ? dataToHtml(editor, { ...newData, embed: '' } )
      : UpdateHtml.updateHtml(newData.embed ?? '', newData, false, editor.schema);

  // Only fetch the embed HTML content if the URL has changed from what it previously was
  if (newData.embed && (prevData.source === newData.source || Service.isCached(newData.source))) {
    handleInsert(editor, newData.embed);
  } else {
    Service.getEmbedHtml(editor, newData)
      .then((response) => {
        handleInsert(editor, response.html);
      }).catch(handleError(editor));
  }
};

const showDialog = (editor: Editor): void => {
  const editorData = getEditorData(editor);
  const currentData = Cell<MediaData>(editorData);
  const initialData = wrap(editorData);

  const handleSource = (prevData: MediaData, api: Dialog.DialogInstanceApi<MediaDialogData>): void => {
    const serviceData = unwrap(api.getData(), 'source');

    // If a new URL is entered, then clear the embed html and fetch the new data
    if (prevData.source !== serviceData.source) {
      addEmbedHtml(win, editor)({ url: serviceData.source, html: '' });

      Service.getEmbedHtml(editor, serviceData)
        .then(addEmbedHtml(win, editor))
        .catch(handleError(editor));
    }
  };

  const handleEmbed = (api: Dialog.DialogInstanceApi<MediaDialogData>): void => {
    const data = unwrap(api.getData());
    const dataFromEmbed = HtmlToData.htmlToData(data.embed ?? '', editor.schema);
    api.setData(wrap(dataFromEmbed));
  };

  const handleUpdate = (api: Dialog.DialogInstanceApi<MediaDialogData>, sourceInput: SourceInput, prevData: MediaData): void => {
    const dialogData = unwrap(api.getData(), sourceInput);
    const data =
      shouldInsertAsNewIframe(prevData, dialogData) && Options.hasDimensions(editor)
        ? { ...dialogData, embed: '' }
        : dialogData;

    const embed = dataToHtml(editor, data);
    api.setData(wrap({
      ...data,
      embed
    }));
  };

  const mediaInput: Dialog.UrlInputSpec[] = [{
    name: 'source',
    type: 'urlinput',
    filetype: 'media',
    label: 'Source',
    picker_text: 'Browse files'
  }];
  const sizeInput: Dialog.SizeInputSpec[] = !Options.hasDimensions(editor) ? [] : [{
    type: 'sizeinput',
    name: 'dimensions',
    label: 'Constrain proportions',
    constrain: true
  }];

  const generalTab = {
    title: 'General',
    name: 'general',
    items: Arr.flatten<Dialog.BodyComponentSpec>([ mediaInput, sizeInput ])
  };

  const embedTextarea: Dialog.TextAreaSpec = {
    type: 'textarea',
    name: 'embed',
    label: 'Paste your embed code below:'
  };
  const embedTab = {
    title: 'Embed',
    items: [
      embedTextarea
    ]
  };

  const advancedFormItems: Dialog.BodyComponentSpec[] = [];

  if (Options.hasAltSource(editor)) {
    advancedFormItems.push({
      name: 'altsource',
      type: 'urlinput',
      filetype: 'media',
      label: 'Alternative source URL'
    }
    );
  }

  if (Options.hasPoster(editor)) {
    advancedFormItems.push({
      name: 'poster',
      type: 'urlinput',
      filetype: 'image',
      label: 'Media poster (Image URL)'
    });
  }

  const advancedTab = {
    title: 'Advanced',
    name: 'advanced',
    items: advancedFormItems
  };

  const tabs = [
    generalTab,
    embedTab
  ];

  if (advancedFormItems.length > 0) {
    tabs.push(advancedTab);
  }

  const body: Dialog.TabPanelSpec = {
    type: 'tabpanel',
    tabs
  };
  const win = editor.windowManager.open<MediaDialogData>({
    title: 'Insert/Edit Media',
    size: 'normal',

    body,
    buttons: [
      {
        type: 'cancel',
        name: 'cancel',
        text: 'Cancel'
      },
      {
        type: 'submit',
        name: 'save',
        text: 'Save',
        primary: true
      }
    ],
    onSubmit: (api) => {
      const serviceData = unwrap(api.getData());
      submitForm(currentData.get(), serviceData, editor);
      api.close();
    },
    onChange: (api, detail) => {
      switch (detail.name) {
        case 'source':
          handleSource(currentData.get(), api);
          break;

        case 'embed':
          handleEmbed(api);
          break;

        case 'dimensions':
        case 'altsource':
        case 'poster':
          handleUpdate(api, detail.name, currentData.get());
          break;

        default:
          break;
      }
      currentData.set(unwrap(api.getData()));
    },
    initialData
  });
};

export {
  showDialog,
  unwrap
};
