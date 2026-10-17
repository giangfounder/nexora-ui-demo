import { useMemo, useState } from 'react'

// material-ui
import { alpha, useTheme } from '@mui/material/styles'
import {
    Box,
    Button,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableHead,
    TableRow,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography
} from '@mui/material'
import { AppIcon, iconComponent } from '@/ui-component/icons/AppIcon'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts'

// project imports
import { useLanguage } from '@/store/context/LanguageContext'
import useSavedViews from '@/hooks/useSavedViews'
import { SharedTableCell, SharedTableContainer, SharedTableRow, StatusIcon } from '@/ui-component/table/SharedTable'
import { mockEmployees, mockTeams } from '@/views/employees/mockEmployees'
import { CHANNELS } from '@/views/omnichannel/mockConversations'
import { getScoreDistribution, mockPrismCriteria, mockScoredConversations } from './mockPrism'

const SCORE_BANDS = [
    { value: 'excellent', min: 8.5, max: Infinity },
    { value: 'good', min: 7, max: 8.5 },
    { value: 'fair', min: 6, max: 7 },
    { value: 'low', min: -Infinity, max: 6 }
]

const scoreTone = (s) => {
    if (s >= 8.5) return 'emerald'
    if (s >= 7) return 'orange'
    if (s >= 6) return 'amber'
    return 'rose'
}
const scoreIcon = (s) => {
    if (s >= 8.5) return 'Star'
    if (s >= 7) return 'ThumbsUp'
    if (s >= 6) return 'WarningCircle'
    return 'TrendDown'
}

const fmtScore = (n, locale) =>
    Number.isFinite(n) ? n.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '—'

const formatDate = (iso, locale) => {
    if (!iso) return '—'
    const d = new Date(iso.slice(0, 10))
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })
}

const aggregate = (items, criteria) => {
    const count = items.length
    const perCrit = {}
    criteria.forEach((c) => {
        const vals = items.map((s) => s.scores[c.id]).filter((v) => typeof v === 'number')
        perCrit[c.id] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : NaN
    })
    const avg = count ? items.reduce((a, s) => a + s.overallScore, 0) / count : NaN
    return { count, perCrit, avg }
}

