// constant
import { iconComponent } from '@/ui-component/icons/AppIcon'

export const gridSpacing = 3
export const drawerWidth = 220
export const appDrawerWidth = 320
export const headerHeight = 56

// ===== Page spacing =====
// One page frame for every screen: 24px around the content (16px on phones), full width.
export const pageGutter = { xs: 16, sm: 24 }
export const pageTop = 24
export const pageBottom = 24
// Screens that fill the viewport (e.g. the inbox)
export const fullPageHeight = `calc(100vh - ${56 + 24 + 24}px)`
export const fullPageBottomOffset = 0
export const maxScroll = 100000
export const baseURL = import.meta.env.VITE_API_BASE_URL || window.location.origin
export const uiBaseURL = import.meta.env.VITE_UI_BASE_URL || window.location.origin
export const NEXORA_CREDENTIAL_ID = 'NEXORA_CREDENTIAL_ID'
export const REDACTED_CREDENTIAL_VALUE = '_NEXORA_BLANK_07167752-1a71-43b1-bf8f-4f32252165db'
export const ErrorMessage = {
    INVALID_MISSING_TOKEN: 'Invalid or Missing token',
    TOKEN_EXPIRED: 'Token Expired',
    REFRESH_TOKEN_EXPIRED: 'Refresh Token Expired',
    FORBIDDEN: 'Forbidden',
    UNKNOWN_USER: 'Unknown Username or Password',
    INCORRECT_PASSWORD: 'Incorrect Password',
    INACTIVE_USER: 'Inactive User',
    INVALID_WORKSPACE: 'No Workspace Assigned',
    UNKNOWN_ERROR: 'Unknown Error'
}
export const AGENTFLOW_ICONS = [
    {
        name: 'conditionAgentflow',
        icon: iconComponent('ArrowsSplit'),
        color: '#FFB938'
    },
    {
        name: 'startAgentflow',
        icon: iconComponent('Play'),
        color: '#7EE787'
    },
    {
        name: 'llmAgentflow',
        icon: iconComponent('ChatTeardropText'),
        color: '#64B5F6'
    },
    {
        name: 'agentAgentflow',
        icon: iconComponent('UserGear'),
        color: '#4DD0E1'
    },
    {
        name: 'humanInputAgentflow',
        icon: iconComponent('UserSwitch'),
        color: '#6E6EFD'
    },
    {
        name: 'loopAgentflow',
        icon: iconComponent('Repeat'),
        color: '#FFA07A'
    },
    {
        name: 'directReplyAgentflow',
        icon: iconComponent('ChatCircle'),
        color: '#4DDBBB'
    },
    {
        name: 'customFunctionAgentflow',
        icon: iconComponent('Function'),
        color: '#E4B7FF'
    },
    {
        name: 'toolAgentflow',
        icon: iconComponent('Toolbox'),
        color: '#d4a373'
    },
    {
        name: 'retrieverAgentflow',
        icon: iconComponent('Books'),
        color: '#b8bedd'
    },
    {
        name: 'conditionAgentAgentflow',
        icon: iconComponent('TreeView'),
        color: '#ff8fab'
    },
    {
        name: 'stickyNoteAgentflow',
        icon: iconComponent('Note'),
        color: '#fee440'
    },
    {
        name: 'httpAgentflow',
        icon: iconComponent('Globe'),
        color: '#FF7F7F'
    },
    {
        name: 'iterationAgentflow',
        icon: iconComponent('FlowArrow'),
        color: '#9C89B8'
    },
    {
        name: 'executeFlowAgentflow',
        icon: iconComponent('BezierCurve'),
        color: '#a3b18a'
    }
]

export const MCP_SERVER_STATUS = {
    PENDING: 'PENDING',
    AUTHORIZED: 'AUTHORIZED',
    ERROR: 'ERROR'
}

export const MCP_AUTH_TYPE = {
    NONE: 'NONE',
    CUSTOM_HEADERS: 'CUSTOM_HEADERS'
}
