export interface IconProps {
  /** The name of the icon */
  readonly icon: string;
  /** The function to resolve the icon name to an html string.
   *
   * This would eventually default to retrieving the icon from the editor's registry.
   * (name: string) => editor.ui.registry.getAll().icons[name] ?? 'temporary-placeholder'
   *
   * Returns the html string representation of the icon.
   */
  readonly resolver: (icon: string) => string;
}
