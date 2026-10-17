import PropTypes from 'prop-types'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
    Box,
    Button,
    Collapse,
    IconButton,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material'
import { alpha, keyframes } from '@mui/material/styles'
import { AppIcon } from '@/ui-component/icons/AppIcon'

import { R_CARD, R_CONTROL, tintBg, toneOf } from '@/views/assistants/custom/workspace/primitives'
import { TEST_CUSTOMERS, customerValues, interpolate } from '@/views/assistants/custom/workspace/tokens'
import { agentTurn } from './runtime'
import PersonAvatar from '@/ui-component/avatar/PersonAvatar'

const bounce = keyframes`0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}`
const nowHm = () => new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
const STARTERS = [
    'Giờ mở cửa thế nào?',
    'Pulse X1 Pro trả góp 12 tháng bao nhiêu?',
    'Tra cứu đơn hàng giúp mình',
    'Tư vấn giúp mình nên mua gì',
    'Cho mình gặp nhân viên'
]
const STEP_MS = 320

const Trace = ({ steps, onSelectNode }) => {
    const theme = useTheme()
    const [open, setOpen] = useState(false)
    const isDark = theme.palette.mode === 'dark'
    const toolsUsed = new Set(steps.filter((s) => s.nodeId.startsWith('tool:')).map((s) => s.nodeId)).size
    return (
        <Box>
            <Box
                component='button'
                type='button'
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    p: 0,
                    border: 0,
                    bgcolor: 'transparent',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    '&:hover': { color: 'text.primary' },
                    '&:focus-visible': { outline: 'none', boxShadow: theme.customShadows?.focusRing, borderRadius: '4px' }
                }}
            >
                Agent đã làm {steps.length} bước{toolsUsed ? ` · dùng ${toolsUsed} công cụ` : ''}
                <AppIcon
                    name='CaretDown'
                    size={14}
                    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}
                />
            </Box>
            <Collapse in={open}>
                <Stack spacing={0.25} sx={{ mt: 0.75, pl: 1.25, borderLeft: `1px solid ${theme.palette.alpha.borderStrong}` }}>
                    {steps.map((s, i) => {
                        const c = s.tone ? toneOf(theme, s.tone) : null
                        return (
                            <Stack
                                key={i}
                                direction='row'
                                spacing={1}
                                alignItems='center'
                                role='button'
                                tabIndex={0}
                                onClick={() => onSelectNode(s.nodeId)}
                                onKeyDown={(e) => e.key === 'Enter' && onSelectNode(s.nodeId)}
                                sx={{
                                    py: 0.25,
                                    px: 0.5,
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: theme.palette.alpha.hover }
                                }}
                            >
                                <AppIcon
                                    name='CheckCircle'
                                    size={12}
                                    color={c ? c.main : theme.palette.text.disabled}
                                    style={{ flexShrink: 0 }}
                                />
                                <Typography sx={{ fontSize: '0.75rem', color: c ? (isDark ? c.light : c.dark) : 'text.secondary' }}>
                                    {s.label}
                                </Typography>
                            </Stack>
                        )
                    })}
                </Stack>
            </Collapse>
        </Box>
    )
}
Trace.propTypes = { steps: PropTypes.array, onSelectNode: PropTypes.func }

