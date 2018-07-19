import { ValueSchema, Processor } from '@ephox/boulder';

import HotspotAnchor from './HotspotAnchor';
import MakeshiftAnchor from './MakeshiftAnchor';
import SelectionAnchor from './SelectionAnchor';
import SubmenuAnchor from './SubmenuAnchor';

export default ValueSchema.choose(
  'anchor', {
    selection: SelectionAnchor,
    hotspot: HotspotAnchor,
    submenu: SubmenuAnchor,
    makeshift: MakeshiftAnchor
  }
);
