import { SYSTEM_VARS } from './catalog'
import { stripVi } from './primitives'
import { apiInputs, apiOutputs, refsWithPos } from './tokens'

export { apiInputs, apiOutputs }

const lastMatch = (s, re) => {
    let idx = -1
    for (const m of s.matchAll(re)) idx = m.index
    return idx
}

// A token is conditional when, within its sentence, a "nếu / khi cần / trường hợp" precedes it
// and no sequencing word ("rồi", "sau đó", "tiếp theo") has closed that clause since.
const isConditional = (script, index) => {
    const head = script.slice(0, index)
    const cut = Math.max(head.lastIndexOf('.'), head.lastIndexOf('!'), head.lastIndexOf('?'), head.lastIndexOf('\n'))
    const sentence = stripVi(head.slice(cut + 1))
    const cond = lastMatch(sentence, /\bneu\b|\bkhi can\b|\btruong hop\b/g)
    const reset = lastMatch(sentence, /\broi\b|\bsau do\b|\btiep theo\b|\bva sau\b/g)
    return cond >= 0 && cond > reset
}

/**
 * Compiles a natural-language playbook into ordered steps.
 * customer: undefined → design-time (profile may or may not exist, show both branches)
 *           null      → anonymous visitor; object → known customer's attribute values.
 * Guarantees (guards): an API's inputs are resolved before it runs — profile first, then
 * another API's output, then asking the visitor; known data is not asked again (skipKnown).
 */
export const compilePlaybook = (script, { registry, toolState, customer }) => {
    const guards = toolState.guards
    const design = customer === undefined
    const steps = []
    const issues = []
    const have = new Set(SYSTEM_VARS)
    const called = new Set()
    const searched = new Set()
    const collect = new Map(toolState.collectInfo.variables.map((v) => [v.name, v]))
    const apis = toolState.apiCaller.apis
    const hasProfile = (attr) => (design ? true : !!customer?.[attr])
    const producer = (v) => apis.find((a) => a.enabled !== false && apiOutputs(a).includes(v))
    const issue = (tone, text) => !issues.some((i) => i.text === text) && issues.push({ tone, text })

    const ask = (cv, forApi, conditional) => {
        if (have.has(cv.name)) return
        if (!toolState.enabled.collectInfo) issue('rose', `Cần hỏi {{${cv.name}}} nhưng công cụ Thu thập thông tin đang tắt`)
        steps.push({ kind: 'ask', var: cv, forApi, conditional })
        have.add(cv.name)
    }

    const ensure = (name, forApi, conditional, depth = 0) => {
        if (have.has(name) || depth > 8) return
        if (name.startsWith('customer.')) {
            const fallback = [...collect.values()].find((v) => v.prefill === name)
            if (hasProfile(name)) {
                steps.push({ kind: 'profile', attr: name, as: fallback?.name, orAsk: design ? fallback : undefined, conditional })
                have.add(name)
                if (fallback) have.add(fallback.name)
            } else if (fallback) {
                ask(fallback, forApi, conditional)
                have.add(name)
            } else if (!design) {
                issue('amber', `Khách chưa định danh nên không có {{${name}}}`)
            }
            return
        }
        const cv = collect.get(name)
        if (cv) {
            if (cv.prefill && guards.skipKnown && hasProfile(cv.prefill)) {
                steps.push({ kind: 'profile', attr: cv.prefill, as: cv.name, orAsk: design ? cv : undefined, conditional })
                have.add(cv.name)
                have.add(cv.prefill)
                return
            }
            ask(cv, forApi, conditional)
            return
        }
        const p = producer(name)
        if (p) call(p, conditional, depth + 1)
    }

    const call = (api, conditional, depth = 0) => {
        if (called.has(api.id)) return
        called.add(api.id)
        if (api.enabled === false || !toolState.enabled.apiCaller) {
            issue('rose', `{{api.${api.key}}} đang tắt nên sẽ bị bỏ qua`)
            return
        }
        if (guards.fillMissing) apiInputs(api).forEach((v) => ensure(v, api, conditional, depth))
        const missing = apiInputs(api).filter((v) => !have.has(v))
        steps.push({ kind: 'call', api, missing, outputs: apiOutputs(api), conditional })
        apiOutputs(api).forEach((v) => have.add(v))
        if (missing.length) issue('amber', `{{api.${api.key}}} có thể thiếu ${missing.map((v) => `{{${v}}}`).join(', ')}`)
    }

    const seen = new Set()
    refsWithPos(script).forEach(({ name, index }) => {
        if (seen.has(name)) return
        seen.add(name)
        const t = registry.byName.get(name)
        if (!t) return issue('rose', `{{${name}}} không tồn tại`)
        const conditional = isConditional(script, index)
        if (t.kind === 'api') call(t.ref, conditional)
        else if (t.kind === 'kb') {
            if (searched.has(name)) return
            searched.add(name)
            steps.push({ kind: 'search', store: t.ref, token: name, conditional })
            if (!t.attached) issue('amber', `{{${name}}} chưa được gắn ở tab Kiến thức`)
        } else if (t.kind !== 'system') ensure(name, undefined, conditional)
    })

    return { steps, issues }
}

// Pick the enabled playbook whose "khi nào áp dụng" overlaps the message most.
const STOP = new Set([
    'khach',
    'hoi',
    've',
    'cac',
    'cua',
    'cho',
    'la',
    'va',
    'hoac',
    'gi',
    'nao',
    'minh',
    'ban',
    'giup',
    'nhe',
    'co',
    'khong',
    'the',
    'de',
    'muon',
    'can'
])
const words = (s) =>
    stripVi(s)
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length >= 2 && !STOP.has(w))
export const matchPlaybook = (playbooks, message) => {
    const msg = new Set(words(message))
    let best = null
    playbooks
        .filter((p) => p.enabled !== false)
        .forEach((p) => {
            const score = [...new Set(words(`${p.name} ${p.when}`))].filter((w) => msg.has(w)).length
            if (score >= 2 && (!best || score > best.score)) best = { score, playbook: p }
        })
    return best?.playbook || null
}

const SAMPLE = {
    customer_id: 'CUS-1042',
    customer_tier: 'Thành viên Vàng',
    order_status: 'Đang giao',
    order_eta: '05/10/2026'
}
export const sampleValue = (v) => SAMPLE[v] ?? `${v}_mẫu`

export const sampleResponse = (api) => {
    const root = {}
    ;(api.outputs || []).forEach((o) => {
        if (!o.path) return
        const keys = o.path.split('.')
        let cur = root
        keys.forEach((k, i) => {
            if (i === keys.length - 1) cur[k] = sampleValue(o.var)
            else cur = cur[k] = cur[k] || {}
        })
    })
    return Object.keys(root).length ? root : { ok: true }
}
