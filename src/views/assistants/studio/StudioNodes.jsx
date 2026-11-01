import PropTypes from 'prop-types'
import { memo, useContext } from 'react'
import { Handle, Position } from 'reactflow'
import { Box, IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { AppIcon } from '@/ui-component/icons/AppIcon'
import PersonAvatar from '@/ui-component/avatar/PersonAvatar'

import { StatusIcon } from '@/ui-component/table/SharedTable'
import { MetaPill, toneOf } from '@/views/assistants/custom/workspace/primitives'
import { TOKEN_SPLIT, CUSTOMER_ATTRS, storeKey, toneOfKind } from '@/views/assistants/custom/workspace/tokens'
import { tokenColors } from '@/views/assistants/custom/workspace/TokenEditor'
import { CHANNELS, FIXED, TOOL_KINDS } from './nodeCatalog'
import { W } from './layout'
import { StudioContext } from './context'

const mono = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }
const hiddenHandle = { width: 8, height: 8, border: 'none', background: 'transparent', minWidth: 0, minHeight: 0 }

// Read-only text with {{tokens}} tinted by source.
export const Rich = ({ text, lines = 2, size = '0.75rem' }) => {
    const theme = useTheme()
    const { registry } = useContext(StudioContext)
    const parts = String(text || '').split(TOKEN_SPLIT)
    return (
        <Typography
            component='div'
            sx={{
                fontSize: size,
                color: 'text.secondary',
                lineHeight: 1.55,
                display: '-webkit-box',
                WebkitLineClamp: lines,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                wordBreak: 'break-word'
            }}
        >
            {parts.map((p, i) => {
                if (i % 2 === 0) return <span key={i}>{p}</span>
                const name = p.replace(/[{}\s]/g, '')
                const t = registry?.byName.get(name)
                const c = tokenColors(theme, toneOfKind(t?.kind), !t)
                return (
                    <Box
                        key={i}
                        component='span'
                        sx={{ ...mono, fontSize: '0.92em', color: c.fg, bgcolor: c.bg, borderRadius: '3px', px: 0.25 }}
                    >
                        {name}
                    </Box>
                )
            })}
        </Typography>
    )
}
Rich.propTypes = { text: PropTypes.string, lines: PropTypes.number, size: PropTypes.string }

const useCardState = (id, selected, issues) => {
    const theme = useTheme()
    const { run } = useContext(StudioContext)
    const active = run?.active === id
    const used = !active && run?.used?.includes(id)
    const hasError = (issues || []).some((i) => i.tone === 'rose')
    return { theme, active, used, hasError, dim: !!run?.active && !active && !used && id !== 'agent' }
}

const Tile = ({ Icon, tone, size = 28, solid }) => {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const spec = tone ? toneOf(theme, tone) : null
    return (
        <Box
            sx={{
                width: size,
                height: size,
                flexShrink: 0,
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor:
                    solid && spec
                        ? spec.main
                        : spec
                        ? alpha(spec.main, isDark ? 0.2 : 0.12)
                        : alpha(theme.palette.text.primary, isDark ? 0.12 : 0.07),
                color: solid ? theme.palette.primary.contrastText : spec ? (isDark ? spec.light : spec.dark) : 'text.primary'
            }}
        >
            <Icon size={Math.round(size * 0.55)} />
        </Box>
    )
}
Tile.propTypes = { Icon: PropTypes.elementType, tone: PropTypes.string, size: PropTypes.number, solid: PropTypes.bool }

