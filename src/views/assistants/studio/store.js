import { initialToolState } from '@/views/assistants/custom/workspace/catalog'
import { makeTool } from './nodeCatalog'

// Prototype persistence: one document per assistant in localStorage.
const KEY = 'nexora.studio.v2'
const load = () => {
    try {
        return JSON.parse(localStorage.getItem(KEY)) || {}
    } catch {
        return {}
    }
}
const persist = (m) => {
    try {
        localStorage.setItem(KEY, JSON.stringify(m))
    } catch {
        /* storage unavailable — keep working in memory */
    }
}

const baseSettings = (patch = {}) => ({
    modelName: 'chatOpenAI',
    instruction: '',
    welcome: 'Xin chào {{customer.name}}! Mình có thể giúp gì cho bạn?',
    memory: 10,
    temperature: 0.4,
    guards: { fillMissing: true, skipKnown: true, onError: 'retry' },
    ...patch
})

const seedCskh = () => {
    const t = initialToolState()
    const apis = t.apiCaller.apis.map((a) =>
        a.id === 'api-customer'
            ? { ...a, when: 'Khi cần biết khách là ai trong hệ thống (mã khách, hạng thành viên) — tra theo số điện thoại' }
            : { ...a, when: 'Khi khách hỏi tình trạng, vị trí hoặc ngày giao của đơn hàng' }
    )
    return {
        id: 'as-demo-1',
        name: 'Trợ lý CSKH Demo',
        status: 'active',
        updatedAt: '2026-10-02T09:12:00.000Z',
        settings: baseSettings({
            instruction:
                'Bạn là trợ lý CSKH của Nexora. Tự tra cứu tài liệu và hệ thống để trả lời; chỉ hỏi khách khi thật sự thiếu thông tin. Xưng hô bằng {{customer.name}}, trả lời ngắn gọn, lịch sự.',
            welcome: 'Xin chào {{customer.name}}! Mình là trợ lý của Nexora, bạn cần hỗ trợ gì ạ?'
        }),
        channels: ['web', 'zalo', 'messenger'],
        customerAttrs: [
            'customer.name',
            'customer.phone',
            'customer.type',
            'customer.stage',
            'customer.tags',
            'customer.industry',
            'customer.budget'
        ],
        rules: [
            'Không bịa thông tin ngoài tài liệu và kết quả API',
            'Không hứa giảm giá hay quà tặng ngoài chương trình',
            'Mỗi lượt chỉ hỏi khách một thông tin'
        ],
        variables: t.collectInfo.variables,
        apis,
        tools: [
            makeTool('kb', {
                id: 't-faq',
                name: 'FAQ khách hàng',
                when: 'Giờ mở cửa, đổi trả, thanh toán, giao hàng, bảo hành, trả góp',
                config: { storeId: 'ds-demo-1', topK: 4, cite: true }
            }),
            makeTool('kb', {
                id: 't-product',
                name: 'Catalog sản phẩm',
                when: 'Thông tin sản phẩm, giá, cấu hình, khuyến mãi; gợi ý sản phẩm',
                config: { storeId: 'ds-demo-2', topK: 4, cite: true }
            }),
            makeTool('kb', {
                id: 't-policy',
                name: 'Chính sách & điều khoản',
                when: 'Điều khoản sử dụng, quyền riêng tư, hoàn tiền',
                config: { storeId: 'ds-demo-3', topK: 3, cite: true }
            }),
            makeTool('api', { id: 't-api-customer', name: 'Tra cứu khách hàng', when: apis[0].when, config: { apiId: 'api-customer' } }),
            makeTool('api', { id: 't-api-order', name: 'Tra cứu đơn hàng', when: apis[1].when, config: { apiId: 'api-order' } }),
            makeTool('deepResearch', { id: 't-research', config: t.deepResearch }),
            makeTool('calculator', { id: 't-calc' })
        ],
        sops: [
            {
                id: 'p-order',
                name: 'Tra cứu đơn hàng',
                enabled: true,
                when: 'Khách hỏi tình trạng đơn, giao hàng, mã đơn',
                body: 'Cần số điện thoại {{customer_phone}} (hồ sơ có thì dùng luôn) để gọi {{api.tra_cuu_khach_hang}} lấy {{customer_id}}, rồi hỏi {{order_code}} nếu khách có và gọi {{api.tra_cuu_don_hang}}. Báo {{order_status}} và ngày giao {{order_eta}}.'
            },
            {
                id: 'p-advice',
                name: 'Tư vấn sản phẩm',
                enabled: true,
                when: 'Khách nhờ tư vấn, hỏi nên mua gì, nhờ gợi ý',
                body: 'Dựa vào ngành hàng khách quan tâm {{customer.industry}} và ngân sách {{budget}}, tìm trong {{kb.san_pham}} và gợi ý tối đa 3 mẫu không vượt ngân sách, kèm giá.'
            }
        ],
        handoff: {
            enabled: true,
            team: 'CSKH',
            when: 'Khách muốn gặp người thật, phàn nàn gay gắt, hoặc vấn đề ngoài khả năng của trợ lý',
            message: 'Mình chuyển bạn sang nhân viên CSKH ngay, bạn chờ chút nhé.'
        },
        positions: {}
    }
}

