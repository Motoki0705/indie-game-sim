import statBarFillHealth from './bars/stat_bar_fill_health.png'
import statBarFillHp from './bars/stat_bar_fill_hp.png'
import statBarFillMorale from './bars/stat_bar_fill_morale.png'
import statBarFrame from './bars/stat_bar_frame.png'

import buttonPrimaryHover from './buttons/button_primary_hover.png'
import buttonPrimaryIdle from './buttons/button_primary_idle.png'
import buttonPrimaryPress from './buttons/button_primary_press.png'

import dayDotEmpty from './calendar/day_dot_empty.png'
import dayDotFilled from './calendar/day_dot_filled.png'

import actionBook from './icons/action_book.png'
import actionGuitar from './icons/action_guitar.png'
import actionInvest from './icons/action_invest.png'
import actionPalette from './icons/action_palette.png'
import currencyCoin from './icons/currency_coin.png'
import resourceClover from './icons/resource_clover.png'
import resourceFolder from './icons/resource_folder.png'
import resourceHeart from './icons/resource_heart.png'
import resourcePc from './icons/resource_pc.png'

import actionPopupFrame from './overlays/action_popup_frame.png'
import arrowNext from './overlays/arrow_next.png'

import currencyPanel from './panels/currency_panel.png'
import headerFrame from './panels/header_frame.png'
import monthProgressPanel from './panels/month_progress_panel.png'
import namePlate from './panels/name_plate.png'
import rightControlPanel from './panels/right_control_panel.png'

import resourceSlotFrame from './rails/resource_slot_frame.png'

import characterIdle from './stage/character_idle.png'
import characterRest from './stage/character_rest.png'
import characterWork from './stage/character_work.png'
import furnitureSet from './stage/furniture_set.png'
import roomBackground from './stage/room_background.png'

export const uiGameAssets = {
  bars: {
    frame: statBarFrame,
    fillHp: statBarFillHp,
    fillHealth: statBarFillHealth,
    fillMorale: statBarFillMorale,
  },
  buttons: {
    idle: buttonPrimaryIdle,
    hover: buttonPrimaryHover,
    press: buttonPrimaryPress,
  },
  calendar: {
    dotEmpty: dayDotEmpty,
    dotFilled: dayDotFilled,
  },
  icons: {
    actionBook,
    actionGuitar,
    actionInvest,
    actionPalette,
    currencyCoin,
    resourceClover,
    resourceFolder,
    resourceHeart,
    resourcePc,
  },
  overlays: {
    actionPopupFrame,
    arrowNext,
  },
  panels: {
    currencyPanel,
    headerFrame,
    monthProgressPanel,
    namePlate,
    rightControlPanel,
  },
  rails: {
    resourceSlotFrame,
  },
  stage: {
    characterIdle,
    characterRest,
    characterWork,
    furnitureSet,
    roomBackground,
  },
} as const
