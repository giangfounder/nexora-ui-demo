import { Fragment, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { alpha, useTheme } from '@mui/material/styles'
import { Avatar, Box, Button, ButtonBase, Collapse, Menu, MenuItem, Stack, Tooltip, Typography } from '@mui/material'
import { IconArrowRight, IconChevronDown, IconCornerDownRight, IconUserPlus } from '@tabler/icons-react'

import { useLanguage } from '@/store/context/LanguageContext'
import ExportMenu from '@/ui-component/export/ExportMenu'
import { exportTables } from '@/utils/tableExport'
import { mockEmployees } from '@/views/employees/mockEmployees'
import { getAvatarColorKey, getInitials, tintBg, tintText } from './utils'
import { atlasActions, atlasSignals } from './mockAtlas'

// ==============================|| CUSTOMERS — ANALYSIS ||============================== //
// A manager's desk, not a feed: decide on actions (own them, track them), then check the signals behind them.

const PRIORITY = {
    high: { label: 'Cao', tone: 'rose', rank: 0 },
    medium: { label: 'Vừa', tone: 'amber', rank: 1 },
    low: { label: 'Thấp', tone: 'teal', rank: 2 }
}

const STATUS = {
    new: { label: 'Chưa làm', tone: 'orange' },
    doing: { label: 'Đang làm', tone: 'amber' },
    done: { label: 'Xong', tone: 'emerald' },
    dismissed: { label: 'Bỏ qua', tone: 'teal' }
}
const STATUS_ORDER = ['new', 'doing', 'done', 'dismissed']

const RANGES = [
    { id: '7d', label: '7 ngày', points: 3 },
    { id: '30d', label: '30 ngày', points: 5 },
    { id: '90d', label: '90 ngày', points: 8 }
]

const fmtNum = (v, unit = '', locale = 'vi-VN') =>
    `${Number.isInteger(v) ? v.toLocaleString(locale) : v.toLocaleString(locale, { maximumFractionDigits: 1 })}${unit}`
// dd/mm/yyyy in Vietnamese, mm/dd/yyyy in English; `short` drops the year.
const fmtDate = (iso, locale = 'vi-VN', short = false) => {
    const [y, m, d] = iso.split('-').map(Number)
    const opts = short ? { day: '2-digit', month: '2-digit' } : { day: '2-digit', month: '2-digit', year: 'numeric' }
    return new Date(y, m - 1, d).toLocaleDateString(locale, opts)
}
const daysUntil = (iso) => Math.ceil((new Date(`${iso}T23:59:59`) - new Date()) / 86400000)

const Spark = ({ values, color }) => {
    const w = 88
    const h = 26
    const min = Math.min(...values)
    const max = Math.max(...values)
    const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - 3 - ((v - min) / (max - min || 1)) * (h - 6)])
    const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
    const [lx, ly] = pts[pts.length - 1]
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden style={{ display: 'block', overflow: 'visible' }}>
            <path d={d} fill='none' stroke={color} strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' />
            <circle cx={lx} cy={ly} r='2.5' fill={color} />
        </svg>
    )
}

Spark.propTypes = { values: PropTypes.array.isRequired, color: PropTypes.string.isRequired }

const Pill = ({ tone, children, sx }) => {
    const theme = useTheme()
    const spec = theme.palette.spectrum?.[tone] || theme.palette.primary
    return (
        <Box
            component='span'
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.625,
                height: 24,
                px: 1,
                borderRadius: '7px',
                fontSize: '0.75rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                color: tintText(theme, spec),
                bgcolor: tintBg(theme, spec.main, 0.12, 0.22),
                ...sx
            }}
        >
            <Box component='span' sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: spec.main }} />
            {children}
        </Box>
    )
}

Pill.propTypes = { tone: PropTypes.string, children: PropTypes.node, sx: PropTypes.object }

const Person = ({ id, size = 24 }) => {
    const theme = useTheme()
    const emp = mockEmployees.find((e) => e.id === id)
    if (!emp) return null
    const ck = getAvatarColorKey(emp.name)
    return (
        <Avatar
            sx={{
                width: size,
                height: size,
                fontSize: size * 0.4,
                fontWeight: 700,
                bgcolor: tintBg(theme, theme.palette[ck].main, 0.16, 0.24),
                color: tintText(theme, theme.palette[ck])
            }}
        >
            {getInitials(emp.name)}
        </Avatar>
    )
}

