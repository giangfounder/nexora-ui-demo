import { TOOL_KINDS } from './nodeCatalog'

export const COL = { input: 0, agent: 380, knowledge: 820, tools: 1140 }
export const W = { side: 264, agent: 340 }
// Rendered card ≈ header 56 + body (2 lines) 58 — keep estimates ≥ real height so columns never overlap.
const H = { info: 118, tool: 118, sop: 118, agent: 240, label: 28 }
const GAP = 20

const stack = (items, x, startY) => {
    let y = startY
    return items.map((it) => {
        const pos = { x, y }
        y += (it.h || H.tool) + GAP
        return { ...it, pos, bottom: y }
    })
}

/**
 * Pure layout: assistant doc → reactflow nodes + edges.
 * Positions are computed per column; a user-dragged node keeps its saved position.
 */
export const buildGraph = (doc) => {
    const saved = doc.positions || {}
    const knowledge = doc.tools.filter((t) => TOOL_KINDS[t.kind]?.column === 'knowledge')
    const tools = doc.tools.filter((t) => TOOL_KINDS[t.kind]?.column === 'tools')

    const left = [
        { id: 'label:input', type: 'label', h: H.label, data: { text: 'Đầu vào' } },
        { id: 'channels', type: 'info', h: H.info, data: { kind: 'channels' } },
        { id: 'profile', type: 'info', h: H.info, data: { kind: 'profile' } },
        { id: 'label:guide', type: 'label', h: H.label, data: { text: 'Chỉ dẫn' } },
        { id: 'guard', type: 'info', h: H.info, data: { kind: 'guard' } },
        ...doc.sops.map((s) => ({ id: `sop:${s.id}`, type: 'info', h: H.sop, data: { kind: 'sop', refId: s.id } }))
    ]
    const colK = [
        { id: 'label:knowledge', type: 'label', h: H.label, data: { text: 'Kiến thức', add: 'knowledge' } },
        ...knowledge.map((t) => ({ id: `tool:${t.id}`, type: 'tool', h: H.tool, data: { refId: t.id } }))
    ]
    const colT = [
        { id: 'label:tools', type: 'label', h: H.label, data: { text: 'Công cụ', add: 'tools' } },
        ...tools.map((t) => ({ id: `tool:${t.id}`, type: 'tool', h: H.tool, data: { refId: t.id } }))
    ]

    const placedLeft = stack(left, COL.input, 0)
    const placedK = stack(colK, COL.knowledge, 0)
    const placedT = stack(colT, COL.tools, 0)
    const tallest = Math.max(...[placedLeft, placedK, placedT].map((c) => c[c.length - 1]?.bottom || 0))
    const agentY = Math.max(40, Math.round((tallest - H.agent - 140) / 2))

    const center = [
        { id: 'agent', type: 'agent', pos: { x: COL.agent, y: agentY }, data: {} },
        { id: 'handoff', type: 'info', pos: { x: COL.agent + (W.agent - W.side) / 2, y: agentY + H.agent + 90 }, data: { kind: 'handoff' } }
    ]

    const all = [...placedLeft, ...placedK, ...placedT, ...center]
    const nodes = all.map((it) => ({
        id: it.id,
        type: it.type,
        position: saved[it.id] || it.pos,
        data: it.data,
        draggable: it.type !== 'label',
        selectable: it.type !== 'label',
        deletable: false
    }))

    const edge = (source, target, sourceHandle, targetHandle, extra = {}) => ({
        id: `${source}->${target}`,
        source,
        target,
        sourceHandle,
        targetHandle,
        type: 'studio',
        ...extra
    })
    const disabled = (t) => t.enabled === false
    const edges = [
        edge('channels', 'agent', 'out', 'in'),
        edge('profile', 'agent', 'out', 'in'),
        edge('guard', 'agent', 'out', 'in'),
        ...doc.sops.map((s) => edge(`sop:${s.id}`, 'agent', 'out', 'in', { data: { muted: s.enabled === false } })),
        ...knowledge.map((t) => edge('agent', `tool:${t.id}`, 'out', 'in', { data: { muted: disabled(t) } })),
        ...tools.map((t) => edge('agent', `tool:${t.id}`, 'out', 'in', { data: { muted: disabled(t) } })),
        edge('agent', 'handoff', 'down', 'top', { data: { muted: !doc.handoff?.enabled } })
    ]
    return { nodes, edges }
}