const Card = ({ id, selected, tone, width = W.side, muted, issues, children }) => {
    const { theme, active, used, hasError, dim } = useCardState(id, selected, issues)
    const isDark = theme.palette.mode === 'dark'
    const toneMain = tone ? toneOf(theme, tone).main : theme.palette.primary.main
    return (
        <Box
            sx={{
                width,
                position: 'relative',
                borderRadius: '10px',
                bgcolor: 'background.paper',
                border: `1px ${muted ? 'dashed' : 'solid'} ${
                    selected
                        ? theme.palette.primary.main
                        : active || used
                        ? toneMain
                        : hasError
                        ? alpha(theme.palette.error.main, 0.55)
                        : theme.palette.alpha.borderStrong
                }`,
                boxShadow: selected
                    ? theme.customShadows?.focusRing
                    : active
                    ? `0 0 0 4px ${alpha(toneMain, 0.22)}`
                    : isDark
                    ? 'inset 0 1px 0 rgba(255,255,255,0.04)'
                    : '0 1px 2px rgba(15,23,42,0.05)',
                opacity: muted ? 0.55 : dim ? 0.45 : 1,
                transition: 'border-color 200ms ease-out, box-shadow 200ms ease-out, opacity 200ms ease-out'
            }}
        >
            {children}
        </Box>
    )
}
Card.propTypes = {
    id: PropTypes.string,
    selected: PropTypes.bool,
    tone: PropTypes.string,
    width: PropTypes.number,
    muted: PropTypes.bool,
    issues: PropTypes.array,
    children: PropTypes.node
}

const Header = ({ Icon, tone, title, caption, id, issues }) => {
    const { run } = useContext(StudioContext)
    const active = run?.active === id
    return (
        <Stack direction='row' spacing={1.25} alignItems='center' sx={{ px: 1.5, pt: 1.5, pb: 1 }}>
            <Tile Icon={Icon} tone={tone} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography noWrap sx={{ fontSize: '0.84375rem', fontWeight: 600, lineHeight: 1.3 }} title={title}>
                    {title}
                </Typography>
                {caption && (
                    <Typography noWrap sx={{ fontSize: '0.71875rem', color: 'text.secondary', lineHeight: 1.4 }}>
                        {caption}
                    </Typography>
                )}
            </Box>
            {active && <StatusIcon tone={tone || 'teal'} icon='Lightning' />}
            {!active && issues?.length > 0 && (
                <Tooltip title={issues.map((i) => i.text).join(' · ')}>
                    <Box
                        component='span'
                        sx={{ display: 'flex', color: issues.some((i) => i.tone === 'rose') ? 'error.main' : 'warning.main' }}
                    >
                        <AppIcon name='Warning' size={14} />
                    </Box>
                </Tooltip>
            )}
        </Stack>
    )
}
Header.propTypes = {
    Icon: PropTypes.elementType,
    tone: PropTypes.string,
    title: PropTypes.node,
    caption: PropTypes.node,
    id: PropTypes.string,
    issues: PropTypes.array
}

const Body = ({ children }) => {
    const theme = useTheme()
    return <Box sx={{ px: 1.5, py: 1, borderTop: `1px solid ${theme.palette.alpha.border}` }}>{children}</Box>
}
Body.propTypes = { children: PropTypes.node }

