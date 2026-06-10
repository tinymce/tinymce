import type { AlertBanner, AlertBannerSpec } from './AlertBanner';
import type { Bar, BarSpec } from './Bar';
import type { Button, ButtonSpec } from './Button';
import type { Checkbox, CheckboxSpec } from './Checkbox';
import type { Collection, CollectionSpec } from './Collection';
import type { ColorInput, ColorInputSpec } from './ColorInput';
import type { ColorPicker, ColorPickerSpec } from './ColorPicker';
import type { CustomEditor, CustomEditorSpec } from './CustomEditor';
import type { DropZone, DropZoneSpec } from './Dropzone';
import type { Grid, GridSpec } from './Grid';
import type { HtmlPanel, HtmlPanelSpec } from './HtmlPanel';
import type { Iframe, IframeSpec } from './Iframe';
import type { ImagePreview, ImagePreviewSpec } from './ImagePreview';
import type { Input, InputSpec } from './Input';
import type { Label, LabelSpec } from './Label';
import type { ListBox, ListBoxSpec } from './ListBox';
import type { Panel, PanelSpec } from './Panel';
import type { SelectBox, SelectBoxSpec } from './SelectBox';
import type { SizeInput, SizeInputSpec } from './SizeInput';
import type { Slider, SliderSpec } from './Slider';
import type { Table, TableSpec } from './Table';
import type { TextArea, TextAreaSpec } from './Textarea';
import type { Tree, TreeSpec } from './Tree';
import type { UrlInput, UrlInputSpec } from './UrlInput';

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
