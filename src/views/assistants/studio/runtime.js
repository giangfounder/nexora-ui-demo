import { interpolate, refsIn, storeKey } from '@/views/assistants/custom/workspace/tokens'
import { apiInputs, sampleValue } from '@/views/assistants/custom/workspace/planner'
import { stripVi } from '@/views/assistants/custom/workspace/primitives'

const STOP = new Set([
    'cua',
    'cho',
    'minh',
    'ban',
    'toi',
    'la',
    'va',
    'co',
    'khong',
    'gi',
    'nao',
    'the',
    'nhu',
    'thi',
    'voi',
    'duoc',
    'nhe',
    'giup',
    'hoi',
    've',
    'bao',
    'nhieu',
    'ra',
    'sao',
    'em',
    'anh',
    'chi',
    'oi',
    'a',
    'khach',
    'muon',
    'can',
    'khi',
    'nhung',
    'cac',
    'mot'
])
const words = (s) =>
    stripVi(s)
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length >= 2 && !STOP.has(w))
const overlap = (text, desc) => {
    const msg = new Set(words(text))
    return [...new Set(words(desc))].filter((w) => msg.has(w)).length
}
const vnd = (n) => `${Math.round(n).toLocaleString('vi-VN')}đ`
const short = (s = '', n = 22) => (String(s).length > n ? `${String(s).slice(0, n)}…` : String(s))

export const VAR_LABEL = {
    customer_phone: 'số điện thoại đã dùng khi đặt hàng',
    order_code: 'mã đơn hàng (gõ “bỏ qua” nếu không có)',
    budget: 'ngân sách dự kiến'
}
const varLabel = (v) => VAR_LABEL[v.name] || v.description || v.name.replace(/_/g, ' ')

export const parseMoney = (raw = '') => {
    const s = stripVi(String(raw))
    const num = parseFloat(
        s
            .replace(/[^\d.,]/g, '')
            .replace(/\.(?=\d{3})/g, '')
            .replace(',', '.')
    )
    if (Number.isNaN(num)) return NaN
    if (/tr|trieu|m\b/.test(s)) return num * 1e6
    if (/k\b|nghin|ngan/.test(s)) return num * 1e3
    return num < 1000 ? num * 1e6 : num
}

export const validateAnswer = (v, text) => {
    if (!v.required && /bo qua|khong co|skip/.test(stripVi(text))) return { ok: true, value: '' }
    if (v.type === 'phone' && !/^0\d{9}$/.test(text.replace(/[\s.-]/g, '')))
        return { ok: false, msg: 'Số điện thoại cần đủ 10 số và bắt đầu bằng 0. Vui lòng kiểm tra lại.' }
    if (v.type === 'number' && Number.isNaN(parseMoney(text))) return { ok: false, msg: 'Vui lòng nhập con số cụ thể, ví dụ “5 triệu”.' }
    if (v.type === 'email' && !/^\S+@\S+\.\S+$/.test(text.trim()))
        return { ok: false, msg: 'Email chưa đúng định dạng. Vui lòng kiểm tra lại.' }
    return { ok: true, value: text.trim() }
}

const chunksOf = (store) => (store?.loaders || []).flatMap((l) => l._chunks || [])
const productsOf = (store) =>
    chunksOf(store)
        .map((c) => {
            const m = c.pageContent.match(/^(?:Dòng )?([^:]+):.*Giá ([\d.]+)đ/)
            return m ? { name: m[1].trim(), price: Number(m[2].replace(/\./g, '')) } : null
        })
        .filter(Boolean)
const search = (text, store) => {
    const q = words(text)
    let best = null
    chunksOf(store).forEach((c) => {
        const hay = stripVi(c.pageContent)
        const hits = q.filter((t) => hay.includes(t)).length
        if (hits >= 2 && (!best || hits > best.hits)) best = { hits, chunk: c, store }
    })
    return best
}

/**
 * One autonomous turn. The agent decides which tools to use from their `when` descriptions,
 * follows a matching SOP if any, asks only for data it cannot find, then writes the answer.
 * state: { vals, pending } — pending = { question, plan, index, var }
 */
