// ==============================|| CONFIGURATION MODULE - MOCK DATA ||============================== //

// Rules that decide which employee (or team) Pulse hands an escalated conversation to.
// Rules are evaluated top-down; the first matching rule wins.
// assignType is 'user' or 'team'. When 'team', pair with teamId and strategy.
export const mockRoutingRules = [
    {
        id: 'rule-1',
        name: 'Khiếu nại giao Support Lead',
        enabled: true,
        priority: 1,
        conditions: { tag: 'Khiếu nại' },
        assignType: 'user',
        assignTo: 'e2',
        teamId: null,
        strategy: 'direct'
    },
    {
        id: 'rule-2',
        name: 'Khách VIP giao Head of Sales',
        enabled: true,
        priority: 2,
        conditions: { tag: 'VIP' },
        assignType: 'user',
        assignTo: 'e1',
        teamId: null,
        strategy: 'direct'
    },
    {
        id: 'rule-3',
        name: 'Sàn TMĐT giao Đội Sàn TMĐT',
        enabled: true,
        priority: 3,
        conditions: { channels: ['shopee', 'lazada', 'tiktok'] },
        assignType: 'team',
        assignTo: null,
        teamId: 'team-marketplace',
        strategy: 'round_robin_team'
    },
    {
        id: 'rule-4',
        name: 'Chat website/social giao Đội CSKH',
        enabled: true,
        priority: 10,
        conditions: { channels: ['website', 'facebook', 'instagram', 'zalo'] },
        assignType: 'team',
        assignTo: null,
        teamId: 'team-support',
        strategy: 'least_busy_team'
    },
    {
        id: 'rule-5',
        name: 'Fallback: Đội Sales tổng',
        enabled: false,
        priority: 99,
        conditions: {},
        assignType: 'team',
        assignTo: null,
        teamId: 'team-sales',
        strategy: 'round_robin_team'
    }
]

export const ROUTING_STRATEGIES = [
    { value: 'direct', label: 'Gán trực tiếp', requires: 'user' },
    { value: 'round_robin_team', label: 'Chia đều trong nhóm', requires: 'team' },
    { value: 'least_busy_team', label: 'Người rảnh nhất trong nhóm', requires: 'team' },
    { value: 'team_lead_first', label: 'Nhóm trưởng nhận trước, tràn thì round-robin', requires: 'team' }
]

// Which AI agent + intake script Pulse uses per channel.
export const mockChannelAgentMap = [
    { channel: 'facebook', agentId: 'agent-sales', script: 'sales-general', autoReply: true },
    { channel: 'zalo', agentId: 'agent-sales', script: 'sales-general', autoReply: true },
    { channel: 'zalo_personal', agentId: 'agent-sales', script: 'sales-general', autoReply: false },
    { channel: 'whatsapp', agentId: 'agent-b2b', script: 'b2b-quote', autoReply: false },
    { channel: 'instagram', agentId: 'agent-sales', script: 'sales-general', autoReply: true },
    { channel: 'website', agentId: 'agent-general', script: 'faq-first', autoReply: true },
    { channel: 'email', agentId: 'agent-b2b', script: 'b2b-quote', autoReply: false },
    { channel: 'tiktok', agentId: 'agent-livestream', script: 'live-buy', autoReply: true },
    { channel: 'shopee', agentId: 'agent-marketplace', script: 'order-status', autoReply: true },
    { channel: 'lazada', agentId: 'agent-marketplace', script: 'order-status', autoReply: true }
]

export const AVAILABLE_AGENTS = [
    { id: 'agent-sales', label: 'Sales Assistant' },
    { id: 'agent-b2b', label: 'B2B Quote Bot' },
    { id: 'agent-general', label: 'General FAQ' },
    { id: 'agent-livestream', label: 'Livestream Follow-up' },
    { id: 'agent-marketplace', label: 'Marketplace Order' }
]

export const AVAILABLE_SCRIPTS = [
    { id: 'sales-general', label: 'Bán hàng tổng hợp' },
    { id: 'b2b-quote', label: 'Báo giá B2B' },
    { id: 'faq-first', label: 'FAQ trước tiên' },
    { id: 'live-buy', label: 'Chốt đơn livestream' },
    { id: 'order-status', label: 'Tra cứu đơn hàng' }
]

// Mock connection state per channel.
// Each channel supports multiple accounts/pages. `account` (legacy) = display summary of first.
export const mockChannelIntegrations = [
    {
        channel: 'facebook',
        connected: true,
        account: 'NEXORA Fanpage',
        lastSync: '2 phút trước',
        accounts: [
            { id: 'fb-1', name: 'NEXORA Fanpage', handle: 'nexora.official', addedOn: '2025-11-04', enabled: true },
            { id: 'fb-2', name: 'NEXORA Marketing', handle: 'nexora.marketing', addedOn: '2026-01-12', enabled: true },
            { id: 'fb-3', name: 'NEXORA Đại lý', handle: 'nexora.dealers', addedOn: '2026-03-20', enabled: false }
        ]
    },
    {
        channel: 'zalo',
        connected: true,
        account: 'NEXORA OA',
        lastSync: '5 phút trước',
        accounts: [
            { id: 'za-1', name: 'NEXORA OA', handle: 'oa.nexora', addedOn: '2025-10-01', enabled: true },
            { id: 'za-2', name: 'NEXORA CSKH', handle: 'oa.nexora.cskh', addedOn: '2026-02-14', enabled: true }
        ]
    },
    { channel: 'zalo_personal', connected: false, account: '', lastSync: '—', accounts: [] },
    {
        channel: 'whatsapp',
        connected: true,
        account: '+84 908 123 456',
        lastSync: '10 phút trước',
        accounts: [{ id: 'wa-1', name: 'Hotline chính', handle: '+84 908 123 456', addedOn: '2025-12-20', enabled: true }]
    },
    {
        channel: 'instagram',
        connected: true,
        account: '@nexora.official',
        lastSync: '3 phút trước',
        accounts: [{ id: 'ig-1', name: 'NEXORA Official', handle: '@nexora.official', addedOn: '2025-11-11', enabled: true }]
    },
    {
        channel: 'website',
        connected: true,
        account: 'nexora.vn',
        lastSync: 'Realtime',
        accounts: [
            { id: 'web-1', name: 'nexora.vn', handle: 'https://gtech.vn', addedOn: '2025-09-01', enabled: true },
            { id: 'web-2', name: 'Landing khuyến mãi', handle: 'https://promo.gtech.vn', addedOn: '2026-04-10', enabled: true }
        ]
    },
    {
        channel: 'email',
        connected: true,
        account: 'support@gtech.vn',
        lastSync: '1 phút trước',
        accounts: [
            { id: 'em-1', name: 'Hỗ trợ chung', handle: 'support@gtech.vn', addedOn: '2025-08-15', enabled: true },
            { id: 'em-2', name: 'Đơn hàng', handle: 'sales@gtech.vn', addedOn: '2025-12-01', enabled: true }
        ]
    },
    { channel: 'tiktok', connected: false, account: '', lastSync: '—', accounts: [] },
    {
        channel: 'shopee',
        connected: true,
        account: 'NEXORA Store',
        lastSync: '15 phút trước',
        accounts: [
            { id: 'sh-1', name: 'NEXORA Store', handle: 'nexora.store', addedOn: '2025-10-30', enabled: true },
            { id: 'sh-2', name: 'NEXORA Mall', handle: 'nexora.mall', addedOn: '2026-05-01', enabled: false }
        ]
    },
    { channel: 'lazada', connected: false, account: '', lastSync: '—', accounts: [] }
]
