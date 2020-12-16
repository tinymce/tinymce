import DragnDropBranches from '../../behaviour/dragndrop/DragnDropBranches';
import { DragnDropBehaviour } from '../../dragging/dragndrop/DragnDropTypes';
import * as Behaviour from './Behaviour';

const DragnDrop: DragnDropBehaviour = Behaviour.createModes({
  branchKey: 'mode',
  branches: DragnDropBranches,
  name: 'dragndrop',
  // TODO: Try to see if there's a way we can actually get the correct
  // drag config type here based on the branch
  active: {
    exhibit: (base, dragInfo) => {
      return dragInfo.instance.exhibit(base, dragInfo as any);
    },

    events: (dragInfo) => {
      return dragInfo.instance.handlers(dragInfo as any);
    }
  }
});

export {
  DragnDrop
};
