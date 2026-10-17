import {
    IconApi,
    IconBookFilled,
    IconCalculatorFilled,
    IconFunctionFilled,
    IconGlobeFilled,
    IconHeadset,
    IconLibrary,
    IconListCheck,
    IconMessage2,
    IconMessageCircleFilled,
    IconPuzzleFilled,
    IconShieldCheckFilled,
    IconUserFilled,
    IconVectorBezier2,
    IconWorld,
    IconWorldSearch
} from '@tabler/icons-react'

// Everything the agent may use. The agent decides on its own when to call each one,
// based on `when` (tool description) — no fixed flow.
export const TOOL_KINDS = {
    kb: { label: 'Kho tài liệu', Icon: IconBookFilled, tone: 'emerald', column: 'knowledge', group: 'core' },
    api: { label: 'Gọi API', Icon: IconApi, tone: 'orange', column: 'tools', group: 'core' },
    deepResearch: { label: 'Deep Research', Icon: IconWorldSearch, tone: 'teal', column: 'tools', group: 'core', single: true },
    webBrowser: { label: 'Đọc trang web', Icon: IconGlobeFilled, tone: 'teal', column: 'tools', group: 'core', single: true },
    calculator: { label: 'Máy tính', Icon: IconCalculatorFilled, column: 'tools', group: 'core', single: true },
    customTool: { label: 'Custom Tool', Icon: IconPuzzleFilled, tone: 'orange', column: 'tools', group: 'core' },

    // Agentflow gốc — dùng như công cụ của agent
    retrieverAgentflow: { label: 'Retriever', Icon: IconLibrary, tone: 'emerald', column: 'knowledge', group: 'advanced' },
    httpAgentflow: { label: 'HTTP', Icon: IconWorld, tone: 'orange', column: 'tools', group: 'advanced' },
    customFunctionAgentflow: { label: 'Custom Function', Icon: IconFunctionFilled, tone: 'orange', column: 'tools', group: 'advanced' },
    llmAgentflow: { label: 'LLM phụ', Icon: IconMessage2, tone: 'orange', column: 'tools', group: 'advanced' },
    executeFlowAgentflow: { label: 'Execute Flow', Icon: IconVectorBezier2, tone: 'orange', column: 'tools', group: 'advanced' }
}

// Fixed, non-removable blocks around the agent
export const FIXED = {
    channels: { label: 'Kênh', Icon: IconMessageCircleFilled, column: 'input' },
    profile: { label: 'Hồ sơ khách hàng', Icon: IconUserFilled, tone: 'teal', column: 'input' },
    guard: { label: 'Quy tắc an toàn', Icon: IconShieldCheckFilled, column: 'input' },
    handoff: { label: 'Chuyển nhân viên', Icon: IconHeadset, tone: 'rose', column: 'below' },
    sop: { label: 'Quy trình', Icon: IconListCheck, tone: 'amber', column: 'sops' }
}

export const CHANNELS = [
    { id: 'web', label: 'Web chat' },
    { id: 'zalo', label: 'Zalo OA' },
    { id: 'messenger', label: 'Messenger' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'email', label: 'Email' }
]

const uid = (p) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export const DEFAULT_WHEN = {
    kb: 'Khi khách hỏi thông tin có trong tài liệu này',
    api: 'Khi cần dữ liệu thời gian thực từ hệ thống',
    deepResearch: 'Khi tài liệu nội bộ không có câu trả lời và cần tìm trên web',
    webBrowser: 'Khi khách gửi một đường link và muốn hỏi về nội dung trong đó',
    calculator: 'Khi cần tính toán chính xác (tổng tiền, trả góp, chiết khấu)',
    customTool: 'Mô tả khi nào agent nên gọi công cụ này'
}

export const makeTool = (kind, extra = {}) => ({
    id: uid('t'),
    kind,
    enabled: true,
    name: TOOL_KINDS[kind]?.label || kind,
    when: DEFAULT_WHEN[kind] || 'Mô tả khi nào agent nên dùng công cụ này',
    config: kind === 'kb' ? { storeId: '', topK: 4, cite: true } : kind === 'api' ? { apiId: '' } : {},
    ...extra
})

export const makeSop = (n = 1) => ({ id: uid('p'), name: `Quy trình ${n}`, when: '', body: '', enabled: true })
