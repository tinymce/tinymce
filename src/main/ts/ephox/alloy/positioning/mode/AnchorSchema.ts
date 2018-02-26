import { ValueSchema } from '@ephox/boulder';

import HotspotAnchor from './HotspotAnchor';
import MakeshiftAnchor from './MakeshiftAnchor';
import SelectionAnchor from './SelectionAnchor';
import SubmenuAnchor from './SubmenuAnchor';

export default <any> ValueSchema.choose(
  'anchor', {
    selection: SelectionAnchor,
    hotspot: HotspotAnchor,
    submenu: SubmenuAnchor,
    makeshift: MakeshiftAnchor
  }
);