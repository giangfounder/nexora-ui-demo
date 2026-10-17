import PropTypes from 'prop-types'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, ButtonBase, IconButton, InputBase, Menu, MenuItem, Stack, Tooltip, Typography, useTheme } from '@mui/material'
import { alpha, keyframes } from '@mui/material/styles'
import {
    IconApi,
    IconBookFilled,
    IconClipboardListFilled,
    IconMessageCircleFilled,
    IconRefresh,
    IconRoute,
    IconSelector,
    IconSend,
    IconTemplate,
    IconUserFilled,
    IconWorld
} from '@tabler/icons-react'

import {
    InitialsAvatar,
    R_CARD,
    R_CONTROL,
    R_SHELL,
    cardShadow,
    hostOf,
    inputShadow,
    monoSx,
    stripVi,
    toneOf,
    toneText
} from './primitives'
import { STARTER_PROMPTS } from './catalog'
import { compilePlaybook, matchPlaybook, sampleValue } from './planner'
import { TEST_CUSTOMERS, TOKEN_SPLIT, customerValues, interpolate, storeKey } from './tokens'

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
    'a'
])
const VAR_LABEL = { customer_phone: 'số điện thoại đã dùng khi đặt hàng', order_code: 'mã đơn hàng', budget: 'ngân sách dự kiến' }
const varLabel = (v) => VAR_LABEL[v.name] || v.name.replace(/_/g, ' ')
const vnd = (n) => `${Math.round(n).toLocaleString('vi-VN')}đ`
const short = (s = '', n = 22) => (s.length > n ? `${s.slice(0, n)}…` : s)

const parseBudget = (raw = '') => {
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

const productsOf = (store) =>
    (store?.loaders || [])
        .flatMap((l) => l._chunks || [])
        .map((c) => {
            const m = c.pageContent.match(/^(?:Dòng )?([^:]+):.*Giá ([\d.]+)đ/)
            return m ? { name: m[1].trim(), price: Number(m[2].replace(/\./g, '')) } : null
        })
        .filter(Boolean)

const bounce = keyframes`0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}`
const nowHm = () => new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

// Small pill under a bot reply: what the agent actually did (profile read, API call, KB search…).
const TracePill = ({ trace }) => {
    const theme = useTheme()
    const fail = trace.tone === 'rose'
    const spec = toneOf(theme, trace.tone || 'teal')
    const Icon = trace.icon
    return (
        <Box
            component='span'
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                maxWidth: '100%',
                height: 22,
                px: 1,
                borderRadius: R_CONTROL,
                border: `1px solid ${fail ? alpha(theme.palette.error.main, 0.4) : theme.palette.alpha.border}`,
                bgcolor: fail ? alpha(theme.palette.error.main, 0.08) : 'background.paper',
                color: fail ? toneText(theme, spec) : 'text.secondary',
                fontSize: '0.6875rem',
                fontWeight: 500,
                whiteSpace: 'nowrap'
            }}
        >
            {Icon && <Icon size={12} stroke={1.75} style={{ flexShrink: 0, color: fail ? undefined : toneText(theme, spec) }} />}
            <Box component='span' sx={{ overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
                {String(trace.label)
                    .split(TOKEN_SPLIT)
                    .map((part, j) =>
                        j % 2 ? (
                            <Box key={j} component='span' sx={{ ...monoSx, fontSize: '0.6875rem', color: 'text.primary' }}>
                                {part.replace(/[{}]/g, '')}
                            </Box>
                        ) : (
                            part
                        )
                    )}
            </Box>
        </Box>
    )
}
TracePill.propTypes = { trace: PropTypes.object.isRequired }

// Centered marker when a playbook takes over the conversation.
const PlaybookMarker = ({ label }) => {
    const theme = useTheme()
    return (
        <Stack direction='row' justifyContent='center' sx={{ my: 1.5 }}>
            <Box
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1.25,
                    height: 24,
                    borderRadius: '999px',
                    bgcolor: alpha(toneOf(theme, 'amber').main, theme.palette.mode === 'dark' ? 0.18 : 0.1),
                    color: toneText(theme, toneOf(theme, 'amber')),
                    fontSize: '0.75rem',
                    fontWeight: 600
                }}
            >
                <IconRoute size={13} stroke={1.75} />
                {label}
            </Box>
        </Stack>
    )
}
PlaybookMarker.propTypes = { label: PropTypes.node }

