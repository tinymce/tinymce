import HotspotAnchor from './HotspotAnchor';
import MakeshiftAnchor from './MakeshiftAnchor';
import SelectionAnchor from './SelectionAnchor';
import SubmenuAnchor from './SubmenuAnchor';
import { ValueSchema } from '@ephox/boulder';



export default <any> ValueSchema.choose(
  'anchor', {
    selection: SelectionAnchor,
    hotspot: HotspotAnchor,
    submenu: SubmenuAnchor,
    makeshift: MakeshiftAnchor
  }
);