Person.propTypes = { id: PropTypes.string, size: PropTypes.number }

const COLS = '6px minmax(260px, 2.4fr) minmax(150px, 1.2fr) 90px 170px 110px 130px'

const AtlasInsightTab = () => {
    const { t, locale } = useLanguage()
    const theme = useTheme()
    const navigate = useNavigate()
    const hairline = theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08)
    const faint = theme.palette.alpha?.divider || alpha(theme.palette.text.primary, 0.05)
    const num = (v, unit) => fmtNum(v, t(unit), locale)

    const [range, setRange] = useState('30d')
    const [actions, setActions] = useState(atlasActions)
    const [statusFilter, setStatusFilter] = useState('open')
    const [expanded, setExpanded] = useState(null)
    const [menu, setMenu] = useState(null) // { kind: 'owner'|'status', id, anchor }

    const points = RANGES.find((r) => r.id === range)?.points || 5
    const signals = useMemo(
        () =>
            atlasSignals.map((s) => {
                const series = s.series.slice(-points)
                // short labels are translated; narrative fields (detail, source) stay as data
                return {
                    ...s,
                    title: t(s.title),
                    metric: t(s.metric),
                    scope: t(s.scope),
                    series,
                    before: series[0],
                    after: series[series.length - 1]
                }
            }),
        [points, t]
    )
    const signalById = Object.fromEntries(signals.map((s) => [s.id, s]))

    const openActions = actions.filter((a) => a.status === 'new' || a.status === 'doing')
    const counts = {
        open: openActions.length,
        ...Object.fromEntries(STATUS_ORDER.map((st) => [st, actions.filter((a) => a.status === st).length]))
    }
    const visible = actions
        .filter((a) =>
            statusFilter === 'open' ? a.status === 'new' || a.status === 'doing' : statusFilter === 'all' || a.status === statusFilter
        )
        .sort((a, b) => PRIORITY[a.priority].rank - PRIORITY[b.priority].rank || a.due.localeCompare(b.due))

    const unowned = openActions.filter((a) => !a.owner).length
    const overdue = openActions.filter((a) => daysUntil(a.due) < 0).length
    const affected = openActions.reduce((s, a) => s + a.affected, 0)
    const badSignals = signals.filter((s) => s.impact === 'bad').length

    const update = (id, patch) => setActions((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))

    const deltaOf = (s) => (s.before ? ((s.after - s.before) / s.before) * 100 : 0)
    const toneOfImpact = (impact) =>
        impact === 'bad' ? theme.palette.error.main : impact === 'good' ? theme.palette.success.main : theme.palette.text.secondary

    // ---------- export ----------
    const handleExport = (format) =>
        exportTables({
            title: `${t('Phân tích khách hàng')} — NEXORA`,
            slug: 'phan-tich-khach-hang',
            key: 'customer-analysis',
            format,
            info: [
                [t('Khoảng thời gian'), t(RANGES.find((r) => r.id === range)?.label)],
                [t('Việc đang mở'), String(openActions.length)],
                [t('Khách bị ảnh hưởng'), String(affected)]
            ],
            tables: [
                {
                    name: t('Việc cần quyết định'),
                    columns: [
                        { key: 'priority', label: t('Ưu tiên') },
                        { key: 'title', label: t('Việc') },
                        { key: 'why', label: t('Lý do') },
                        { key: 'impact', label: t('Tác động dự kiến') },
                        { key: 'affected', label: t('Khách liên quan') },
                        { key: 'effort', label: t('Công sức') },
                        { key: 'owner', label: t('Phụ trách') },
                        { key: 'due', label: t('Hạn') },
                        { key: 'status', label: t('Trạng thái') },
                        { key: 'signals', label: t('Tín hiệu gốc') }
                    ],
                    rows: [...actions]
                        .sort((a, b) => PRIORITY[a.priority].rank - PRIORITY[b.priority].rank)
                        .map((a) => ({
                            priority: t(PRIORITY[a.priority].label),
                            title: a.title,
                            why: a.why,
                            impact: a.impact,
                            affected: a.affected,
                            effort: t(a.effort),
                            owner: mockEmployees.find((e) => e.id === a.owner)?.name || t('Chưa giao'),
                            due: fmtDate(a.due, locale),
                            status: t(STATUS[a.status].label),
                            signals: a.signalIds
                                .map((id) => signalById[id]?.title)
                                .filter(Boolean)
                                .join('; ')
                        }))
                },
                {
                    name: t('Tín hiệu'),
                    columns: [
                        { key: 'title', label: t('Tín hiệu') },
                        { key: 'metric', label: t('Chỉ số') },
                        { key: 'before', label: t('Đầu kỳ') },
                        { key: 'after', label: t('Hiện tại') },
                        { key: 'delta', label: t('Thay đổi (%)') },
                        { key: 'impact', label: t('Đánh giá') },
                        { key: 'scope', label: t('Phạm vi') },
                        { key: 'detail', label: t('Chi tiết') },
                        { key: 'source', label: t('Nguồn dữ liệu') }
                    ],
                    rows: signals.map((s) => ({
                        title: s.title,
                        metric: s.metric,
                        before: s.before,
                        after: s.after,
                        delta: Math.round(deltaOf(s) * 10) / 10,
                        impact: t(s.impact === 'bad' ? 'Xấu đi' : s.impact === 'good' ? 'Tốt lên' : 'Theo dõi'),
                        scope: s.scope,
                        detail: s.detail,
                        source: s.source
                    }))
                }
            ]
        })

    const Stat = ({ value, label, tone, onClick }) => (
        <ButtonBase
            onClick={onClick}
            disabled={!onClick}
            sx={{
                flex: 1,
                minWidth: 150,
                px: 2.5,
                py: 2,
                justifyContent: 'flex-start',
                textAlign: 'left',
                gap: 1.5,
                '&:not(:last-of-type)': { borderRight: `1px solid ${hairline}` },
                '&:hover': onClick ? { bgcolor: alpha(theme.palette.text.primary, 0.025) } : undefined,
                '&.Mui-focusVisible': { boxShadow: theme.customShadows?.focusRing }
            }}
        >
            <Typography
                component='span'
                sx={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: tone || 'grey.900' }}
            >
                {value}
            </Typography>
            <Typography component='span' variant='body2' sx={{ color: 'text.secondary', lineHeight: 1.3 }}>
                {label}
            </Typography>
        </ButtonBase>
    )

    Stat.propTypes = { value: PropTypes.node, label: PropTypes.node, tone: PropTypes.string, onClick: PropTypes.func }

    const menuAction = menu && actions.find((a) => a.id === menu.id)

    return (
        <Stack spacing={3}>
            {/* Header */}
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'flex-end' }} justifyContent='space-between' spacing={2}>
                <Box>
                    <Typography variant='h2' component='h2'>
                        {t('Phân tích khách hàng')}
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.5 }}>
                        {t('Cập nhật 10:30 hôm nay')} · {t('từ hội thoại và hồ sơ khách')}
                    </Typography>
                </Box>
                <Stack direction='row' spacing={1} alignItems='center'>
                    <Stack
                        direction='row'
                        role='tablist'
                        aria-label={t('Khoảng thời gian')}
                        sx={{ p: 0.5, gap: 0.5, borderRadius: '10px', bgcolor: alpha(theme.palette.text.primary, 0.04) }}
                    >
                        {RANGES.map((r) => (
                            <ButtonBase
                                key={r.id}
                                role='tab'
                                aria-selected={range === r.id}
                                onClick={() => setRange(r.id)}
                                sx={{
                                    px: 1.5,
                                    height: 30,
                                    borderRadius: '7px',
                                    typography: 'tabItem',
                                    fontSize: '0.8125rem',
                                    fontWeight: range === r.id ? 600 : 500,
                                    color: range === r.id ? 'grey.900' : 'text.primary',
                                    bgcolor: range === r.id ? 'background.paper' : 'transparent',
                                    boxShadow: range === r.id ? theme.customShadows?.xs : 'none'
                                }}
                            >
                                {t(r.label)}
                            </ButtonBase>
                        ))}
                    </Stack>
                    <ExportMenu caption={`${t('Xuất')} · ${t('Phân tích khách hàng')}`} onExport={handleExport} />
                </Stack>
            </Stack>

            {/* Where things stand — each number is a shortcut into the queue */}
            <Stack
                direction='row'
                flexWrap='wrap'
                sx={{ border: `1px solid ${hairline}`, borderRadius: '12px', bgcolor: 'background.paper', overflow: 'hidden' }}
            >
                <Stat value={openActions.length} label={t('việc đang chờ quyết định')} onClick={() => setStatusFilter('open')} />
                <Stat
                    value={unowned}
                    label={t('việc chưa có người phụ trách')}
                    tone={unowned ? theme.palette.warning.dark : undefined}
                    onClick={() => setStatusFilter('new')}
                />
                <Stat value={overdue} label={t('việc quá hạn')} tone={overdue ? theme.palette.error.main : undefined} />
                <Stat value={affected} label={t('khách bị ảnh hưởng')} />
                <Stat
                    value={`${badSignals}/${signals.length}`}
                    label={t('tín hiệu đang xấu đi')}
                    tone={badSignals ? theme.palette.error.main : undefined}
                />
            </Stack>

            {/* Decisions queue */}
            <Box sx={{ border: `1px solid ${hairline}`, borderRadius: '12px', bgcolor: 'background.paper', overflow: 'hidden' }}>
                <Stack
                    direction='row'
                    alignItems='center'
                    justifyContent='space-between'
                    flexWrap='wrap'
                    gap={1.5}
                    sx={{ px: 2.5, py: 1.75 }}
                >
                    <Typography variant='h3' component='h3'>
                        {t('Việc cần quyết định')}
                    </Typography>
                    <Stack direction='row' gap={0.5} flexWrap='wrap'>
                        {[
                            ['open', 'Đang mở'],
                            ['new', 'Chưa làm'],
                            ['doing', 'Đang làm'],
                            ['done', 'Xong'],
                            ['all', 'Tất cả']
                        ].map(([id, label]) => {
                            const active = statusFilter === id
                            const n = id === 'all' ? actions.length : counts[id]
                            return (
                                <ButtonBase
                                    key={id}
                                    onClick={() => setStatusFilter(id)}
                                    aria-pressed={active}
                                    sx={{
                                        px: 1.25,
                                        height: 30,
                                        gap: 0.75,
                                        borderRadius: '8px',
                                        typography: 'tabItem',
                                        fontSize: '0.8125rem',
                                        fontWeight: active ? 600 : 500,
                                        color: active ? 'primary.main' : 'text.primary',
                                        bgcolor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                        '&:hover': {
                                            bgcolor: active
                                                ? alpha(theme.palette.primary.main, 0.12)
                                                : alpha(theme.palette.text.primary, 0.04)
                                        }
                                    }}
                                >
                                    {t(label)}
                                    <Box
                                        component='span'
                                        sx={{ color: active ? 'primary.main' : 'text.disabled', fontVariantNumeric: 'tabular-nums' }}
                                    >
                                        {n}
                                    </Box>
                                </ButtonBase>
                            )
                        })}
                    </Stack>
                </Stack>

                <Box sx={{ overflowX: 'auto' }}>
                    <Box sx={{ minWidth: 980 }}>
                        {/* column header */}
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: COLS,
                                columnGap: 2,
                                alignItems: 'center',
                                px: 2.5,
                                py: 1,
                                borderTop: `1px solid ${faint}`,
                                borderBottom: `1px solid ${faint}`,
                                bgcolor: alpha(theme.palette.text.primary, 0.02)
                            }}
                        >
                            <span />
                            {['Việc', 'Tác động dự kiến', 'Khách', 'Phụ trách', 'Hạn', 'Trạng thái'].map((h) => (
                                <Typography
                                    key={h}
                                    variant='caption'
                                    sx={{ fontWeight: 600, color: 'text.secondary', textAlign: h === 'Khách' ? 'right' : 'left' }}
                                >
                                    {t(h)}
                                </Typography>
                            ))}
                        </Box>

                        {visible.length === 0 && (
                            <Typography variant='body2' sx={{ px: 2.5, py: 5, color: 'text.secondary', textAlign: 'center' }}>
                                {t('Không có việc nào ở trạng thái này.')}
                            </Typography>
                        )}

                        {visible.map((a) => {
                            const pr = PRIORITY[a.priority]
                            const prColor = theme.palette.spectrum?.[pr.tone]?.main || theme.palette.warning.main
                            const left = daysUntil(a.due)
                            const isOpen = a.status === 'new' || a.status === 'doing'
                            const isExpanded = expanded === a.id
                            const owner = mockEmployees.find((e) => e.id === a.owner)
                            return (
                                <Fragment key={a.id}>
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: COLS,
                                            columnGap: 2,
                                            alignItems: 'center',
                                            px: 2.5,
                                            py: 1.5,
                                            borderBottom: `1px solid ${faint}`,
                                            bgcolor: isExpanded ? alpha(theme.palette.primary.main, 0.03) : 'transparent',
                                            opacity: isOpen ? 1 : 0.62,
                                            '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.02) }
                                        }}
                                    >
                                        <Tooltip title={t('Ưu tiên {level}', { level: t(pr.label).toLowerCase() })} placement='left'>
                                            <Box
                                                sx={{ width: 4, height: 36, borderRadius: 2, bgcolor: prColor }}
                                                aria-label={t('Ưu tiên {level}', { level: t(pr.label) })}
                                            />
                                        </Tooltip>

                                        <ButtonBase
                                            onClick={() => setExpanded(isExpanded ? null : a.id)}
                                            aria-expanded={isExpanded}
                                            sx={{
                                                justifyContent: 'flex-start',
                                                textAlign: 'left',
                                                gap: 1,
                                                borderRadius: '8px',
                                                minWidth: 0
                                            }}
                                        >
                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                                <Typography
                                                    variant='body2'
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: 'grey.900',
                                                        textDecoration: a.status === 'done' ? 'line-through' : 'none'
                                                    }}
                                                >
                                                    {a.title}
                                                </Typography>
                                                <Stack
                                                    direction='row'
                                                    spacing={0.5}
                                                    alignItems='center'
                                                    sx={{ mt: 0.25, color: 'text.secondary', minWidth: 0 }}
                                                >
                                                    <IconCornerDownRight size={13} stroke={1.75} style={{ flexShrink: 0 }} />
                                                    <Typography variant='caption' noWrap>
                                                        {a.signalIds.map((id) => signalById[id]?.title).join(', ')}
                                                    </Typography>
                                                </Stack>
                                            </Box>
                                            <IconChevronDown
                                                size={16}
                                                stroke={1.75}
                                                style={{
                                                    flexShrink: 0,
                                                    opacity: 0.5,
                                                    transition: 'transform 160ms',
                                                    transform: isExpanded ? 'rotate(180deg)' : 'none'
                                                }}
                                            />
                                        </ButtonBase>

                                        <Typography variant='body2' sx={{ color: 'text.primary', fontSize: '0.8125rem' }}>
                                            {a.impact}
                                        </Typography>

                                        <Typography
                                            variant='body2'
                                            sx={{ textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
                                        >
                                            {a.affected}
                                        </Typography>

                                        <ButtonBase
                                            onClick={(e) => setMenu({ kind: 'owner', id: a.id, anchor: e.currentTarget })}
                                            aria-label={t('Đổi người phụ trách')}
                                            sx={{
                                                justifyContent: 'flex-start',
                                                gap: 1,
                                                px: 0.75,
                                                py: 0.5,
                                                mx: -0.75,
                                                borderRadius: '8px',
                                                minWidth: 0,
                                                '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.05) }
                                            }}
                                        >
                                            {owner ? (
                                                <>
                                                    <Person id={owner.id} />
                                                    <Typography variant='body2' noWrap sx={{ fontSize: '0.8125rem' }}>
                                                        {owner.name}
                                                    </Typography>
                                                </>
                                            ) : !isOpen ? (
                                                <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                                                    —
                                                </Typography>
                                            ) : (
                                                <Stack
                                                    direction='row'
                                                    spacing={0.75}
                                                    alignItems='center'
                                                    sx={{ color: theme.palette.warning.dark }}
                                                >
                                                    <IconUserPlus size={18} stroke={1.75} />
                                                    <Typography
                                                        variant='body2'
                                                        sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'inherit' }}
                                                    >
                                                        {t('Giao việc')}
                                                    </Typography>
                                                </Stack>
                                            )}
                                        </ButtonBase>

                                        <Box>
                                            <Typography variant='body2' sx={{ fontSize: '0.8125rem', fontVariantNumeric: 'tabular-nums' }}>
                                                {fmtDate(a.due, locale, true)}
                                            </Typography>
                                            {isOpen && (
                                                <Typography
                                                    variant='caption'
                                                    sx={{
                                                        color: left < 0 ? 'error.main' : left <= 2 ? 'warning.dark' : 'text.secondary',
                                                        fontWeight: left <= 2 ? 600 : 400
                                                    }}
                                                >
                                                    {left < 0
                                                        ? t('trễ {n} ngày', { n: -left })
                                                        : left === 0
                                                        ? t('hôm nay')
                                                        : t('còn {n} ngày', { n: left })}
                                                </Typography>
                                            )}
                                        </Box>

                                        <ButtonBase
                                            onClick={(e) => setMenu({ kind: 'status', id: a.id, anchor: e.currentTarget })}
                                            aria-label={t('Đổi trạng thái')}
                                            sx={{ justifySelf: 'start', borderRadius: '8px', gap: 0.25 }}
                                        >
                                            <Pill tone={STATUS[a.status].tone}>{t(STATUS[a.status].label)}</Pill>
                                            <IconChevronDown size={14} stroke={2} style={{ opacity: 0.45 }} />
                                        </ButtonBase>
                                    </Box>

                                    <Collapse in={isExpanded} unmountOnExit>
                                        <Box
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: { md: '1.3fr 1fr' },
                                                gap: 3,
                                                px: 2.5,
                                                pl: 5.5,
                                                py: 2.25,
                                                borderBottom: `1px solid ${faint}`,
                                                bgcolor: alpha(theme.palette.primary.main, 0.03)
                                            }}
                                        >
                                            <Box>
                                                <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                                    {t('Vì sao')}
                                                </Typography>
                                                <Typography variant='body2' sx={{ mt: 0.5 }}>
                                                    {a.why}
                                                </Typography>
                                                <Stack direction='row' spacing={1} sx={{ mt: 2 }} flexWrap='wrap' useFlexGap>
                                                    <Button
                                                        size='small'
                                                        variant='contained'
                                                        endIcon={<IconArrowRight size={16} />}
                                                        onClick={() => navigate('/customers?tab=list')}
                                                    >
                                                        {t('Xem {n} khách liên quan', { n: a.affected })}
                                                    </Button>
                                                    {isOpen && (
                                                        <Button
                                                            size='small'
                                                            color='inherit'
                                                            onClick={() => update(a.id, { status: 'dismissed' })}
                                                        >
                                                            {t('Bỏ qua việc này')}
                                                        </Button>
                                                    )}
                                                </Stack>
                                            </Box>
                                            <Stack spacing={1.25}>
                                                <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                                    {t('Dựa trên')}
                                                </Typography>
                                                {a.signalIds.map((id) => {
                                                    const s = signalById[id]
                                                    if (!s) return null
                                                    const color = toneOfImpact(s.impact)
                                                    return (
                                                        <Stack key={id} direction='row' spacing={1.5} alignItems='center'>
                                                            <Spark values={s.series} color={color} />
                                                            <Box sx={{ minWidth: 0 }}>
                                                                <Typography variant='body2' sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                                                                    {s.title}: {num(s.before, s.unit)} → {num(s.after, s.unit)}
                                                                </Typography>
                                                                <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                                                                    {s.source} ·{' '}
                                                                    {t('công sức {level}', { level: t(a.effort).toLowerCase() })}
                                                                </Typography>
                                                            </Box>
                                                        </Stack>
                                                    )
                                                })}
                                            </Stack>
                                        </Box>
                                    </Collapse>
                                </Fragment>
                            )
                        })}
                    </Box>
                </Box>
            </Box>

            {/* Signals */}
            <Box sx={{ border: `1px solid ${hairline}`, borderRadius: '12px', bgcolor: 'background.paper', overflow: 'hidden' }}>
                <Stack direction='row' alignItems='baseline' spacing={1.5} sx={{ px: 2.5, py: 1.75 }}>
                    <Typography variant='h3' component='h3'>
                        {t('Tín hiệu')}
                    </Typography>
                    <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                        {t('so với đầu kỳ {range}', { range: t(RANGES.find((r) => r.id === range)?.label).toLowerCase() })}
                    </Typography>
                </Stack>
                <Box sx={{ overflowX: 'auto' }}>
                    <Box component='table' sx={{ width: '100%', minWidth: 860, borderCollapse: 'collapse' }}>
                        <Box component='thead'>
                            <Box component='tr' sx={{ bgcolor: alpha(theme.palette.text.primary, 0.02) }}>
                                {['Tín hiệu', 'Đầu kỳ', 'Hiện tại', 'Thay đổi', 'Xu hướng', 'Phạm vi', 'Nguồn'].map((h, i) => (
                                    <Box
                                        key={h}
                                        component='th'
                                        scope='col'
                                        sx={{
                                            px: 2.5,
                                            py: 1,
                                            textAlign: i >= 1 && i <= 3 ? 'right' : 'left',
                                            typography: 'caption',
                                            fontWeight: 600,
                                            color: 'text.secondary',
                                            borderTop: `1px solid ${faint}`,
                                            borderBottom: `1px solid ${faint}`
                                        }}
                                    >
                                        {t(h)}
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                        <Box component='tbody'>
                            {signals.map((s) => {
                                const delta = deltaOf(s)
                                const color = toneOfImpact(s.impact)
                                return (
                                    <Box
                                        component='tr'
                                        key={s.id}
                                        sx={{ '& td': { px: 2.5, py: 1.5, borderBottom: `1px solid ${faint}`, verticalAlign: 'middle' } }}
                                    >
                                        <Box component='td'>
                                            <Typography variant='body2' sx={{ fontWeight: 600, color: 'grey.900' }}>
                                                {s.title}
                                            </Typography>
                                            <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', maxWidth: 380 }}>
                                                {s.detail}
                                            </Typography>
                                        </Box>
                                        <Box
                                            component='td'
                                            sx={{
                                                textAlign: 'right',
                                                color: 'text.secondary',
                                                fontVariantNumeric: 'tabular-nums',
                                                typography: 'body2'
                                            }}
                                        >
                                            {num(s.before, s.unit)}
                                        </Box>
                                        <Box
                                            component='td'
                                            sx={{
                                                textAlign: 'right',
                                                fontWeight: 700,
                                                fontVariantNumeric: 'tabular-nums',
                                                typography: 'body2'
                                            }}
                                        >
                                            {num(s.after, s.unit)}
                                        </Box>
                                        <Box component='td' sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                            <Typography
                                                variant='body2'
                                                component='span'
                                                sx={{ fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {delta > 0 ? '+' : ''}
                                                {Math.round(delta)}%
                                            </Typography>
                                        </Box>
                                        <Box component='td'>
                                            <Spark values={s.series} color={color} />
                                        </Box>
                                        <Box component='td' sx={{ typography: 'body2', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                                            {s.scope}
                                        </Box>
                                        <Box component='td' sx={{ typography: 'caption', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                                            {s.source}
                                        </Box>
                                    </Box>
                                )
                            })}
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* owner / status pickers */}
            <Menu
                anchorEl={menu?.anchor}
                open={Boolean(menu)}
                onClose={() => setMenu(null)}
                PaperProps={{ sx: { borderRadius: '12px', minWidth: 220 } }}
            >
                {menu?.kind === 'owner' && [
                    ...mockEmployees.slice(0, 6).map((e) => (
                        <MenuItem
                            key={e.id}
                            selected={menuAction?.owner === e.id}
                            onClick={() => {
                                update(menu.id, { owner: e.id, status: menuAction?.status === 'new' ? 'doing' : menuAction?.status })
                                setMenu(null)
                            }}
                            sx={{ gap: 1.25 }}
                        >
                            <Person id={e.id} />
                            <Typography variant='body2'>{e.name}</Typography>
                        </MenuItem>
                    )),
                    menuAction?.owner && (
                        <MenuItem
                            key='none'
                            onClick={() => {
                                update(menu.id, { owner: null })
                                setMenu(null)
                            }}
                            sx={{ color: 'text.secondary' }}
                        >
                            {t('Bỏ người phụ trách')}
                        </MenuItem>
                    )
                ]}
                {menu?.kind === 'status' &&
                    STATUS_ORDER.map((st) => (
                        <MenuItem
                            key={st}
                            selected={menuAction?.status === st}
                            onClick={() => {
                                update(menu.id, { status: st })
                                setMenu(null)
                            }}
                        >
                            <Pill tone={STATUS[st].tone}>{t(STATUS[st].label)}</Pill>
                        </MenuItem>
                    ))}
            </Menu>
        </Stack>
    )
}

export default AtlasInsightTab