export const agentTurn = ({ doc, stores, customer, state, text }) => {
    const steps = []
    const vals = { ...(state?.vals || {}) }
    const S = (nodeId, tone, label) => steps.push({ nodeId, tone, label })
    const allowed = Object.fromEntries(Object.entries(customer || {}).filter(([k]) => doc.customerAttrs.includes(k)))
    const scope = () => ({ ...allowed, ...vals, user_message: text, assistant_name: doc.name })
    const tools = doc.tools.filter((t) => t.enabled !== false)
    const toolNode = (t) => `tool:${t.id}`
    const guards = doc.settings.guards
    const name = allowed['customer.name']
    const given = name?.split(' ').pop()

    let question = text
    let plan
    let start = 0
    let sop = null

    // ---- resume after the visitor answered a question
    if (state?.pending) {
        const p = state.pending
        const check = validateAnswer(p.var, text)
        if (!check.ok)
            return { reply: check.msg, steps: [{ nodeId: 'agent', tone: 'rose', label: `{{${p.var.name}}} chưa hợp lệ` }], state }
        vals[p.var.name] = check.value
        S('agent', 'amber', `Nhận {{${p.var.name}}} = ${check.value || '∅'}`)
        question = p.question
        plan = p.plan
        start = p.index
        sop = p.sopId ? doc.sops.find((s) => s.id === p.sopId) : null
    } else {
        S('agent', 'orange', `Đọc câu hỏi, cân nhắc ${tools.length} công cụ`)

        // escalation is a tool the agent can pick, not a branch
        if (doc.handoff?.enabled && (overlap(text, doc.handoff.when) >= 2 || /gap nhan vien|nguoi that|khieu nai/.test(stripVi(text)))) {
            S('handoff', 'rose', `Chuyển nhóm ${doc.handoff.team}`)
            return { reply: interpolate(doc.handoff.message, scope()), steps, state: { vals, pending: null } }
        }

        sop =
            doc.sops
                .filter((s) => s.enabled !== false)
                .map((s) => ({ s, score: overlap(text, `${s.name} ${s.when}`) }))
                .filter((x) => x.score >= 2)
                .sort((a, b) => b.score - a.score)[0]?.s || null

        if (sop) {
            S(`sop:${sop.id}`, 'amber', `Làm theo quy trình “${sop.name}”`)
            plan = refsIn(sop.body)
                .map((ref) => {
                    if (ref.startsWith('api.'))
                        return tools.find((t) => t.kind === 'api' && doc.apis.find((a) => a.id === t.config.apiId)?.key === ref.slice(4))
                    if (ref.startsWith('kb.'))
                        return tools.find(
                            (t) =>
                                t.kind === 'kb' && storeKey(stores.find((s) => s.id === t.config.storeId) || { name: '' }) === ref.slice(3)
                        )
                    const v = doc.variables.find((x) => x.name === ref)
                    return v ? { kind: 'need', var: v } : null
                })
                .filter(Boolean)
        } else {
            const apiPick = tools
                .filter((t) => t.kind === 'api')
                .map((t) => ({ t, score: overlap(text, `${t.name} ${t.when}`) }))
                .filter((x) => x.score >= 2)
                .sort((a, b) => b.score - a.score)
                .map((x) => x.t)
            const kbs = tools.filter((t) => t.kind === 'kb' || t.kind === 'retrieverAgentflow')
            plan = [...apiPick.slice(0, 1), ...kbs]
            if (tools.some((t) => t.kind === 'calculator') && /tra gop|chia|tinh|moi thang/.test(stripVi(text))) {
                // decompose: look up the price first, then do the maths
                question = text.replace(/trả góp|tra gop|\d+\s*tháng|tháng|bao nhiêu|mỗi|tính|chia/gi, ' ')
                S('agent', 'orange', 'Cần giá sản phẩm trước, sau đó tính trả góp')
                plan.push(tools.find((t) => t.kind === 'calculator'))
            }
        }
    }

    // ---- make a value available: profile → known → ask
    const need = (v, index) => {
        if (vals[v.name] !== undefined) return null
        if (guards.skipKnown && v.prefill && allowed[v.prefill]) {
            vals[v.name] = allowed[v.prefill]
            S('profile', 'teal', `Lấy {{${v.prefill}}} = ${short(allowed[v.prefill])} từ hồ sơ`)
            return null
        }
        S('agent', 'amber', `Thiếu {{${v.name}}} → hỏi khách`)
        return {
            reply: `${given ? `${given}, vui` : 'Vui'} lòng cung cấp ${varLabel(v)}.`,
            steps,
            state: { vals, pending: { question, plan, index, var: v, sopId: sop?.id } }
        }
    }

    let hit = null
    let products = null
    let calc = null
    for (let i = start; i < plan.length; i += 1) {
        const t = plan[i]
        if (t.kind === 'need') {
            const asked = need(t.var, i)
            if (asked) return asked
        } else if (t.kind === 'api') {
            const api = doc.apis.find((a) => a.id === t.config.apiId)
            if (!api) continue
            if (guards.fillMissing)
                for (const inp of apiInputs(api)) {
                    if (scope()[inp]) continue
                    const v = doc.variables.find((x) => x.name === inp)
                    if (v) {
                        const asked = need(v, i)
                        if (asked) return asked
                    }
                }
            if (!/^https?:\/\/[^/\s]+\.[^/\s]+/.test(api.url)) {
                S(toolNode(t), 'rose', `${t.name} lỗi${guards.onError === 'retry' ? ' · đã thử lại' : ''}`)
                continue
            }
            ;(api.outputs || []).forEach((o) => o.var && vals[o.var] === undefined && (vals[o.var] = sampleValue(o.var)))
            S(toolNode(t), 'orange', `Gọi ${t.name} · 200`)
        } else if (t.kind === 'kb' || t.kind === 'retrieverAgentflow') {
            const store = stores.find((s) => s.id === t.config?.storeId)
            if (!store) continue
            const found = search(question, store)
            const wantsAdvice = (sop && /goi y|tu van/.test(stripVi(sop.body))) || /nen mua|goi y|tu van/.test(stripVi(question))
            if (wantsAdvice && storeKey(store) === 'san_pham') {
                products = productsOf(store)
                S(toolNode(t), 'emerald', `Tra ${t.name} · ${products.length} sản phẩm`)
            } else if (found) {
                if (!hit || found.hits > hit.hits) hit = { ...found, tool: t }
                S(toolNode(t), 'emerald', `Tra ${t.name} · 1 đoạn khớp`)
            } else if (sop) S(toolNode(t), undefined, `Tra ${t.name} · không thấy`)
        } else if (t.kind === 'calculator') {
            const price = hit && hit.chunk.pageContent.match(/Giá ([\d.]+)đ/)
            if (price) {
                const months = Number(stripVi(state?.pending ? question : text).match(/(\d+)\s*thang/)?.[1] || 12)
                calc = { months, monthly: Number(price[1].replace(/\./g, '')) / months, total: Number(price[1].replace(/\./g, '')) }
                S(toolNode(t), undefined, `Tính ${vnd(calc.total)} ÷ ${months} tháng`)
            }
        }
    }

    // ---- write the answer
    const hi = given ? `${given} ơi, ` : ''
    let reply
    if (vals.order_status) {
        reply = `${given ? `Dạ ${given}, đơn` : 'Đơn'} ${vals.order_code || 'gần nhất'} của bạn đang “${vals.order_status}”${
            vals.order_eta ? `, dự kiến giao ${vals.order_eta}` : ''
        }.${vals.customer_tier ? ` Cảm ơn bạn đã là ${vals.customer_tier} của Nexora.` : ''}`
    } else if (products?.length) {
        const budget = parseMoney(vals.budget ?? allowed['customer.budget'])
        const interest = allowed['customer.industry'] ? ` (bạn quan tâm ${allowed['customer.industry']})` : ''
        const fit = Number.isNaN(budget)
            ? [...products].sort((a, b) => a.price - b.price).slice(0, 3)
            : products
                  .filter((p) => p.price <= budget)
                  .sort((a, b) => b.price - a.price)
                  .slice(0, 3)
        if (fit.length)
            reply = `${hi}${
                Number.isNaN(budget) ? 'một vài mẫu dễ tiếp cận' : `với ngân sách ${vnd(budget)}`
            }${interest}, tôi đề xuất:\n${fit.map((p) => `• ${p.name} — ${vnd(p.price)}`).join('\n')}`
        else {
            const near = [...products].sort((a, b) => a.price - b.price)[0]
            reply = `${hi}hiện chưa có mẫu nào trong ngân sách ${vnd(budget)}${interest}. Mẫu gần nhất là ${near.name} — ${vnd(
                near.price
            )}.`
        }
    } else if (hit) {
        reply = hit.chunk.pageContent
        if (calc) reply += `\n\nNếu trả góp ${calc.months} tháng (0%), mỗi tháng khoảng ${vnd(calc.monthly)}.`
        if (hit.tool.config?.cite) reply += `\n\nNguồn: ${hit.store.name}`
    } else {
        const research = tools.find((t) => t.kind === 'deepResearch')
        if (research && research.config?.links?.length) {
            const hosts = research.config.links.slice(0, 2).map((l) => l.url.replace(/^https?:\/\//, '').split('/')[0])
            S(toolNode(research), 'teal', `Deep Research · ${hosts.join(', ')}`)
            reply = `Tài liệu nội bộ chưa có thông tin này nên hệ thống đã tìm thêm trên ${research.config.links.length} nguồn web. (Bản prototype: khi chạy thật, agent tổng hợp nội dung kèm trích dẫn.)`
        } else {
            reply = `Chưa tìm thấy thông tin này.${doc.handoff?.enabled ? ' Bạn có muốn chuyển sang nhân viên hỗ trợ không?' : ''}`
        }
    }
    if (doc.rules.length) S('guard', undefined, `Đối chiếu ${doc.rules.length} quy tắc an toàn`)
    return { reply: reply.charAt(0).toUpperCase() + reply.slice(1), steps, state: { vals, pending: null } }
}
