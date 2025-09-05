import { classes } from '../../utils/Styles';

export interface IconProps {
  /** The name of the icon */
  icon: string;
  /** The function to resolve the icon name to an html string.
   * This would eventually default to retrieving the icon from the editor's registry.
   * (name: string) => editor.ui.registry.getAll().icons[name] ?? 'temporary-placeholder'
   *
   * @param icon - The name of the icon
   * @returns The html string representation of the icon
   */
  resolver: (icon: string) => string;
}

export const Icon: React.FC<IconProps> = ({ icon, resolver }) => {
  return <span className={classes([ 'tox-icon' ])} dangerouslySetInnerHTML={{ __html: resolver(icon) }} />;
};
