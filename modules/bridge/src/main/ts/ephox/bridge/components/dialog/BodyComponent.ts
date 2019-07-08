import { AlertBanner, AlertBannerApi } from './AlertBanner';
import { Bar, BarApi } from './Bar';
import { Button, ButtonApi } from './Button';
import { Checkbox, CheckboxApi } from './Checkbox';
import { Collection, CollectionApi } from './Collection';
import { ColorInput, ColorInputApi } from './ColorInput';
import { ColorPicker, ColorPickerApi } from './ColorPicker';
import { DropZone, DropZoneApi } from './Dropzone';
import { Grid, GridApi } from './Grid';
import { Iframe, IframeApi } from './Iframe';
import { ImageTools, ImageToolsApi } from './ImageTools';
import { Input, InputApi } from './Input';
import { Label, LabelApi } from './Label';
import { SelectBox, SelectBoxApi } from './SelectBox';
import { SizeInput, SizeInputApi } from './SizeInput';
import { Table, TableApi } from './Table';
import { TextArea, TextAreaApi } from './Textarea';
import { UrlInput, UrlInputApi } from './UrlInput';
import { HtmlPanel, HtmlPanelApi } from './HtmlPanel';
import { Panel, PanelApi } from './Panel';

export type BodyComponentApi
  = BarApi
  | ButtonApi
  | CheckboxApi
  | TextAreaApi
  | InputApi
  | SelectBoxApi
  | SizeInputApi
  | IframeApi
  | HtmlPanelApi
  | UrlInputApi
  | DropZoneApi
  | ColorInputApi
  | GridApi
  | ColorPickerApi
  | ImageToolsApi
  | AlertBannerApi
  | CollectionApi
  | LabelApi
  | TableApi
  | PanelApi;

export type BodyComponent
  = Bar
  | Button
  | Checkbox
  | TextArea
  | Input
  | SelectBox
  | SizeInput
  | Iframe
  | HtmlPanel
  | UrlInput
  | DropZone
  | ColorInput
  | Grid
  | ColorPicker
  | ImageTools
  | AlertBanner
  | Collection
  | Label
  | Table
  | Panel;