const ScoresTab = () => {
    const { t, locale } = useLanguage()
    const theme = useTheme()
    const fmt = (n) => fmtScore(n, locale)
    const alphaBorder = theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08)
    const chartColor = theme.palette.spectrum?.orange?.main || theme.palette.primary.main

    const [filters, setFilters] = useState([])
    const [groupBy, setGroupBy] = useState('employee')
    const [filterAnchor, setFilterAnchor] = useState(null)
    const [savedAnchor, setSavedAnchor] = useState(null)
    const { views: savedViews, saveView, deleteView } = useSavedViews('gtech.filters.prism', [])

    const empById = (id) => mockEmployees.find((e) => e.id === id)
    const activeCriteria = useMemo(
        () => mockPrismCriteria.filter((c) => c.status === 'active' && mockScoredConversations.some((s) => c.id in s.scores)),
        []
    )

    const filterFields = useMemo(
        () => [
            { id: 'team', label: t('Nhóm'), options: mockTeams.map((tm) => ({ value: tm.id, label: tm.name })) },
            {
                id: 'employee',
                label: t('Nhân viên'),
                options: mockEmployees
                    .filter((e) => mockScoredConversations.some((s) => s.employeeId === e.id))
                    .map((e) => ({ value: e.id, label: e.name }))
            },
            { id: 'channel', label: t('Kênh'), options: Object.entries(CHANNELS).map(([id, c]) => ({ value: id, label: t(c.label) })) },
            {
                id: 'review',
                label: t('Duyệt'),
                options: [
                    { value: 'reviewed', label: t('Đã duyệt') },
                    { value: 'ai', label: t('Chấm tự động') }
                ]
            },
            {
                id: 'band',
                label: t('Mức điểm'),
                options: [
                    { value: 'excellent', label: t('Từ 8,5') },
                    { value: 'good', label: t('7 – 8,5') },
                    { value: 'fair', label: t('6 – 7') },
                    { value: 'low', label: t('Dưới 6') }
                ]
            }
        ],
        [t]
    )

    const matches = (sc, f) => {
        if (!f.value) return true
        if (f.fieldId === 'team') return !!mockTeams.find((tm) => tm.id === f.value)?.memberIds.includes(sc.employeeId)
        if (f.fieldId === 'employee') return sc.employeeId === f.value
        if (f.fieldId === 'channel') return sc.channel === f.value
        if (f.fieldId === 'review') return f.value === 'reviewed' ? !!sc.reviewedBy : !sc.reviewedBy
        if (f.fieldId === 'band') {
            const band = SCORE_BANDS.find((b) => b.value === f.value)
            return !band || (sc.overallScore >= band.min && sc.overallScore < band.max)
        }
        return true
    }

    const filtered = useMemo(
        () => mockScoredConversations.filter((sc) => filters.every((f) => matches(sc, f))),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [filters]
    )

    const distribution = useMemo(() => getScoreDistribution(filtered), [filtered])

    const rows = useMemo(() => {
        const groups =
            groupBy === 'team'
                ? mockTeams.map((tm) => ({ id: tm.id, name: tm.name, items: filtered.filter((s) => tm.memberIds.includes(s.employeeId)) }))
                : [...new Set(filtered.map((s) => s.employeeId))].map((id) => ({
                      id,
                      name: empById(id)?.name || id,
                      items: filtered.filter((s) => s.employeeId === id)
                  }))
        return groups
            .filter((g) => g.items.length > 0)
            .map((g) => ({ id: g.id, name: g.name, ...aggregate(g.items, activeCriteria) }))
            .sort((a, b) => b.avg - a.avg)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtered, groupBy, activeCriteria])

    const overall = useMemo(() => aggregate(filtered, activeCriteria), [filtered, activeCriteria])

    const addFilter = (fieldId) => {
        setFilters((prev) => [...prev, { fieldId, value: '' }])
        setFilterAnchor(null)
    }
    const updateFilterValue = (index, value) => setFilters((prev) => prev.map((f, i) => (i === index ? { ...f, value } : f)))
    const removeFilter = (index) => setFilters((prev) => prev.filter((_, i) => i !== index))

    const handleSaveCurrentView = () => {
        const name = window.prompt(t('Tên bộ lọc'))
        if (name && name.trim()) saveView(name.trim(), { filters, groupBy })
    }
    const handleApplySavedView = (v) => {
        setFilters(v.payload?.filters || [])
        setGroupBy(v.payload?.groupBy || 'employee')
        setSavedAnchor(null)
    }

    const renderFilterBar = () => {
        const activeIds = filters.map((f) => f.fieldId)
        const available = filterFields.filter((f) => !activeIds.includes(f.id))
        return (
            <Stack direction='row' alignItems='center' sx={{ flexWrap: 'wrap', gap: 1 }}>
                {filters.map((filter, index) => {
                    const field = filterFields.find((f) => f.id === filter.fieldId)
                    if (!field) return null
                    return (
                        <Box
                            key={`${filter.fieldId}-${index}`}
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'stretch',
                                height: 30,
                                borderRadius: 1,
                                border: `1px solid ${alphaBorder}`,
                                bgcolor: 'background.paper',
                                overflow: 'hidden'
                            }}
                        >
                            <Typography
                                variant='caption'
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    px: 1.25,
                                    fontWeight: 600,
                                    color: 'text.secondary',
                                    bgcolor: alpha(theme.palette.text.primary, 0.03)
                                }}
                            >
                                {field.label}
                            </Typography>
                            <Select
                                value={filter.value}
                                onChange={(e) => updateFilterValue(index, e.target.value)}
                                displayEmpty
                                variant='standard'
                                disableUnderline
                                aria-label={field.label}
                                IconComponent={iconComponent('CaretDown')}
                                sx={{
                                    minWidth: 120,
                                    '& .MuiSelect-select': {
                                        py: 0.5,
                                        pl: 1,
                                        pr: '24px !important',
                                        color: filter.value ? 'text.primary' : 'text.disabled'
                                    },
                                    '& .MuiSelect-icon': { right: 4, color: 'text.disabled', width: 16, height: 16, top: 'calc(50% - 8px)' }
                                }}
                            >
                                <MenuItem value='' sx={{ color: 'text.disabled' }}>
                                    {t('Chọn giá trị')}
                                </MenuItem>
                                {field.options.map((o) => (
                                    <MenuItem key={o.value} value={o.value}>
                                        {o.label}
                                    </MenuItem>
                                ))}
                            </Select>
                            <IconButton
                                size='small'
                                onClick={() => removeFilter(index)}
                                aria-label={t('Bỏ lọc')}
                                sx={{ borderRadius: 0, borderLeft: `1px solid ${alphaBorder}`, px: 0.75 }}
                            >
                                <AppIcon name='X' size={13} />
                            </IconButton>
                        </Box>
                    )
                })}

                <Button
                    size='small'
                    startIcon={<AppIcon name='Plus' size={14} />}
                    onClick={(e) => setFilterAnchor(e.currentTarget)}
                    sx={{
                        height: 30,
                        px: 1.25,
                        fontWeight: 500,
                        color: 'text.secondary',
                        border: `1px dashed ${theme.palette.alpha?.borderStrong || alpha(theme.palette.text.primary, 0.2)}`,
                        '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.04) }
                    }}
                >
                    {t('Thêm điều kiện')}
                </Button>
                <Menu anchorEl={filterAnchor} open={Boolean(filterAnchor)} onClose={() => setFilterAnchor(null)}>
                    {available.length === 0 ? (
                        <MenuItem disabled>{t('Đã hết thuộc tính')}</MenuItem>
                    ) : (
                        available.map((f) => (
                            <MenuItem key={f.id} onClick={() => addFilter(f.id)}>
                                {f.label}
                            </MenuItem>
                        ))
                    )}
                </Menu>

                {filters.length > 0 && (
                    <Button
                        size='small'
                        startIcon={<AppIcon name='FunnelX' size={13} />}
                        onClick={() => setFilters([])}
                        sx={{ color: 'text.secondary' }}
                    >
                        {t('Xoá lọc')}
                    </Button>
                )}

                <Box sx={{ flex: 1 }} />

                <Typography variant='caption' color='text.secondary' sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {t('{n} / {total} ca', { n: filtered.length, total: mockScoredConversations.length })}
                </Typography>

                <Button
                    size='small'
                    startIcon={<AppIcon name='BookmarkSimple' size={14} />}
                    onClick={(e) => setSavedAnchor(e.currentTarget)}
                    sx={{ color: 'text.secondary' }}
                >
                    {t('Bộ lọc đã lưu')}
                    {savedViews.length > 0 && ` (${savedViews.length})`}
                </Button>
                <Menu anchorEl={savedAnchor} open={Boolean(savedAnchor)} onClose={() => setSavedAnchor(null)}>
                    <MenuItem
                        onClick={() => {
                            setSavedAnchor(null)
                            handleSaveCurrentView()
                        }}
                        disabled={filters.length === 0}
                        sx={{ gap: 1 }}
                    >
                        <AppIcon name='Plus' size={14} />
                        {t('Lưu bộ lọc hiện tại')}
                    </MenuItem>
                    {savedViews.length > 0 && <Divider />}
                    {savedViews.map((v) => (
                        <MenuItem key={v.name} onClick={() => handleApplySavedView(v)} sx={{ gap: 1 }}>
                            <Box sx={{ flex: 1 }}>{v.name}</Box>
                            <IconButton
                                size='small'
                                onClick={(e) => {
                                    e.stopPropagation()
                                    deleteView(v.name)
                                }}
                                aria-label={t('Xoá')}
                                sx={{ p: 0.5 }}
                            >
                                <AppIcon name='Trash' size={13} />
                            </IconButton>
                        </MenuItem>
                    ))}
                </Menu>
            </Stack>
        )
    }

    const renderDistribution = () => (
        <Box sx={{ border: `1px solid ${alphaBorder}`, borderRadius: 2, bgcolor: 'background.paper', p: 2 }}>
            <Stack direction='row' justifyContent='space-between' alignItems='baseline' sx={{ mb: 1.5 }}>
                <Typography variant='h5'>{t('Phân phối điểm')}</Typography>
                <Typography variant='caption' color='text.secondary' sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {t('Trung bình {score} / 10', { score: fmt(overall.avg) })}
                </Typography>
            </Stack>
            <Box sx={{ height: 200 }}>
                <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={distribution} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barCategoryGap={4}>
                        <CartesianGrid vertical={false} stroke={theme.palette.alpha?.divider || alphaBorder} />
                        <XAxis
                            dataKey='label'
                            tickLine={false}
                            axisLine={{ stroke: alphaBorder }}
                            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                        />
                        <YAxis
                            allowDecimals={false}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                        />
                        <ChartTooltip
                            cursor={{ fill: alpha(theme.palette.text.primary, 0.04) }}
                            formatter={(v) => [v, t('Số ca')]}
                            labelFormatter={(l) => t('Điểm {range}', { range: l })}
                            contentStyle={{
                                background: theme.palette.background.paper,
                                border: `1px solid ${alphaBorder}`,
                                borderRadius: 6,
                                fontSize: 12
                            }}
                        />
                        <Bar dataKey='count' fill={chartColor} radius={[2, 2, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    )

    const renderScoreCell = (value, key) => (
        <SharedTableCell key={key} numeric>
            {fmt(value)}
        </SharedTableCell>
    )

    const renderComparison = () => (
        <Stack spacing={1.5}>
            <Stack direction='row' justifyContent='space-between' alignItems='center'>
                <Typography variant='h5'>{t('Bảng so sánh')}</Typography>
                <ToggleButtonGroup
                    size='small'
                    exclusive
                    value={groupBy}
                    onChange={(_, v) => v && setGroupBy(v)}
                    aria-label={t('Nhóm theo')}
                >
                    <ToggleButton value='employee' sx={{ textTransform: 'none', px: 1.5, py: 0.5 }}>
                        {t('Nhân viên')}
                    </ToggleButton>
                    <ToggleButton value='team' sx={{ textTransform: 'none', px: 1.5, py: 0.5 }}>
                        {t('Nhóm')}
                    </ToggleButton>
                </ToggleButtonGroup>
            </Stack>
            <SharedTableContainer sx={{ maxHeight: 520, overflow: 'auto' }}>
                <Table stickyHeader size='small'>
                    <TableHead>
                        <TableRow>
                            <SharedTableCell>{groupBy === 'team' ? t('Nhóm') : t('Nhân viên')}</SharedTableCell>
                            <SharedTableCell numeric>{t('Số ca')}</SharedTableCell>
                            {activeCriteria.map((c) => (
                                <SharedTableCell key={c.id} numeric>
                                    <Tooltip title={t('{name} · Trọng số {n}', { name: c.name, n: c.weight })}>
                                        <span>{c.name}</span>
                                    </Tooltip>
                                </SharedTableCell>
                            ))}
                            <SharedTableCell numeric>{t('Tổng điểm')}</SharedTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.length === 0 && (
                            <SharedTableRow>
                                <SharedTableCell
                                    colSpan={activeCriteria.length + 3}
                                    sx={{ textAlign: 'center', color: 'text.secondary', py: 5 }}
                                >
                                    {t('Không có ca nào khớp bộ lọc')}
                                </SharedTableCell>
                            </SharedTableRow>
                        )}
                        {rows.map((r) => (
                            <SharedTableRow key={r.id}>
                                <SharedTableCell sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{r.name}</SharedTableCell>
                                <SharedTableCell numeric>{r.count}</SharedTableCell>
                                {activeCriteria.map((c) => renderScoreCell(r.perCrit[c.id], c.id))}
                                <SharedTableCell numeric>
                                    <Stack direction='row' spacing={0.75} alignItems='center' justifyContent='flex-end'>
                                        <StatusIcon tone={scoreTone(r.avg)} icon={scoreIcon(r.avg)} />
                                        <Box component='span' sx={{ fontWeight: 600 }}>
                                            {fmt(r.avg)}
                                        </Box>
                                    </Stack>
                                </SharedTableCell>
                            </SharedTableRow>
                        ))}
                        {rows.length > 1 && (
                            <SharedTableRow sx={{ bgcolor: alpha(theme.palette.text.primary, 0.02) }}>
                                <SharedTableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>{t('Trung bình')}</SharedTableCell>
                                <SharedTableCell numeric>{overall.count}</SharedTableCell>
                                {activeCriteria.map((c) => renderScoreCell(overall.perCrit[c.id], c.id))}
                                <SharedTableCell numeric sx={{ fontWeight: 600 }}>
                                    {fmt(overall.avg)}
                                </SharedTableCell>
                            </SharedTableRow>
                        )}
                    </TableBody>
                </Table>
            </SharedTableContainer>
        </Stack>
    )

    const renderConversations = () => (
        <Stack spacing={1.5}>
            <Typography variant='h5'>{t('Hội thoại đã chấm')}</Typography>
            <SharedTableContainer sx={{ maxHeight: 480, overflow: 'auto' }}>
                <Table stickyHeader size='small'>
                    <TableHead>
                        <TableRow>
                            <SharedTableCell>{t('Khách hàng')}</SharedTableCell>
                            <SharedTableCell>{t('Nhân viên')}</SharedTableCell>
                            <SharedTableCell>{t('Kênh')}</SharedTableCell>
                            <SharedTableCell>{t('Nhận xét tự động')}</SharedTableCell>
                            <SharedTableCell>{t('Duyệt')}</SharedTableCell>
                            <SharedTableCell numeric>{t('Ngày')}</SharedTableCell>
                            <SharedTableCell numeric>{t('Điểm')}</SharedTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.map((sc) => (
                            <SharedTableRow key={sc.id}>
                                <SharedTableCell sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{sc.customerName}</SharedTableCell>
                                <SharedTableCell sx={{ whiteSpace: 'nowrap' }}>{empById(sc.employeeId)?.name || '—'}</SharedTableCell>
                                <SharedTableCell sx={{ color: 'text.secondary' }}>
                                    {CHANNELS[sc.channel] ? t(CHANNELS[sc.channel].label) : sc.channel}
                                </SharedTableCell>
                                <SharedTableCell sx={{ color: 'text.secondary', maxWidth: 360 }}>
                                    <Tooltip title={sc.aiComment}>
                                        <Typography variant='body2' color='text.secondary' noWrap>
                                            {sc.aiComment}
                                        </Typography>
                                    </Tooltip>
                                </SharedTableCell>
                                <SharedTableCell sx={{ whiteSpace: 'nowrap' }}>
                                    <Stack direction='row' spacing={0.75} alignItems='center'>
                                        <StatusIcon
                                            tone={sc.reviewedBy ? 'emerald' : 'teal'}
                                            icon={sc.reviewedBy ? 'UserCircleCheck' : 'HourglassMedium'}
                                        />
                                        <span>{sc.reviewedBy ? empById(sc.reviewedBy)?.name || t('Đã duyệt') : t('Chấm tự động')}</span>
                                    </Stack>
                                </SharedTableCell>
                                <SharedTableCell numeric sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>
                                    {formatDate(sc.completedAt, locale)}
                                </SharedTableCell>
                                <SharedTableCell numeric sx={{ fontWeight: 600 }}>
                                    {fmt(sc.overallScore)}
                                </SharedTableCell>
                            </SharedTableRow>
                        ))}
                    </TableBody>
                </Table>
            </SharedTableContainer>
        </Stack>
    )

    return (
        <Stack spacing={2.5}>
            {renderFilterBar()}
            {renderDistribution()}
            {renderComparison()}
            {filtered.length > 0 && renderConversations()}
        </Stack>
    )
}

export default ScoresTab