const ChatTestPanel = ({ assistantName, welcome, modelLabel, stores, selectedStoreIds, toolState, registry, retrievalQuery }) => {
    const theme = useTheme()
    const listRef = useRef(null)
    const replyTimer = useRef(null)
    const [customerId, setCustomerId] = useState(TEST_CUSTOMERS[1]?.id || null)
    const [custAnchor, setCustAnchor] = useState(null)
    const [starterAnchor, setStarterAnchor] = useState(null)
    const customer = TEST_CUSTOMERS.find((c) => c.id === customerId) || null
    const cust = useMemo(() => customerValues(customer), [customer])

    const greet = () => [
        {
            id: 'g',
            role: 'bot',
            text: interpolate(welcome || 'Xin chào! Mình có thể giúp gì cho bạn?', cust || {}),
            traces: [],
            at: nowHm()
        }
    ]
    const [messages, setMessages] = useState(greet)
    const [input, setInput] = useState('')
    const [typing, setTyping] = useState(false)
    const [run, setRun] = useState(null) // { steps, idx, values, playbook, question }

    const [announce, setAnnounce] = useState('') // latest bot reply, read by screen readers

    const reset = () => {
        clearTimeout(replyTimer.current)
        replyTimer.current = null
        setRun(null)
        setTyping(false)
        setAnnounce('')
        setMessages(greet())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(reset, [customerId, toolState, welcome])
    useEffect(() => () => clearTimeout(replyTimer.current), [])
    useEffect(() => {
        const el = listRef.current
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }, [messages, typing])

    const selectedStores = stores.filter((s) => selectedStoreIds.includes(s.id))

    const searchStores = (text, pool = selectedStores) => {
        const ctx = stripVi(interpolate(retrievalQuery || '', { ...(cust || {}), user_message: '' }))
        const userTokens = stripVi(text)
            .split(/[^a-z0-9]+/)
            .filter((t) => t.length >= 2 && !STOP.has(t))
        const ctxTokens = ctx.split(/[^a-z0-9]+/).filter((t) => t.length >= 3 && !STOP.has(t))
        let best = null
        pool.forEach((store) =>
            (store.loaders || []).forEach((ld) =>
                (ld._chunks || []).forEach((c) => {
                    const hay = stripVi(c.pageContent)
                    const hits = userTokens.filter((t) => hay.includes(t)).length
                    const score = hits + 0.3 * ctxTokens.filter((t) => hay.includes(t)).length
                    if (hits >= 2 && (!best || score > best.score)) best = { score, chunk: c, store }
                })
            )
        )
        return best
    }

    const finalText = (vals, playbook) => {
        const name = vals['customer.name'] || cust?.['customer.name']
        const hi = name ? `Chào ${name}! ` : ''
        if (vals.order_status) {
            const tier = vals.customer_tier ? ` Bạn đang là ${vals.customer_tier}.` : ''
            return `${hi}Đơn ${vals.order_code || 'gần nhất'} của bạn đang “${vals.order_status}”${
                vals.order_eta ? `, dự kiến giao ${vals.order_eta}` : ''
            }.${tier} Bạn cần mình hỗ trợ thêm gì không?`
        }
        if (vals.__products) {
            const budget = parseBudget(vals.budget ?? vals['customer.budget'])
            const all = vals.__products
            const fit = Number.isNaN(budget)
                ? [...all].sort((a, b) => a.price - b.price).slice(0, 3)
                : all
                      .filter((p) => p.price <= budget)
                      .sort((a, b) => b.price - a.price)
                      .slice(0, 3)
            const interest = vals['customer.industry'] ? ` (bạn quan tâm ${vals['customer.industry']})` : ''
            if (!fit.length) {
                const near = [...all].sort((a, b) => a.price - b.price)[0]
                return `${hi}Hiện chưa có mẫu nào trong ngân sách ${vnd(budget)}${interest}. Mẫu gần nhất là ${near.name} — ${vnd(
                    near.price
                )}. Bạn có muốn xem thêm không?`
            }
            return `${hi}${Number.isNaN(budget) ? 'Một vài mẫu dễ tiếp cận' : `Với ngân sách ${vnd(budget)}`}${interest}, mình gợi ý:\n${fit
                .map((p) => `• ${p.name} — ${vnd(p.price)}`)
                .join('\n')}`
        }
        if (vals.__hit) return vals.__hit.chunk.pageContent
        return `${hi}Mình đã xử lý xong yêu cầu “${playbook.name}”.`
    }

    // Executes steps from `from` until the next question or the end.
    const advance = (state, from, traces, prefix = '') => {
        const vals = { ...state.values }
        let failed = false
        for (let i = from; i < state.steps.length; i += 1) {
            const step = state.steps[i]
            if (step.conditional && !failed) continue
            if (step.kind === 'profile') {
                const v = cust?.[step.attr]
                if (v) {
                    vals[step.attr] = v
                    if (step.as) vals[step.as] = v
                    traces.push({ tone: 'teal', icon: IconUserFilled, label: `{{${step.attr}}} = ${short(v)}` })
                }
            } else if (step.kind === 'ask') {
                if (vals[step.var.name] !== undefined) continue
                setRun({ ...state, idx: i, values: vals })
                return {
                    text: `${prefix}Bạn cho mình xin ${varLabel(step.var)} nhé${step.var.required ? '' : ' (gõ "bỏ qua" nếu không có)'}.`,
                    traces
                }
            } else if (step.kind === 'call') {
                const api = step.api
                if (!/^https?:\/\/[^/\s]+\.[^/\s]+/.test(api.url)) {
                    failed = true
                    traces.push({
                        tone: 'rose',
                        icon: IconApi,
                        label: `${api.name} lỗi${toolState.guards.onError === 'retry' ? ' · đã thử lại' : ''}`
                    })
                    if (toolState.guards.onError === 'handoff') {
                        setRun(null)
                        return { text: 'Hệ thống tra cứu đang gặp sự cố, mình chuyển bạn sang nhân viên hỗ trợ ngay nhé.', traces }
                    }
                    continue
                }
                step.outputs.forEach((o) => {
                    if (!vals[o]) vals[o] = sampleValue(o)
                })
                traces.push({ tone: 'orange', icon: IconApi, label: `${api.method} ${api.name} · 200` })
            } else if (step.kind === 'search') {
                const store = stores.find((s) => s.id === step.store.id)
                if (storeKey(step.store) === 'san_pham') vals.__products = productsOf(store)
                else vals.__hit = searchStores(state.question, [store]) || vals.__hit
                traces.push({ tone: 'emerald', icon: IconBookFilled, label: `{{${step.token}}}` })
            }
        }
        setRun(null)
        return { text: finalText(vals, state.playbook), traces }
    }

    const respond = (text) => {
        const norm = stripVi(text)

        if (run) {
            const v = run.steps[run.idx].var
            const skip = !v.required && /bo qua|khong co|skip/.test(norm)
            if (!skip && v.type === 'phone' && !/^0\d{9}$/.test(text.replace(/[\s.-]/g, '')))
                return {
                    text: 'Số điện thoại cần đủ 10 số và bắt đầu bằng 0, bạn kiểm tra lại giúp mình nhé.',
                    traces: [{ tone: 'rose', icon: IconClipboardListFilled, label: `{{${v.name}}} chưa hợp lệ` }]
                }
            if (!skip && v.type === 'number' && Number.isNaN(parseBudget(text)))
                return {
                    text: 'Bạn cho mình con số cụ thể nhé, ví dụ “5 triệu”.',
                    traces: [{ tone: 'rose', icon: IconClipboardListFilled, label: `{{${v.name}}} chưa hợp lệ` }]
                }
            const value = skip ? '' : text.trim()
            return advance(
                { ...run, values: { ...run.values, [v.name]: value } },
                run.idx + 1,
                [{ tone: 'amber', icon: IconClipboardListFilled, label: `{{${v.name}}} = ${skip ? '∅' : short(value)}` }],
                'Cảm ơn bạn! '
            )
        }

        const playbook = matchPlaybook(toolState.playbooks, text)
        if (playbook) {
            const { steps } = compilePlaybook(playbook.script, { registry, toolState, customer: cust })
            return advance({ steps, values: {}, playbook, question: text }, 0, [
                { kind: 'playbook', tone: 'teal', icon: IconRoute, label: `Kịch bản · ${playbook.name}` }
            ])
        }

        const hit = searchStores(text)
        if (hit) {
            const ctxUsed = /\{\{customer\./.test(retrievalQuery || '') && cust
            return {
                text: hit.chunk.pageContent,
                traces: [{ tone: 'emerald', icon: IconBookFilled, label: `{{kb.${storeKey(hit.store)}}}${ctxUsed ? ' + hồ sơ' : ''}` }]
            }
        }

        if (toolState.enabled.deepResearch && toolState.deepResearch.links.length) {
            const hosts = toolState.deepResearch.links.slice(0, 2).map((l) => hostOf(l.url))
            return {
                text: `Mình chưa thấy câu trả lời trong kho tài liệu nên đã nghiên cứu thêm ${toolState.deepResearch.links.length} nguồn. Đây là phản hồi mẫu của bản prototype — khi chạy thật, agent sẽ tổng hợp nội dung kèm trích dẫn.`,
                traces: [{ tone: 'teal', icon: IconWorld, label: `Deep Research · ${hosts.join(', ')}` }]
            }
        }
        return { text: 'Mình chưa có thông tin cho câu hỏi này. Bạn thử gắn thêm kho tài liệu hoặc bật Deep Research nhé.', traces: [] }
    }

    const send = (raw) => {
        const text = (raw ?? input).trim()
        if (!text || typing) return
        setInput('')
        setMessages((m) => [...m, { id: `u${Date.now()}`, role: 'user', text, at: nowHm() }])
        setTyping(true)
        replyTimer.current = setTimeout(() => {
            replyTimer.current = null
            const r = respond(text)
            setMessages((m) => [...m, { id: `b${Date.now()}`, role: 'bot', at: nowHm(), ...r }])
            setAnnounce(r.text)
            setTyping(false)
        }, 550 + Math.random() * 450)
    }

    const pendingVar = run ? run.steps[run.idx]?.var : null
    const dark = theme.palette.mode === 'dark'
    const botName = assistantName?.trim() || 'Trợ lý'
    const custName = customer ? customer.name : 'Khách vãng lai'
    const custMeta = cust
        ? [cust['customer.phone'], cust['customer.type']].filter(Boolean).join(' · ')
        : 'Chưa định danh — agent phải hỏi thông tin'
    const started = messages.some((m) => m.role === 'user')
    const hairline = theme.palette.alpha.border

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: { xs: 640, lg: 'calc(100vh - 168px)' },
                minHeight: 520,
                bgcolor: 'background.paper',
                border: `1px solid ${hairline}`,
                borderRadius: R_SHELL,
                boxShadow: cardShadow(theme, 3),
                overflow: 'hidden'
            }}
        >
            {/* ---------- Header: what is being tested + who the tester plays ---------- */}
            <Box sx={{ px: 2, pt: 1.5, pb: 1.5, borderBottom: `1px solid ${hairline}` }}>
                <Stack direction='row' alignItems='center' spacing={1.5}>
                    <Box
                        aria-hidden
                        sx={{
                            width: 32,
                            height: 32,
                            flexShrink: 0,
                            borderRadius: R_CONTROL,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(theme.palette.primary.main, dark ? 0.22 : 0.1),
                            color: 'primary.main'
                        }}
                    >
                        <IconMessageCircleFilled size={18} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, lineHeight: 1.3 }}>Chat thử</Typography>
                        <Typography noWrap sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                            {[botName, modelLabel && modelLabel !== '—' ? modelLabel : null].filter(Boolean).join(' · ')}
                        </Typography>
                    </Box>
                    <Tooltip title='Bắt đầu lại hội thoại'>
                        <Button
                            size='small'
                            variant='outlined'
                            onClick={reset}
                            startIcon={<IconRefresh size={14} stroke={1.75} />}
                            sx={{ height: 30, color: 'text.primary', borderColor: theme.palette.alpha.borderStrong, fontWeight: 600 }}
                        >
                            Làm mới
                        </Button>
                    </Tooltip>
                </Stack>

                {/* Persona picker: an obvious select, not a hidden title click */}
                <ButtonBase
                    onClick={(e) => setCustAnchor(e.currentTarget)}
                    aria-haspopup='menu'
                    aria-expanded={Boolean(custAnchor)}
                    aria-label={`Đóng vai khách, đang chọn ${custName}`}
                    sx={{
                        mt: 1.5,
                        width: '100%',
                        justifyContent: 'flex-start',
                        gap: 1.25,
                        px: 1.25,
                        py: 1,
                        borderRadius: R_CARD,
                        border: `1px solid ${theme.palette.alpha.borderStrong}`,
                        bgcolor: alpha(theme.palette.text.primary, dark ? 0.04 : 0.02),
                        textAlign: 'left',
                        transition: 'border-color 120ms ease-out, background-color 120ms ease-out',
                        '&:hover': { borderColor: 'text.secondary', bgcolor: theme.palette.alpha.hover },
                        '&.Mui-focusVisible': { boxShadow: theme.customShadows?.focusRing }
                    }}
                >
                    <InitialsAvatar name={customer?.name} size={30} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography noWrap sx={{ fontSize: '0.6875rem', color: 'text.secondary', lineHeight: 1.3 }}>
                            Đóng vai khách
                        </Typography>
                        <Typography noWrap sx={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.35 }}>
                            {custName}
                            <Box component='span' sx={{ ml: 1, fontWeight: 400, fontSize: '0.75rem', color: 'text.secondary' }}>
                                {custMeta}
                            </Box>
                        </Typography>
                    </Box>
                    <IconSelector size={16} stroke={1.75} style={{ flexShrink: 0, color: theme.palette.text.secondary }} />
                </ButtonBase>
            </Box>
            <Menu
                anchorEl={custAnchor}
                open={Boolean(custAnchor)}
                onClose={() => setCustAnchor(null)}
                PaperProps={{ sx: { minWidth: 320 } }}
            >
                <MenuItem
                    selected={!customer}
                    onClick={() => {
                        setCustomerId(null)
                        setCustAnchor(null)
                    }}
                    sx={{ gap: 1.5 }}
                >
                    <InitialsAvatar size={28} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>Khách vãng lai</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Không có hồ sơ</Typography>
                    </Box>
                </MenuItem>
                {TEST_CUSTOMERS.map((c) => (
                    <MenuItem
                        key={c.id}
                        selected={c.id === customerId}
                        onClick={() => {
                            setCustomerId(c.id)
                            setCustAnchor(null)
                        }}
                        sx={{ gap: 1.5 }}
                    >
                        <InitialsAvatar name={c.name} size={28} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography noWrap sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                {c.name}
                            </Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                                {c.phone}
                            </Typography>
                        </Box>
                    </MenuItem>
                ))}
            </Menu>

            {/* ---------- Messages: assistant left, the tester (playing the customer) right ---------- */}
            <Box
                ref={listRef}
                role='log'
                aria-label='Hội thoại thử nghiệm'
                sx={{
                    position: 'relative',
                    flex: 1,
                    overflowY: 'auto',
                    px: 2,
                    pt: 1,
                    pb: 2,
                    bgcolor: alpha(theme.palette.text.primary, dark ? 0.03 : 0.018)
                }}
            >
                <Box
                    aria-live='polite'
                    sx={{
                        position: 'absolute',
                        width: '1px',
                        height: '1px',
                        overflow: 'hidden',
                        clip: 'rect(0 0 0 0)',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {announce}
                </Box>
                {messages.map((m, i) => {
                    const prev = messages[i - 1]
                    const next = messages[i + 1]
                    const firstOfRun = !prev || prev.role !== m.role
                    const lastOfRun = !next || next.role !== m.role
                    const mine = m.role === 'user'
                    const pbTrace = m.traces?.find((t) => t.kind === 'playbook')
                    const traces = (m.traces || []).filter((t) => t.kind !== 'playbook')
                    return (
                        <Fragment key={m.id}>
                            {pbTrace && <PlaybookMarker label={`Áp dụng kịch bản: ${pbTrace.label.replace(/^Kịch bản · /, '')}`} />}
                            <Stack
                                direction='row'
                                alignItems='flex-end'
                                spacing={1}
                                justifyContent={mine ? 'flex-end' : 'flex-start'}
                                sx={{ mt: firstOfRun && !pbTrace ? 2 : 0.5 }}
                            >
                                {!mine && (
                                    <Box sx={{ width: 28, flexShrink: 0 }}>{lastOfRun && <InitialsAvatar name={botName} size={28} />}</Box>
                                )}
                                <Stack alignItems={mine ? 'flex-end' : 'flex-start'} sx={{ maxWidth: '82%', minWidth: 0 }}>
                                    {!mine && (firstOfRun || pbTrace) && (
                                        <Typography
                                            sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', mb: 0.5, ml: 0.25 }}
                                        >
                                            {botName}
                                        </Typography>
                                    )}
                                    <Box
                                        sx={{
                                            px: 1.5,
                                            py: 1,
                                            minWidth: 0,
                                            borderRadius: '16px',
                                            ...(mine
                                                ? {
                                                      borderBottomRightRadius: lastOfRun ? '4px' : '16px',
                                                      bgcolor: 'primary.main',
                                                      color: 'primary.contrastText',
                                                      boxShadow: `0 2px 8px -2px ${alpha(theme.palette.primary.main, 0.45)}`
                                                  }
                                                : {
                                                      borderBottomLeftRadius: lastOfRun ? '4px' : '16px',
                                                      bgcolor: 'background.paper',
                                                      color: 'text.primary',
                                                      border: `1px solid ${hairline}`,
                                                      boxShadow: cardShadow(theme, 1)
                                                  })
                                        }}
                                    >
                                        <Typography
                                            variant='body2'
                                            sx={{
                                                fontSize: '0.875rem',
                                                lineHeight: 1.55,
                                                whiteSpace: 'pre-wrap',
                                                overflowWrap: 'anywhere',
                                                color: 'inherit'
                                            }}
                                        >
                                            {m.text}
                                        </Typography>
                                    </Box>
                                    {traces.length > 0 && (
                                        <Stack direction='row' sx={{ mt: 0.75, flexWrap: 'wrap', gap: 0.5, maxWidth: '100%' }}>
                                            {traces.map((t, k) => (
                                                <TracePill key={k} trace={t} />
                                            ))}
                                        </Stack>
                                    )}
                                    {lastOfRun && (
                                        <Typography
                                            sx={{
                                                mt: 0.5,
                                                px: 0.25,
                                                fontSize: '0.6875rem',
                                                color: 'text.disabled',
                                                fontVariantNumeric: 'tabular-nums'
                                            }}
                                        >
                                            {m.at}
                                        </Typography>
                                    )}
                                </Stack>
                            </Stack>
                        </Fragment>
                    )
                })}
                {typing && (
                    <Stack direction='row' alignItems='flex-end' spacing={1} sx={{ mt: 2 }}>
                        <InitialsAvatar name={botName} size={28} />
                        <Stack
                            direction='row'
                            spacing={0.5}
                            alignItems='center'
                            role='img'
                            aria-label='Đang trả lời'
                            sx={{
                                px: 1.5,
                                height: 36,
                                borderRadius: '16px',
                                borderBottomLeftRadius: '4px',
                                bgcolor: 'background.paper',
                                border: `1px solid ${hairline}`
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
                        </Stack>
                    </Stack>
                )}
            </Box>

            {/* ---------- Footer: suggestions, pending question, composer ---------- */}
            <Box sx={{ px: 2, pb: 2, pt: 1.5, borderTop: `1px solid ${hairline}` }}>
                {!started && !typing && (
                    <Box sx={{ mb: 1.5 }}>
                        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: 'text.secondary', mb: 0.75 }}>
                            Thử nhanh
                        </Typography>
                        <Stack direction='row' sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                            {STARTER_PROMPTS.map((p) => (
                                <ButtonBase
                                    key={p}
                                    onClick={() => send(p)}
                                    sx={{
                                        px: 1.25,
                                        height: 30,
                                        borderRadius: '999px',
                                        border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
                                        color: dark ? 'primary.light' : 'primary.main',
                                        fontSize: '0.8125rem',
                                        fontWeight: 500,
                                        bgcolor: alpha(theme.palette.primary.main, dark ? 0.1 : 0.04),
                                        transition: 'background-color 120ms ease-out',
                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, dark ? 0.18 : 0.1) },
                                        '&.Mui-focusVisible': { boxShadow: theme.customShadows?.focusRing }
                                    }}
                                >
                                    {p}
                                </ButtonBase>
                            ))}
                        </Stack>
                    </Box>
                )}
                {pendingVar && !typing && (
                    <Stack
                        direction='row'
                        alignItems='center'
                        spacing={1}
                        sx={{
                            mb: 1,
                            px: 1.25,
                            py: 0.75,
                            borderRadius: R_CONTROL,
                            bgcolor: alpha(toneOf(theme, 'amber').main, dark ? 0.16 : 0.1),
                            color: toneText(theme, toneOf(theme, 'amber'))
                        }}
                    >
                        <IconClipboardListFilled size={14} style={{ flexShrink: 0 }} />
                        <Typography sx={{ flex: 1, minWidth: 0, fontSize: '0.75rem', fontWeight: 600 }} noWrap>
                            Agent đang chờ: {varLabel(pendingVar)}
                        </Typography>
                        {!pendingVar.required && (
                            <ButtonBase
                                onClick={() => send('bỏ qua')}
                                sx={{
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: 'inherit',
                                    textDecoration: 'underline',
                                    borderRadius: '4px',
                                    '&.Mui-focusVisible': { boxShadow: theme.customShadows?.focusRing }
                                }}
                            >
                                Bỏ qua
                            </ButtonBase>
                        )}
                    </Stack>
                )}
                <Stack
                    direction='row'
                    alignItems='flex-end'
                    spacing={1}
                    sx={{
                        pl: 0.5,
                        pr: 0.5,
                        py: 0.5,
                        border: `1px solid ${theme.palette.alpha.borderStrong}`,
                        borderRadius: '14px',
                        bgcolor: 'background.paper',
                        boxShadow: inputShadow(theme),
                        transition: 'border-color 120ms ease-out, box-shadow 120ms ease-out',
                        '&:focus-within': { borderColor: 'primary.main', boxShadow: theme.customShadows?.focusRing }
                    }}
                >
                    <Tooltip title='Câu mẫu'>
                        <span>
                            <IconButton
                                aria-label='Câu mẫu'
                                aria-haspopup='menu'
                                aria-expanded={Boolean(starterAnchor)}
                                disabled={typing}
                                onClick={(e) => setStarterAnchor(e.currentTarget)}
                                sx={{ width: 36, height: 36, borderRadius: '10px', color: 'text.secondary' }}
                            >
                                <IconTemplate size={18} stroke={1.75} />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <InputBase
                        fullWidth
                        multiline
                        minRows={1}
                        maxRows={6}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.nativeEvent.isComposing || e.keyCode === 229) return
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                send()
                            }
                        }}
                        placeholder={pendingVar ? `Trả lời: ${varLabel(pendingVar)}…` : `Nhắn với ${botName} như một khách hàng…`}
                        inputProps={{ 'aria-label': 'Tin nhắn thử nghiệm' }}
                        sx={{ flex: 1, py: '7px', fontSize: '0.875rem', lineHeight: 1.5 }}
                    />
                    <Tooltip title='Gửi · Enter'>
                        <span>
                            <IconButton
                                aria-label='Gửi'
                                onClick={() => send()}
                                disabled={!input.trim() || typing}
                                sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '10px',
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                    boxShadow: `0 4px 12px -4px ${alpha(theme.palette.primary.main, 0.6)}`,
                                    '&:hover': { bgcolor: 'primary.dark' },
                                    '&.Mui-disabled': {
                                        bgcolor: alpha(theme.palette.text.primary, 0.08),
                                        color: 'text.disabled',
                                        boxShadow: 'none'
                                    }
                                }}
                            >
                                <IconSend size={17} stroke={2} />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Stack>
                <Menu
                    anchorEl={starterAnchor}
                    open={Boolean(starterAnchor)}
                    onClose={() => setStarterAnchor(null)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                    transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    PaperProps={{ sx: { minWidth: 280, maxHeight: 400 } }}
                >
                    {STARTER_PROMPTS.map((p) => (
                        <MenuItem
                            key={p}
                            onClick={() => {
                                setStarterAnchor(null)
                                send(p)
                            }}
                            sx={{ fontSize: '0.875rem' }}
                        >
                            {p}
                        </MenuItem>
                    ))}
                </Menu>
            </Box>
        </Box>
    )
}

ChatTestPanel.propTypes = {
    assistantName: PropTypes.string,
    welcome: PropTypes.string,
    modelLabel: PropTypes.string,
    stores: PropTypes.array,
    selectedStoreIds: PropTypes.array,
    toolState: PropTypes.object,
    registry: PropTypes.object,
    retrievalQuery: PropTypes.string
}

export default ChatTestPanel
