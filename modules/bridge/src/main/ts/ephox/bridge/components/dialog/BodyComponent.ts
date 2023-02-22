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
import { ImagePreview, ImagePreviewSpec } from './ImagePreview';
import { Input, InputSpec } from './Input';
import { Label, LabelSpec } from './Label';
import { ListBox, ListBoxSpec } from './ListBox';
import { Panel, PanelSpec } from './Panel';
import { SelectBox, SelectBoxSpec } from './SelectBox';
import { SizeInput, SizeInputSpec } from './SizeInput';
import { Slider, SliderSpec } from './Slider';
import { Table, TableSpec } from './Table';
import { TextArea, TextAreaSpec } from './Textarea';
import { Tree, TreeSpec } from './Tree';
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
  | SliderSpec
  | IframeSpec
  | HtmlPanelSpec
  | UrlInputSpec
  | DropZoneSpec
  | ColorInputSpec
  | GridSpec
  | ColorPickerSpec
  | ImagePreviewSpec
  | AlertBannerSpec
  | CollectionSpec
  | LabelSpec
  | TableSpec
  | TreeSpec
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
  | Slider
  | Iframe
  | HtmlPanel
  | UrlInput
  | DropZone
  | ColorInput
  | Grid
  | ColorPicker
  | ImagePreview
  | AlertBanner
  | Collection
  | Label
  | Table
  | Tree
  | Panel
  | CustomEditor;
