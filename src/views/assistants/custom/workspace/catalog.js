import { iconComponent } from '@/ui-component/icons/AppIcon'

// tone ∈ spectrum only: orange · teal · amber · emerald · rose
export const TOOL_CATALOG = [
    { id: 'deepResearch', label: 'Deep Research', Icon: iconComponent('Globe'), tone: 'teal', group: 'advanced', sheet: 'lg' },
    { id: 'apiCaller', label: 'Gọi API', Icon: iconComponent('PlugsConnected'), tone: 'orange', group: 'advanced', sheet: 'lg' },
    { id: 'collectInfo', label: 'Thu thập thông tin', Icon: iconComponent('ClipboardText'), tone: 'amber', group: 'advanced', sheet: 'lg' },
    { id: 'webBrowser', label: 'Web Browser', Icon: iconComponent('Globe'), tone: 'teal', group: 'basic', sheet: 'md' },
    { id: 'calculator', label: 'Calculator', Icon: iconComponent('Calculator'), tone: 'emerald', group: 'basic', sheet: 'md' },
    { id: 'serpAPI', label: 'Google Search', Icon: iconComponent('MagnifyingGlass'), tone: 'orange', group: 'basic', sheet: 'md' },
    { id: 'braveSearch', label: 'Brave Search', Icon: iconComponent('MagnifyingGlass'), tone: 'amber', group: 'basic', sheet: 'md' },
    { id: 'customTool', label: 'Custom Tool', Icon: iconComponent('PuzzlePiece'), tone: 'orange', group: 'basic', sheet: 'lg' },
    { id: 'requestsGet', label: 'HTTP GET', Icon: iconComponent('Terminal'), tone: 'teal', group: 'basic', sheet: 'md' },
    { id: 'requestsPost', label: 'HTTP POST', Icon: iconComponent('Terminal'), tone: 'teal', group: 'basic', sheet: 'md' },
    { id: 'zapierNLA', label: 'Zapier', Icon: iconComponent('Lightning'), tone: 'amber', group: 'basic', sheet: 'md' }
]

export const TOOL_GROUPS = [
    { id: 'all', label: 'Tất cả' },
    { id: 'enabled', label: 'Đang bật' },
    { id: 'advanced', label: 'Nâng cao' }
]

export const RESEARCH_SOURCES = [
    { id: 'web', label: 'Web' },
    { id: 'news', label: 'Tin tức' },
    { id: 'scholar', label: 'Học thuật' },
    { id: 'wiki', label: 'Wikipedia' },
    { id: 'docs', label: 'Kho tài liệu' }
]

export const VAR_TYPES = ['text', 'number', 'email', 'phone', 'date']

// Always available at runtime — never asked, never flagged as undefined.
export const SYSTEM_VARS = ['user_message', 'session_id', 'assistant_name', 'api_token']

export const ON_ERROR = [
    { id: 'retry', label: 'Thử lại 1 lần' },
    { id: 'skip', label: 'Bỏ qua, trả lời tiếp' },
    { id: 'handoff', label: 'Chuyển nhân viên' }
]

export const newApi = (n = 1) => ({
    id: `api${Date.now()}`,
    key: `api_${n}`,
    name: `API ${n}`,
    enabled: true,
    when: '',
    triggers: '',
    method: 'GET',
    url: 'https://',
    headers: [{ id: `h${Date.now()}`, key: 'Authorization', value: 'Bearer {{api_token}}' }],
    body: '',
    outputs: []
})

export const STARTER_PROMPTS = [
    'Giờ mở cửa thế nào?',
    'Giá Nexora Pulse X1 Pro?',
    'Tra cứu đơn hàng giúp mình',
    'Tư vấn giúp mình nên mua gì'
]

export const newPlaybook = (n = 1) => ({ id: `pb${Date.now()}`, name: `Kịch bản ${n}`, enabled: true, when: '', script: '' })