const StudioChat = ({ doc, stores, onRun, onSelectNode }) => {
    const theme = useTheme()
    const endRef = useRef(null)
    const timers = useRef([])
    const [customerId, setCustomerId] = useState(TEST_CUSTOMERS[1]?.id || null)
    const [anchor, setAnchor] = useState(null)
    const customer = TEST_CUSTOMERS.find((c) => c.id === customerId) || null
    const cust = useMemo(() => customerValues(customer), [customer])
    const visible = useMemo(
        () => Object.fromEntries(Object.entries(cust || {}).filter(([k]) => doc.customerAttrs.includes(k))),
        [cust, doc.customerAttrs]
    )

    const greeting = () => [{ id: 'g', role: 'bot', text: interpolate(doc.settings.welcome || 'Xin chào!', visible), at: nowHm() }]
    const [messages, setMessages] = useState(greeting)
    const [input, setInput] = useState('')
    const [busy, setBusy] = useState(false)
    const [agentState, setAgentState] = useState({ vals: {}, pending: null })

    const clearTimers = () => {
        timers.current.forEach(clearTimeout)
        timers.current = []
    }
    const reset = () => {
        clearTimers()
        setMessages(greeting())
        setAgentState({ vals: {}, pending: null })
        setBusy(false)
        onRun({ active: null, used: [] })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(reset, [customerId, doc.settings.welcome])
    useEffect(() => () => clearTimers(), [])
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, [messages, busy])

    const send = (raw) => {
        const text = (raw ?? input).trim()
        if (!text || busy) return
        setInput('')
        setMessages((m) => [...m, { id: `u${Date.now()}`, role: 'user', text, at: nowHm() }])
        const res = agentTurn({ doc, stores, customer: cust, state: agentState, text })
        setBusy(true)
        // replay the agent's decisions on the canvas, one step at a time
        const ids = res.steps.map((s) => s.nodeId)
        ids.forEach((id, i) => timers.current.push(setTimeout(() => onRun({ active: id, used: ids.slice(0, i) }), i * STEP_MS)))
        timers.current.push(
            setTimeout(() => {
                onRun({ active: null, used: ids })
                setMessages((m) => [...m, { id: `b${Date.now()}`, role: 'bot', text: res.reply, steps: res.steps, at: nowHm() }])
                setAgentState(res.state)
                setBusy(false)
            }, Math.max(ids.length, 2) * STEP_MS + 250)
        )
    }

    const botAvatar = <PersonAvatar name={doc.name} size={26} kind='assistant' />

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            <Stack
                direction='row'
                alignItems='center'
                spacing={1}
                sx={{ px: 2, py: 1, borderBottom: `1px solid ${theme.palette.alpha.border}` }}
            >
                <Typography variant='caption' color='text.secondary'>
                    Khách thử
                </Typography>
                <Button
                    size='small'
                    onClick={(e) => setAnchor(e.currentTarget)}
                    endIcon={<AppIcon name='CaretDown' size={14} />}
                    sx={{ color: 'text.primary', px: 1, minWidth: 0, maxWidth: 230 }}
                >
                    <PersonAvatar name={customer?.name} size={20} sx={{ mr: 1 }} />
                    <Box component='span' sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {customer ? customer.name : 'Khách vãng lai'}
                    </Box>
                </Button>
                <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} PaperProps={{ sx: { minWidth: 260 } }}>
                    <MenuItem
                        selected={!customer}
                        onClick={() => {
                            setCustomerId(null)
                            setAnchor(null)
                        }}
                    >
                        <ListItemText
                            primary='Khách vãng lai'
                            secondary='Chưa có hồ sơ — agent phải hỏi'
                            primaryTypographyProps={{ fontSize: '0.875rem' }}
                        />
                    </MenuItem>
                    {TEST_CUSTOMERS.map((c) => (
                        <MenuItem
                            key={c.id}
                            selected={c.id === customerId}
                            onClick={() => {
                                setCustomerId(c.id)
                                setAnchor(null)
                            }}
                        >
                            <ListItemText primary={c.name} secondary={c.phone} primaryTypographyProps={{ fontSize: '0.875rem' }} />
                        </MenuItem>
                    ))}
                </Menu>
                <Box sx={{ flex: 1 }} />
                <Tooltip title='Làm mới hội thoại'>
                    <IconButton size='small' onClick={reset} aria-label='Làm mới hội thoại'>
                        <AppIcon name='ArrowClockwise' size={16} />
                    </IconButton>
                </Tooltip>
            </Stack>

            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 2, py: 2, bgcolor: theme.palette.surface?.sunken }} aria-live='polite'>
                <Stack spacing={2}>
                    {messages.map((m) =>
                        m.role === 'user' ? (
                            <Stack key={m.id} alignItems='flex-end' spacing={0.5}>
                                <Box
                                    sx={{
                                        maxWidth: '85%',
                                        px: 1.5,
                                        py: 1,
                                        borderRadius: R_CARD,
                                        bgcolor: tintBg(theme, theme.palette.primary.main, 0.1, 0.2),
                                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                                    }}
                                >
                                    <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>
                                        {m.text}
                                    </Typography>
                                </Box>
                                <Typography variant='caption' color='text.disabled'>
                                    {m.at}
                                </Typography>
                            </Stack>
                        ) : (
                            <Stack key={m.id} direction='row' spacing={1} alignItems='flex-start'>
                                {botAvatar}
                                <Stack spacing={0.75} sx={{ maxWidth: '88%', minWidth: 0 }}>
                                    <Box
                                        sx={{
                                            px: 1.5,
                                            py: 1,
                                            borderRadius: R_CARD,
                                            bgcolor: 'background.paper',
                                            border: `1px solid ${theme.palette.alpha.border}`
                                        }}
                                    >
                                        <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>
                                            {m.text}
                                        </Typography>
                                    </Box>
                                    {m.steps?.length > 0 && <Trace steps={m.steps} onSelectNode={onSelectNode} />}
                                    <Typography variant='caption' color='text.disabled'>
                                        {m.at}
                                    </Typography>
                                </Stack>
                            </Stack>
                        )
                    )}
                    {busy && (
                        <Stack direction='row' spacing={1} alignItems='center'>
                            {botAvatar}
                            <Stack
                                direction='row'
                                spacing={0.5}
                                alignItems='center'
                                sx={{
                                    px: 1.5,
                                    py: 1.25,
                                    borderRadius: R_CARD,
                                    border: `1px solid ${theme.palette.alpha.border}`,
                                    bgcolor: 'background.paper'
                                }}
                            >
                                {[0, 1, 2].map((i) => (
                                    <Box
                                        key={i}
                                        sx={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: '50%',
                                            bgcolor: 'text.secondary',
                                            animation: `${bounce} 1.2s ${i * 0.15}s infinite ease-in-out`
                                        }}
                                    />
                                ))}
                                <Typography variant='caption' color='text.secondary' sx={{ pl: 1 }}>
                                    Đang tự tìm câu trả lời
                                </Typography>
                            </Stack>
                        </Stack>
                    )}
                    <div ref={endRef} />
                </Stack>
            </Box>

            {messages.length <= 1 && !busy && (
                <Stack direction='row' sx={{ px: 2, pt: 1.5, gap: 1, flexWrap: 'wrap' }}>
                    {STARTERS.map((p) => (
                        <Box
                            key={p}
                            component='button'
                            type='button'
                            onClick={() => send(p)}
                            sx={{
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 999,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                fontSize: '0.8125rem',
                                color: 'text.secondary',
                                bgcolor: 'transparent',
                                border: `1px solid ${theme.palette.alpha.border}`,
                                transition: 'all 120ms ease-out',
                                '&:hover': {
                                    color: 'text.primary',
                                    borderColor: theme.palette.alpha.borderStrong,
                                    bgcolor: theme.palette.alpha.hover
                                },
                                '&:focus-visible': { outline: 'none', boxShadow: theme.customShadows?.focusRing }
                            }}
                        >
                            {p}
                        </Box>
                    ))}
                </Stack>
            )}

            <Stack direction='row' spacing={1} alignItems='flex-end' sx={{ p: 1.5 }}>
                <TextField
                    fullWidth
                    size='small'
                    multiline
                    maxRows={4}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            send()
                        }
                    }}
                    placeholder={agentState.pending ? `Trả lời agent: {{${agentState.pending.var.name}}}…` : 'Hỏi thử bất kỳ điều gì…'}
                    inputProps={{ 'aria-label': 'Tin nhắn thử nghiệm' }}
                />
                <IconButton
                    onClick={() => send()}
                    disabled={!input.trim() || busy}
                    aria-label='Gửi'
                    sx={{
                        width: 40,
                        height: 40,
                        flexShrink: 0,
                        borderRadius: R_CONTROL,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': { bgcolor: 'primary.dark' },
                        '&.Mui-disabled': { bgcolor: theme.palette.alpha.hover, color: 'text.disabled' }
                    }}
                >
                    <AppIcon name='PaperPlaneTilt' size={18} />
                </IconButton>
            </Stack>
        </Box>
    )
}

StudioChat.propTypes = {
    doc: PropTypes.object.isRequired,
    stores: PropTypes.array.isRequired,
    onRun: PropTypes.func.isRequired,
    onSelectNode: PropTypes.func.isRequired
}

export default StudioChat
