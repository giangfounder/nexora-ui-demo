import { refsIn } from '@/views/assistants/custom/workspace/tokens'
import { apiInputs } from '@/views/assistants/custom/workspace/planner'

// Returns { byNode: { [nodeId]: [{ tone, text }] }, list: [{ nodeId, tone, text }] }
export const validateAgent = ({ doc, registry }) => {
    const list = []
    const add = (nodeId, tone, text) => list.push({ nodeId, tone, text })
    const unknown = (nodeId, text) =>
        refsIn(text)
            .filter((t, i, arr) => arr.indexOf(t) === i && !registry.byName.has(t))
            .forEach((t) => add(nodeId, 'rose', `{{${t}}} không tồn tại`))

    if (!doc.settings.instruction.trim()) add('agent', 'amber', 'Chưa có hướng dẫn cho agent')
    unknown('agent', doc.settings.instruction)
    if (!doc.tools.some((t) => t.kind === 'kb' && t.enabled !== false))
        add('agent', 'amber', 'Chưa có kho tài liệu — agent khó trả lời câu hỏi chung')

    doc.tools.forEach((t) => {
        const id = `tool:${t.id}`
        if (!t.when?.trim()) add(id, 'amber', 'Chưa mô tả “Dùng khi” — agent sẽ khó biết lúc nào gọi')
        if (t.kind === 'kb' && !t.config?.storeId) add(id, 'rose', 'Chưa chọn kho tài liệu')
        if (t.kind === 'api') {
            const api = doc.apis.find((a) => a.id === t.config?.apiId)
            if (!api) add(id, 'rose', 'Chưa chọn API')
            else
                apiInputs(api).forEach((v) => {
                    if (v.startsWith('customer.') && !doc.customerAttrs.includes(v))
                        add(id, 'rose', `Cần {{${v}}} nhưng agent chưa được đọc thuộc tính này`)
                    else if (!registry.byName.has(v)) add(id, 'rose', `Cần {{${v}}} nhưng chưa có nguồn`)
                })
        }
    })

    doc.sops.forEach((s) => {
        const id = `sop:${s.id}`
        if (!s.when?.trim()) add(id, 'amber', 'Chưa mô tả khi nào áp dụng')
        if (!s.body?.trim()) add(id, 'amber', 'Quy trình đang trống')
        unknown(id, s.body)
    })

    if (doc.handoff?.enabled && !doc.handoff.when?.trim()) add('handoff', 'amber', 'Chưa mô tả khi nào chuyển nhân viên')
    if (!doc.channels.length) add('channels', 'amber', 'Chưa bật kênh nào')

    const byNode = {}
    list.forEach((it) => (byNode[it.nodeId] = [...(byNode[it.nodeId] || []), it]))
    return { byNode, list }
}
