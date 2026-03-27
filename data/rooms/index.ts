import type { Room } from '@/types/game'

import { CROSSROADS_ROOMS }  from './crossroads'
import { RIVER_ROAD_ROOMS }  from './river_road'
import { COVENANT_ROOMS }    from './covenant'
import { SALT_CREEK_ROOMS }  from './salt_creek'
import { EMBER_ROOMS }       from './the_ember'
import { BREAKS_ROOMS }      from './the_breaks'
import { THE_DUST_ROOMS }    from './the_dust'
import { THE_STACKS_ROOMS }  from './the_stacks'
import { DUSKHOLLOW_ROOMS }  from './duskhollow'
import { THE_DEEP_ROOMS }    from './the_deep'
import { THE_PINE_SEA_ROOMS } from './the_pine_sea'
import { THE_SCAR_ROOMS }    from './the_scar'
import { THE_PENS_ROOMS }    from './the_pens'

export {
  CROSSROADS_ROOMS,
  RIVER_ROAD_ROOMS,
  COVENANT_ROOMS,
  SALT_CREEK_ROOMS,
  EMBER_ROOMS,
  BREAKS_ROOMS,
  THE_DUST_ROOMS,
  THE_STACKS_ROOMS,
  DUSKHOLLOW_ROOMS,
  THE_DEEP_ROOMS,
  THE_PINE_SEA_ROOMS,
  THE_SCAR_ROOMS,
  THE_PENS_ROOMS,
}

export const ALL_ROOMS: Room[] = [
  ...CROSSROADS_ROOMS,
  ...RIVER_ROAD_ROOMS,
  ...COVENANT_ROOMS,
  ...SALT_CREEK_ROOMS,
  ...EMBER_ROOMS,
  ...BREAKS_ROOMS,
  ...THE_DUST_ROOMS,
  ...THE_STACKS_ROOMS,
  ...DUSKHOLLOW_ROOMS,
  ...THE_DEEP_ROOMS,
  ...THE_PINE_SEA_ROOMS,
  ...THE_SCAR_ROOMS,
  ...THE_PENS_ROOMS,
]
