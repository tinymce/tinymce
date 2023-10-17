export type SchemaType = 'html4' | 'html5' | 'html5-strict';

export interface ElementSettings {
  block_elements?: string;
  boolean_attributes?: string;
  move_caret_before_on_enter_elements?: string;
  non_empty_elements?: string;
  self_closing_elements?: string;
  text_block_elements?: string;
  text_inline_elements?: string;
  void_elements?: string;
  whitespace_elements?: string;
  transparent_elements?: string;
  wrap_block_elements?: string;
}

export interface SchemaSettings extends ElementSettings {
  custom_elements?: string;
  extended_valid_elements?: string;
  invalid_elements?: string;
  invalid_styles?: string | Record<string, string>;
  schema?: SchemaType;
  valid_children?: string;
  valid_classes?: string | Record<string, string>;
  valid_elements?: string;
  valid_styles?: string | Record<string, string>;
  verify_html?: boolean;
  padd_empty_block_inline_children?: boolean;
}

export interface Attribute {
  required?: boolean;
  defaultValue?: string;
  forcedValue?: string;
  validValues?: Record<string, {}>;
}

export interface DefaultAttribute {
  name: string;
  value: string;
}

export interface AttributePattern extends Attribute {
  pattern: RegExp;
}

export interface ElementRule {
  attributes: Record<string, Attribute>;
  attributesDefault?: DefaultAttribute[];
  attributesForced?: DefaultAttribute[];
  attributesOrder: string[];
  attributePatterns?: AttributePattern[];
  attributesRequired?: string[];
  paddEmpty?: boolean;
  removeEmpty?: boolean;
  removeEmptyAttrs?: boolean;
  paddInEmptyBlock?: boolean;
}

export interface SchemaElement extends ElementRule {
  outputName?: string;
  parentsRequired?: string[];
  pattern?: RegExp;
}

export interface SchemaMap {
  [name: string]: {};
}

export interface SchemaRegExpMap {
  [name: string]: RegExp;
}

