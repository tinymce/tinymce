import { AlertBanner, AlertBannerSpec } from './AlertBanner';
import { Bar, BarSpec } from './Bar';
import { Button, ButtonSpec } from './Button';
import { Checkbox, CheckboxSpec } from './Checkbox';
import { Collection, CollectionSpec } from './Collection';
import { ColorInput, ColorInputSpec } from './ColorInput';
import { ColorPicker, ColorPickerSpec } from './ColorPicker';
import { CustomEditor, CustomEditorSpec } from './CustomEditor';
import { DropZone, DropZoneSpec } from './Dropzone';
import { Grid, GridSpec } from './Grid';
import { HtmlPanel, HtmlPanelSpec } from './HtmlPanel';
import { Iframe, IframeSpec } from './Iframe';
import { ImageTools, ImageToolsSpec } from './ImageTools';
import { Input, InputSpec } from './Input';
import { Label, LabelSpec } from './Label';
import { ListBox, ListBoxSpec } from './ListBox';
import { Panel, PanelSpec } from './Panel';
import { SelectBox, SelectBoxSpec } from './SelectBox';
import { SizeInput, SizeInputSpec } from './SizeInput';
import { Table, TableSpec } from './Table';
import { TextArea, TextAreaSpec } from './Textarea';
import { UrlInput, UrlInputSpec } from './UrlInput';

export type BodyComponentSpec
  = BarSpec
  | ButtonSpec
  | CheckboxSpec
  | TextAreaSpec
  | InputSpec
  | ListBoxSpec
  | SelectBoxSpec
  | SizeInputSpec
  | IframeSpec
  | HtmlPanelSpec
  | UrlInputSpec
  | DropZoneSpec
  | ColorInputSpec
  | GridSpec
  | ColorPickerSpec
  | ImageToolsSpec
  | AlertBannerSpec
  | CollectionSpec
  | LabelSpec
  | TableSpec
  | PanelSpec
  | CustomEditorSpec;

export type BodyComponent
  = Bar
  | Button
  | Checkbox
  | TextArea
  | Input
  | ListBox
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
  | Panel
  | CustomEditor;
