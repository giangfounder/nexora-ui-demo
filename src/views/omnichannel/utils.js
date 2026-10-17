import { IconMessageCircleFilled } from '@tabler/icons-react'
import { PRIORITY_WEIGHT, STATUS_WEIGHT } from './mockConversations'
import {
    EmailIcon,
    FacebookMessengerIcon,
    InstagramIcon,
    LazadaIcon,
    ShopeeIcon,
    TikTokBusinessIcon,
    WebsiteLiveChatIcon,
    WhatsAppIcon,
    ZaloOAIcon,
    ZaloPersonalIcon
} from './channelBrandIcons'

// ==============================|| OMNICHANNEL - SHARED UI HELPERS ||============================== //
// Channel icons use real brand marks. API matches tabler icons: { size, color }.
// Pass color='' or a specific value to override supported vector marks; omit for brand default.

const CHANNEL_ICONS = {
    facebook: FacebookMessengerIcon,
    zalo: ZaloOAIcon,
    zalo_personal: ZaloPersonalIcon,
    whatsapp: WhatsAppIcon,
    instagram: InstagramIcon,
    website: WebsiteLiveChatIcon,
    email: EmailIcon,
    tiktok: TikTokBusinessIcon,
    shopee: ShopeeIcon,
    lazada: LazadaIcon
}

export const getChannelIcon = (channelId) => CHANNEL_ICONS[channelId] || IconMessageCircleFilled

export const TAG_COLORS = {
    VIP: 'warning',
    'Khiếu nại': 'error'
}

// Pulse queue ordering: escalated-and-unassigned-urgent cases float to the
// top, resolved conversations sink to the bottom.
export const sortByQueuePriority = (conversations) =>
    [...conversations].sort((a, b) => {
        const statusDiff = STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status]
        if (statusDiff !== 0) return statusDiff
        const priorityDiff = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority]
        if (priorityDiff !== 0) return priorityDiff
        if (a.status === 'escalated') {
            const assignedDiff = (a.assignedTo ? 1 : 0) - (b.assignedTo ? 1 : 0)
            if (assignedDiff !== 0) return assignedDiff
        }
        return 0
    })
