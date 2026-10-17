import PropTypes from 'prop-types'
import { useMemo } from 'react'
import { useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'

import { toneOf } from '@/views/assistants/custom/workspace/primitives'
import { FIXED, TOOL_KINDS } from './nodeCatalog'
import { buildGraph, W } from './layout'

const SIZE = { agent: { w: W.agent, h: 230 }, side: { w: W.side, h: 92 } }

// Miniature of the assistant's capability map — agent in the middle, its tools around it.
const FlowGlyph = ({ doc, height = 136 }) => {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const { nodes, edges } = useMemo(() => buildGraph(doc), [doc])
    const shown = nodes.filter((n) => n.type !== 'label')
    const sizeOf = (n) => (n.type === 'agent' ? SIZE.agent : SIZE.side)

    const box = useMemo(() => {
        const pad = 50
        const minX = Math.min(...shown.map((n) => n.position.x)) - pad
        const minY = Math.min(...shown.map((n) => n.position.y)) - pad
        const maxX = Math.max(...shown.map((n) => n.position.x + sizeOf(n).w)) + pad
        const maxY = Math.max(...shown.map((n) => n.position.y + sizeOf(n).h)) + pad
        return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shown])

    const byId = Object.fromEntries(shown.map((n) => [n.id, n]))
    const colorOf = (n) => {
        if (n.type === 'agent') return theme.palette.primary.main
        const tool = n.type === 'tool' ? doc.tools.find((t) => `tool:${t.id}` === n.id) : null
        const tone = tool ? TOOL_KINDS[tool.kind]?.tone : FIXED[n.data?.kind]?.tone
        return tone ? toneOf(theme, tone).main : alpha(theme.palette.text.primary, 0.45)
    }

    return (
        <svg width='100%' height={height} viewBox={box} preserveAspectRatio='xMidYMid meet' aria-hidden>
            {edges.map((e) => {
                const s = byId[e.source]
                const t = byId[e.target]
                if (!s || !t) return null
                const down = e.sourceHandle === 'down'
                const sx = down ? s.position.x + sizeOf(s).w / 2 : s.position.x + sizeOf(s).w
                const sy = down ? s.position.y + sizeOf(s).h : s.position.y + 40
                const tx = down ? t.position.x + sizeOf(t).w / 2 : t.position.x
                const ty = down ? t.position.y : t.position.y + 40
                const d = down ? `M${sx},${sy} L${tx},${ty}` : `M${sx},${sy} C${sx + 90},${sy} ${tx - 90},${ty} ${tx},${ty}`
                return (
                    <path
                        key={e.id}
                        d={d}
                        fill='none'
                        stroke={alpha(theme.palette.text.primary, isDark ? 0.28 : 0.22)}
                        strokeWidth={1.25}
                        vectorEffect='non-scaling-stroke'
                    />
                )
            })}
            {shown.map((n) => {
                const c = colorOf(n)
                const { w, h } = sizeOf(n)
                return (
                    <rect
                        key={n.id}
                        x={n.position.x}
                        y={n.position.y}
                        width={w}
                        height={h}
                        rx={n.type === 'agent' ? 28 : 18}
                        fill={n.type === 'agent' ? alpha(c, isDark ? 0.45 : 0.3) : alpha(c, isDark ? 0.24 : 0.14)}
                        stroke={c}
                        strokeWidth={n.type === 'agent' ? 2 : 1}
                        vectorEffect='non-scaling-stroke'
                    />
                )
            })}
        </svg>
    )
}

FlowGlyph.propTypes = { doc: PropTypes.object.isRequired, height: PropTypes.number }

export default FlowGlyph