export const initialToolState = () => ({
    enabled: {
        deepResearch: true,
        apiCaller: true,
        collectInfo: true,
        webBrowser: true,
        calculator: true,
        serpAPI: false,
        braveSearch: false,
        customTool: false,
        requestsGet: false,
        requestsPost: false,
        zapierNLA: false
    },
    deepResearch: {
        links: [
            { id: 'l1', url: 'https://nexora.ai/docs/products', scope: 'domain' },
            { id: 'l2', url: 'https://blog.nexora.ai/release-notes', scope: 'page' }
        ],
        sources: ['web', 'docs'],
        depth: 3,
        maxResults: 8
    },
    apiCaller: {
        apis: [
            {
                id: 'api-customer',
                key: 'tra_cuu_khach_hang',
                name: 'Tra cứu khách hàng',
                enabled: true,
                when: 'Khi cần biết khách là ai trước khi xử lý đơn',
                triggers: 'tài khoản, thành viên',
                method: 'GET',
                url: 'https://api.nexora.ai/v1/customers?phone={{customer_phone}}',
                headers: [{ id: 'h1', key: 'Authorization', value: 'Bearer {{api_token}}' }],
                body: '',
                outputs: [
                    { id: 'o2', path: 'data.id', var: 'customer_id' },
                    { id: 'o3', path: 'data.tier', var: 'customer_tier' }
                ]
            },
            {
                id: 'api-order',
                key: 'tra_cuu_don_hang',
                name: 'Tra cứu đơn hàng',
                enabled: true,
                when: 'Khi khách hỏi tình trạng hoặc vị trí đơn hàng',
                triggers: 'đơn hàng, tra cứu, giao hàng, mã đơn',
                method: 'POST',
                url: 'https://api.nexora.ai/v1/orders/lookup',
                headers: [
                    { id: 'h2', key: 'Authorization', value: 'Bearer {{api_token}}' },
                    { id: 'h3', key: 'Content-Type', value: 'application/json' }
                ],
                body: '{\n  "customerId": "{{customer_id}}",\n  "orderCode": "{{order_code}}"\n}',
                outputs: [
                    { id: 'o4', path: 'data.status', var: 'order_status' },
                    { id: 'o5', path: 'data.eta', var: 'order_eta' }
                ]
            }
        ]
    },
    collectInfo: {
        variables: [
            {
                id: 'v2',
                name: 'customer_phone',
                type: 'phone',
                required: true,
                prefill: 'customer.phone',
                description: 'Hỏi số điện thoại đã dùng khi đặt hàng (10 số)'
            },
            {
                id: 'v3',
                name: 'order_code',
                type: 'text',
                required: false,
                prefill: '',
                description: 'Hỏi mã đơn dạng NX-12345 nếu khách có'
            },
            {
                id: 'v4',
                name: 'budget',
                type: 'number',
                required: false,
                prefill: 'customer.budget',
                description: 'Hỏi ngân sách dự kiến cho món đồ khách muốn mua'
            }
        ]
    },
    guards: { fillMissing: true, skipKnown: true, onError: 'retry' },
    playbooks: [
        {
            id: 'pb-order',
            name: 'Tra cứu đơn hàng',
            enabled: true,
            when: 'Khách hỏi tình trạng đơn hàng, giao hàng hoặc mã đơn',
            script: 'Lấy số điện thoại {{customer.phone}} từ hồ sơ khách, nếu chưa có thì hỏi {{customer_phone}}. Sau đó gọi {{api.tra_cuu_khach_hang}} bằng số điện thoại đó để lấy {{customer_id}} và {{customer_tier}}.\nHỏi thêm {{order_code}} nếu khách có, rồi gọi {{api.tra_cuu_don_hang}}.\nTrả lời bằng {{order_status}} và ngày giao dự kiến {{order_eta}}, xưng hô theo {{customer.name}}. Nếu không tìm thấy đơn thì tra {{kb.faq}} về chính sách giao hàng.'
        },
        {
            id: 'pb-advice',
            name: 'Tư vấn sản phẩm',
            enabled: true,
            when: 'Khách cần tư vấn, hỏi nên mua gì hoặc nhờ gợi ý sản phẩm',
            script: 'Xem khách quan tâm ngành hàng nào qua {{customer.industry}} và ngân sách {{budget}} (hồ sơ có thì dùng, chưa có thì hỏi).\nTìm sản phẩm phù hợp trong {{kb.san_pham}}, gợi ý tối đa 3 mẫu không vượt ngân sách, kèm giá. Xưng hô theo {{customer.name}}.'
        }
    ],
    serpAPI: { apiKey: '', maxResults: 5 },
    braveSearch: { apiKey: '', maxResults: 5 },
    customTool: {
        name: 'get_shipping_fee',
        description: 'Tính phí giao hàng theo tỉnh/thành',
        code: 'const { province } = $input\nreturn province === "HCM" ? 30000 : 50000'
    },
    requestsGet: { endpoint: '' },
    requestsPost: { endpoint: '' },
    zapierNLA: { webhook: '' }
})

// Starting point for a newly created assistant: same shape, nothing switched on, no demo data.
export const blankToolState = () => {
    const s = initialToolState()
    Object.keys(s.enabled).forEach((k) => {
        s.enabled[k] = false
    })
    s.deepResearch.links = []
    s.apiCaller.apis = []
    s.collectInfo.variables = []
    s.playbooks = []
    return s
}

// Short state summary rendered as meta pills on each tool card.
export const toolMeta = (id, s) => {
    switch (id) {
        case 'deepResearch':
            return [
                { text: `${s.deepResearch.links.length} URL` },
                { text: `${s.deepResearch.sources.length} nguồn` },
                { text: `Độ sâu ${s.deepResearch.depth}` }
            ]
        case 'apiCaller': {
            const apis = s.apiCaller.apis
            const on = apis.filter((a) => a.enabled !== false).length
            return [{ text: `${apis.length} API` }, { text: `${on} đang bật` }]
        }
        case 'collectInfo': {
            const v = s.collectInfo.variables
            return [{ text: `${v.length} biến` }, { text: `${v.filter((x) => x.prefill).length} lấy từ hồ sơ` }]
        }
        case 'serpAPI':
        case 'braveSearch':
            return s[id].apiKey ? [{ text: 'Đã có key', tone: 'emerald' }] : [{ text: 'Thiếu API key', tone: 'amber' }]
        case 'customTool':
            return [{ text: `${s.customTool.name || 'chưa đặt tên'}()` }]
        case 'requestsGet':
        case 'requestsPost':
            return [{ text: s[id].endpoint ? s[id].endpoint.replace(/^https?:\/\//, '') : 'Mọi endpoint' }]
        case 'zapierNLA':
            return s.zapierNLA.webhook ? [{ text: 'Đã kết nối', tone: 'emerald' }] : [{ text: 'Chưa kết nối', tone: 'amber' }]
        default:
            return [{ text: 'Sẵn sàng' }]
    }
}
