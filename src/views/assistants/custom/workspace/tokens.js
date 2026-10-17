import { mockAttributeDefs, mockCustomerTypes, mockCustomers } from '@/views/customers/mockCustomers'
import { SYSTEM_VARS } from './catalog'
import { stripVi } from './primitives'

// Token grammar: {{customer.x}} hồ sơ · {{var}} thu thập/đầu ra API · {{api.key}} gọi API · {{kb.key}} tìm kho tài liệu
export const TOKEN_RE = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g
export const TOKEN_SPLIT = /(\{\{\s*[a-zA-Z0-9_.]+\s*\}\})/g

export const refsIn = (s = '') => [...String(s).matchAll(TOKEN_RE)].map((m) => m[1])
export const refsWithPos = (s = '') => [...String(s).matchAll(TOKEN_RE)].map((m) => ({ name: m[1], index: m.index }))

export const slugify = (s = '') =>
    stripVi(s)
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')

export const apiInputs = (api) =>
    [...new Set([api.url, api.body, ...(api.headers || []).map((h) => h.value)].flatMap(refsIn))].filter((v) => !SYSTEM_VARS.includes(v))

export const apiOutputs = (api) => (api.outputs || []).map((o) => o.var).filter(Boolean)

export const storeKey = (s) => s.key || slugify(s.name)

// ---- Customer profile (from the CRM module — custom attributes flow in automatically) ----
const BUILTIN_ATTRS = [
    ['name', 'Họ tên'],
    ['phone', 'Số điện thoại'],
    ['email', 'Email'],
    ['type', 'Loại khách'],
    ['stage', 'Giai đoạn'],
    ['tags', 'Nhãn'],
    ['last_contact', 'Liên hệ gần nhất']
]

export const CUSTOMER_ATTRS = [
    ...BUILTIN_ATTRS.map(([k, label]) => ({ key: `customer.${k}`, label })),
    ...mockAttributeDefs.map((d) => ({ key: `customer.${d.id}`, label: d.label, custom: true }))
]

export const TEST_CUSTOMERS = mockCustomers.slice(0, 5)

export const customerValues = (c) => {
    if (!c) return null
    const type = mockCustomerTypes.find((t) => t.id === c.typeId)
    const stage = type?.stages.find((s) => s.id === c.stageId)
    const out = {
        'customer.name': c.name,
        'customer.phone': c.phone?.replace(/\s/g, ''),
        'customer.email': c.email,
        'customer.type': type?.name,
        'customer.stage': stage?.label,
        'customer.tags': c.tags?.join(', '),
        'customer.last_contact': c.lastContactAt
    }
    mockAttributeDefs.forEach((d) => {
        const v = c.attributes?.[d.id]
        out[`customer.${d.id}`] = Array.isArray(v)
            ? v.join(', ')
            : typeof v === 'boolean'
            ? v
                ? 'Có'
                : 'Không'
            : v === '' || v == null
            ? undefined
            : String(v)
    })
    return Object.fromEntries(Object.entries(out).filter(([, v]) => v !== undefined && v !== ''))
}

export const GROUPS = [
    { id: 'customer', label: 'Khách hàng', tone: 'teal' },
    { id: 'collect', label: 'Thu thập', tone: 'amber' },
    { id: 'api', label: 'API', tone: 'orange' },
    { id: 'output', label: 'Đầu ra API', tone: 'orange' },
    { id: 'kb', label: 'Kho tài liệu', tone: 'emerald' },
    { id: 'system', label: 'Hệ thống', tone: undefined }
]
export const toneOfKind = (kind) => GROUPS.find((g) => g.id === kind)?.tone

export const buildRegistry = ({ toolState, stores = [], selectedStoreIds = [] }) => {
    const items = []
    const add = (it) => !items.some((x) => x.name === it.name) && items.push(it)
    CUSTOMER_ATTRS.forEach((a) => add({ name: a.key, kind: 'customer', label: a.label }))
    toolState.collectInfo.variables.forEach((v) => add({ name: v.name, kind: 'collect', label: v.description || 'Hỏi khách', ref: v }))
    toolState.apiCaller.apis.forEach((a) => {
        add({ name: `api.${a.key}`, kind: 'api', label: a.name, ref: a })
        apiOutputs(a).forEach((o) => add({ name: o, kind: 'output', label: `từ ${a.name}`, ref: a }))
    })
    stores.forEach((s) => {
        const attached = selectedStoreIds.includes(s.id)
        add({ name: `kb.${storeKey(s)}`, kind: 'kb', label: attached ? s.name : `${s.name} · chưa gắn`, ref: s, attached })
    })
    SYSTEM_VARS.forEach((v) => add({ name: v, kind: 'system', label: 'Hệ thống' }))
    return { items, byName: new Map(items.map((i) => [i.name, i])) }
}

// Fill tokens with known values; unknown customer name reads naturally as "bạn".
export const interpolate = (text = '', values = {}) =>
    text
        .replace(TOKEN_RE, (_, k) => values[k] ?? (k === 'customer.name' ? 'bạn' : ''))
        .replace(/[ \t]{2,}/g, ' ')
        .replace(/\s+([,.!?])/g, '$1')