const seedSales = () => {
    const t = initialToolState()
    return {
        id: 'as-demo-2',
        name: 'Sales Assistant',
        status: 'draft',
        updatedAt: '2026-09-28T15:40:00.000Z',
        settings: baseSettings({
            modelName: 'chatAnthropic',
            instruction: 'Bạn là chuyên viên tư vấn bán hàng, chủ động gợi ý và chốt đơn, luôn kèm giá.'
        }),
        channels: ['web', 'messenger'],
        customerAttrs: ['customer.name', 'customer.industry', 'customer.budget'],
        rules: ['Không hứa giảm giá ngoài chương trình'],
        variables: t.collectInfo.variables.filter((v) => v.name === 'budget'),
        apis: [],
        tools: [
            makeTool('kb', {
                id: 't-product',
                name: 'Catalog sản phẩm',
                when: 'Sản phẩm, giá, cấu hình, khuyến mãi',
                config: { storeId: 'ds-demo-2', topK: 4, cite: false }
            }),
            makeTool('calculator', { id: 't-calc', when: 'Tính trả góp, tổng tiền combo' })
        ],
        sops: [
            {
                id: 'p-advice',
                name: 'Tư vấn & chốt đơn',
                enabled: true,
                when: 'Khách hỏi nên mua gì',
                body: 'Hỏi ngân sách {{budget}} nếu chưa có, tìm trong {{kb.san_pham}}, gợi ý 3 mẫu và 1 phụ kiện đi kèm.'
            }
        ],
        handoff: {
            enabled: true,
            team: 'Bán hàng',
            when: 'Khách muốn đặt số lượng lớn hoặc cần báo giá doanh nghiệp',
            message: 'Mình chuyển bạn sang chuyên viên bán hàng nhé.'
        },
        positions: {}
    }
}

const SEEDS = { 'as-demo-1': seedCskh, 'as-demo-2': seedSales }

export const getDoc = (id) => load()[id] || (SEEDS[id] ? SEEDS[id]() : null)

export const saveDoc = (doc) => {
    const m = load()
    m[doc.id] = { ...doc, updatedAt: new Date().toISOString() }
    persist(m)
    return m[doc.id]
}

export const listDocs = () => {
    const m = load()
    const ids = new Set([...Object.keys(SEEDS), ...Object.keys(m)])
    return [...ids]
        .map((id) => m[id] || SEEDS[id]())
        .filter((d) => d && !d.deleted)
        .sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1))
}

export const createDoc = ({ name, modelName }) =>
    saveDoc({
        id: `as-${Date.now().toString(36)}`,
        name,
        status: 'draft',
        settings: baseSettings({ modelName: modelName || 'chatOpenAI' }),
        channels: ['web'],
        customerAttrs: ['customer.name'],
        rules: [],
        variables: [],
        apis: [],
        tools: [],
        sops: [],
        handoff: {
            enabled: true,
            team: 'CSKH',
            when: 'Khách muốn gặp người thật hoặc vấn đề ngoài khả năng của trợ lý',
            message: 'Mình chuyển bạn sang nhân viên hỗ trợ nhé.'
        },
        positions: {}
    })

export const duplicateDoc = (id) => {
    const src = getDoc(id)
    if (!src) return null
    return saveDoc({
        ...JSON.parse(JSON.stringify(src)),
        id: `as-${Date.now().toString(36)}`,
        name: `${src.name} (bản sao)`,
        status: 'draft'
    })
}

export const deleteDoc = (id) => {
    const m = load()
    m[id] = { ...(m[id] || getDoc(id)), deleted: true }
    persist(m)
}