// ------------------------------------------------------------------ Agent (the brain)
export const AgentNode = memo(function AgentNode({ id, selected }) {
    const theme = useTheme()
    const { doc, models, run, issues } = useContext(StudioContext)
    const isDark = theme.palette.mode === 'dark'
    const thinking = run?.active === 'agent'
    const model = models?.find((m) => m.name === doc.settings.modelName)
    const kb = doc.tools.filter((t) => TOOL_KINDS[t.kind]?.column === 'knowledge' && t.enabled !== false).length
    const tl = doc.tools.filter((t) => TOOL_KINDS[t.kind]?.column === 'tools' && t.enabled !== false).length
    const nodeIssues = issues?.agent || []
    return (
        <Box
            sx={{
                width: W.agent,
                borderRadius: '12px',
                bgcolor: 'background.paper',
                border: `1px solid ${selected ? theme.palette.primary.main : alpha(theme.palette.primary.main, isDark ? 0.55 : 0.4)}`,
                boxShadow: selected
                    ? theme.customShadows?.focusRing
                    : thinking
                    ? `0 0 0 6px ${alpha(theme.palette.primary.main, 0.18)}`
                    : isDark
                    ? 'inset 0 1px 0 rgba(255,255,255,0.05)'
                    : '0 4px 16px -6px rgba(15,23,42,0.12)',
                overflow: 'hidden',
                transition: 'box-shadow 200ms ease-out, border-color 200ms ease-out'
            }}
        >
            <Handle type='target' id='in' position={Position.Left} isConnectable={false} style={{ ...hiddenHandle, left: -4, top: 44 }} />
            <Handle
                type='source'
                id='out'
                position={Position.Right}
                isConnectable={false}
                style={{ ...hiddenHandle, right: -4, top: 44 }}
            />
            <Handle type='source' id='down' position={Position.Bottom} isConnectable={false} style={{ ...hiddenHandle, bottom: -4 }} />

            <Stack
                direction='row'
                spacing={1.5}
                alignItems='center'
                sx={{ px: 2, py: 1.75, bgcolor: alpha(theme.palette.primary.main, isDark ? 0.12 : 0.06) }}
            >
                <PersonAvatar name={doc.name} kind='assistant' size={40} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography noWrap sx={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.3 }}>
                        {doc.name}
                    </Typography>
                    <Typography noWrap sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        Agent · {model?.short || doc.settings.modelName}
                    </Typography>
                </Box>
                {thinking && <StatusIcon tone='orange' icon='CircleNotch' spin />}
                {!thinking && nodeIssues.length > 0 && (
                    <Tooltip title={nodeIssues.map((i) => i.text).join(' · ')}>
                        <Box component='span' sx={{ display: 'flex', color: 'warning.main' }}>
                            <AppIcon name='Warning' size={16} />
                        </Box>
                    </Tooltip>
                )}
            </Stack>

            <Box sx={{ px: 2, py: 1.5 }}>
                <Rich
                    text={doc.settings.instruction || 'Chưa có hướng dẫn — nhấp để viết vai trò và cách trả lời.'}
                    lines={4}
                    size='0.78125rem'
                />
            </Box>

            <Stack direction='row' sx={{ px: 2, pb: 1.75, gap: 0.5, flexWrap: 'wrap' }}>
                <MetaPill tone='emerald'>{kb} kho tài liệu</MetaPill>
                <MetaPill tone='orange'>{tl} công cụ</MetaPill>
                <MetaPill tone='amber'>{doc.sops.filter((s) => s.enabled !== false).length} quy trình</MetaPill>
                <MetaPill>Nhớ {doc.settings.memory} tin</MetaPill>
            </Stack>
        </Box>
    )
})
AgentNode.propTypes = { id: PropTypes.string, selected: PropTypes.bool }

// ------------------------------------------------------------------ Tools & knowledge
export const ToolNode = memo(function ToolNode({ id, data, selected }) {
    const { doc, stores, issues } = useContext(StudioContext)
    const t = doc.tools.find((x) => x.id === data.refId)
    if (!t) return null
    const def = TOOL_KINDS[t.kind] || {}
    let caption = def.label
    if (t.kind === 'kb') {
        const s = stores.find((x) => x.id === t.config.storeId)
        const chunks = (s?.loaders || []).reduce((n, l) => n + (l.totalChunks || 0), 0)
        caption = s ? `{{kb.${storeKey(s)}}} · ${chunks} đoạn` : 'Chưa chọn kho'
    }
    if (t.kind === 'api') {
        const api = doc.apis.find((a) => a.id === t.config.apiId)
        caption = api ? `${api.method} · ${api.url.replace(/^https?:\/\//, '').split('/')[0]}` : 'Chưa chọn API'
    }
    if (t.kind === 'deepResearch') caption = `${t.config?.links?.length || 0} nguồn URL · độ sâu ${t.config?.depth || 3}`
    return (
        <Card id={id} selected={selected} tone={def.tone} muted={t.enabled === false} issues={issues?.[id]}>
            <Handle type='target' id='in' position={Position.Left} isConnectable={false} style={{ ...hiddenHandle, left: -4, top: 30 }} />
            <Header
                id={id}
                Icon={def.Icon}
                tone={def.tone}
                title={t.name}
                caption={t.kind === 'kb' ? <Rich text={caption} lines={1} size='0.71875rem' /> : caption}
                issues={issues?.[id]}
            />
            <Body>
                <Rich text={t.when ? `Dùng khi: ${t.when}` : 'Chưa mô tả khi nào dùng'} lines={2} />
            </Body>
        </Card>
    )
})
ToolNode.propTypes = { id: PropTypes.string, data: PropTypes.object, selected: PropTypes.bool }

