import { StructureSchema } from '@ephox/boulder';

import HotspotAnchor from './HotspotAnchor';
import MakeshiftAnchor from './MakeshiftAnchor';
import NodeAnchor from './NodeAnchor';
import SelectionAnchor from './SelectionAnchor';
import SubmenuAnchor from './SubmenuAnchor';

export default StructureSchema.choose(
  'type', {
    selection: SelectionAnchor,
    node: NodeAnchor,
    hotspot: HotspotAnchor,
    submenu: SubmenuAnchor,
    makeshift: MakeshiftAnchor
  }
);
