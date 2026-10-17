// project imports
import config from '@/config'
import { readThemeMode, resolveDark, saveThemeMode } from '@/store/themeMode'

// action - state management
import * as actionTypes from '../actions'

export const initialState = {
    isOpen: [], // for active default menu
    fontFamily: config.fontFamily,
    borderRadius: config.borderRadius,
    opened: false,
    isHorizontal: localStorage.getItem('isHorizontal') === 'true' ? true : false,
    // 'light' | 'dark' | 'system'; isDarkMode is the resolved value everything else reads
    themeMode: readThemeMode(),
    isDarkMode: resolveDark(readThemeMode())
}

// ==============================|| CUSTOMIZATION REDUCER ||============================== //

const customizationReducer = (state = initialState, action) => {
    let id
    switch (action.type) {
        case actionTypes.MENU_OPEN:
            id = action.id
            return {
                ...state,
                isOpen: [id]
            }
        case actionTypes.SET_MENU:
            return {
                ...state,
                opened: action.opened
            }
        case actionTypes.SET_FONT_FAMILY:
            return {
                ...state,
                fontFamily: action.fontFamily
            }
        case actionTypes.SET_BORDER_RADIUS:
            return {
                ...state,
                borderRadius: action.borderRadius
            }
        case actionTypes.SET_LAYOUT:
            return {
                ...state,
                isHorizontal: action.isHorizontal
            }
        case actionTypes.SET_DARKMODE:
            // legacy on/off toggle: becomes an explicit choice
            saveThemeMode(action.isDarkMode ? 'dark' : 'light')
            return {
                ...state,
                themeMode: action.isDarkMode ? 'dark' : 'light',
                isDarkMode: action.isDarkMode
            }
        case actionTypes.SET_THEME_MODE:
            if (action.persist !== false) saveThemeMode(action.themeMode)
            return {
                ...state,
                themeMode: action.themeMode,
                isDarkMode: resolveDark(action.themeMode)
            }
        default:
            return state
    }
}

export default customizationReducer