// ------------------------------------------------------------------ Inputs, guidance, handoff
export const InfoNode = memo(function InfoNode({ id, data, selected }) {
    const { doc, issues } = useContext(StudioContext)
    const kind = data.kind
    const def = FIXED[kind]
    let title = def.label
    let caption
    let body
    let muted = false
    if (kind === 'channels') {
        caption = `${doc.channels.length} kênh`
        body = (
            <Rich
                text={
                    doc.channels
                        .map((c) => CHANNELS.find((x) => x.id === c)?.label)
                        .filter(Boolean)
                        .join(' · ') || 'Chưa chọn kênh'
                }
                lines={2}
            />
        )
    } else if (kind === 'profile') {
        caption = `Agent đọc ${doc.customerAttrs.length}/${CUSTOMER_ATTRS.length} thuộc tính`
        body = <Rich text={doc.customerAttrs.map((k) => `{{${k}}}`).join(' ')} lines={2} />
    } else if (kind === 'guard') {
        caption = `${doc.rules.length} quy tắc`
        body = <Rich text={doc.rules.length ? doc.rules.map((r) => `• ${r}`).join('  ') : 'Chưa có quy tắc'} lines={2} />
    } else if (kind === 'sop') {
        const s = doc.sops.find((x) => x.id === data.refId)
        if (!s) return null
        title = s.name
        caption = 'Quy trình'
        muted = s.enabled === false
        body = <Rich text={s.when ? `Áp dụng khi: ${s.when}` : 'Chưa mô tả khi nào áp dụng'} lines={2} />
    } else if (kind === 'handoff') {
        caption = `Nhóm ${doc.handoff.team}`
        muted = !doc.handoff.enabled
        body = <Rich text={`Khi: ${doc.handoff.when}`} lines={2} />
    }
    return (
        <Card id={id} selected={selected} tone={def.tone} muted={muted} issues={issues?.[id]}>
            {kind === 'handoff' ? (
                <Handle type='target' id='top' position={Position.Top} isConnectable={false} style={{ ...hiddenHandle, top: -4 }} />
            ) : (
                <Handle
                    type='source'
                    id='out'
                    position={Position.Right}
                    isConnectable={false}
                    style={{ ...hiddenHandle, right: -4, top: 30 }}
                />
            )}
            <Header id={id} Icon={def.Icon} tone={def.tone} title={title} caption={caption} issues={issues?.[id]} />
            <Body>{body}</Body>
        </Card>
    )
})
InfoNode.propTypes = { id: PropTypes.string, data: PropTypes.object, selected: PropTypes.bool }

// ------------------------------------------------------------------ Column labels
export const LabelNode = memo(function LabelNode({ data }) {
    const theme = useTheme()
    const { onAddColumn } = useContext(StudioContext)
    return (
        <Stack direction='row' alignItems='center' spacing={1} sx={{ width: W.side, height: 28 }}>
            <Typography variant='h6' sx={{ color: 'text.secondary', letterSpacing: '0.08em' }}>
                {data.text}
            </Typography>
            <Box sx={{ flex: 1, height: '1px', bgcolor: theme.palette.alpha.border }} />
            {data.add && (
                <Tooltip title={data.add === 'knowledge' ? 'Thêm kho tài liệu' : 'Thêm công cụ'}>
                    <IconButton
                        size='small'
                        className='nodrag'
                        aria-label={data.add === 'knowledge' ? 'Thêm kho tài liệu' : 'Thêm công cụ'}
                        onClick={(e) => onAddColumn?.(data.add, e.currentTarget)}
                        sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '6px',
                            border: `1px solid ${theme.palette.alpha.borderStrong}`,
                            '&:hover': { borderColor: 'primary.main', color: 'primary.main' }
                        }}
                    >
                        <AppIcon name='Plus' size={14} />
                    </IconButton>
                </Tooltip>
            )}
        </Stack>
    )
})
LabelNode.propTypes = { data: PropTypes.object }
