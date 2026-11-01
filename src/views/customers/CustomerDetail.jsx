import PropTypes from 'prop-types'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useUrlTabState from '@/hooks/useUrlTabState'

import { alpha, useTheme } from '@mui/material/styles'
import {
    Box,
    Button,
    Chip,
    Divider,
    Grid,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography
} from '@mui/material'
import { AppIcon, iconComponent } from '@/ui-component/icons/AppIcon'

import MainCard from '@/ui-component/cards/MainCard'
import { TabPanel } from '@/ui-component/tabs/TabPanel'
import { useLanguage } from '@/store/context/LanguageContext'
import { getStageIcon, tintBg, tintText } from './utils'
import PersonAvatar from '@/ui-component/avatar/PersonAvatar'

// Activity timeline: each entry is marked by what happened, not by a dot
const LOG_ICONS = { created: 'UserPlus', stage: 'ArrowsDownUp', note: 'NotePencil', reply: 'ChatCircleText', file: 'Paperclip' }
import { mockAttributeDefs, mockCustomerTypes, mockCustomers } from './mockCustomers'
import { getAtlasCustomerInsight, mockCustomerFiles, mockCustomerNotes, mockInteractionLog } from './mockAtlas'
import { mockEmployees } from '@/views/employees/mockEmployees'
import { CHANNELS, mockConversations, STATUS } from '@/views/omnichannel/mockConversations'
import { getChannelIcon } from '@/views/omnichannel/utils'

const STAGE_TONES = ['teal', 'amber', 'orange', 'emerald', 'rose']
const stageTone = (idx) => STAGE_TONES[Math.min(Math.max(idx, 0), STAGE_TONES.length - 1)]

const formatAttrValue = (attr, value, t, locale) => {
    if (value === undefined || value === '' || value === null) return '—'
    if (attr.type === 'checkbox') return value ? t('Có') : t('Không')
    if (attr.type === 'multiselect') return Array.isArray(value) ? value.map((v) => t(v)).join(', ') : t(value)
    if (attr.type === 'number') return Number(value).toLocaleString(locale)
    if (attr.type === 'select') return t(value)
    return value
}

const CustomerDetail = () => {
    const { t, locale } = useLanguage()
    const theme = useTheme()
    const { customerId } = useParams()
    const navigate = useNavigate()

    const [tab, setTab] = useUrlTabState('tab', ['info', 'history', 'notes', 'deals'])
    const [customers, setCustomers] = useState(mockCustomers)
    const [notes, setNotes] = useState(mockCustomerNotes[customerId] || [])
    const [newNote, setNewNote] = useState('')
    const [menuAnchor, setMenuAnchor] = useState(null)
    const [waveIdx, setWaveIdx] = useState(null)

    const customer = customers.find((c) => c.id === customerId)
    const type = mockCustomerTypes.find((ct) => ct.id === customer?.typeId)
    const activeStepIndex = type?.stages.findIndex((s) => s.id === customer?.stageId) ?? 0

    const commitStage = (stageId) => {
        setCustomers((prev) => prev.map((c) => (c.id === customer.id ? { ...c, stageId } : c)))
    }
    const moveStage = (targetStageId) => {
        if (!type?.stages || waveIdx !== null) return
        const targetIdx = type.stages.findIndex((s) => s.id === targetStageId)
        if (targetIdx === -1 || targetIdx === activeStepIndex) return
        const step = targetIdx > activeStepIndex ? 1 : -1
        const stepMs = 140
        let cur = activeStepIndex
        const tick = () => {
            cur += step
            setWaveIdx(cur)
            if (cur !== targetIdx) {
                setTimeout(tick, stepMs)
            } else {
                setTimeout(() => {
                    commitStage(targetStageId)
                    setWaveIdx(null)
                }, stepMs)
            }
        }
        tick()
    }
    const conversations = mockConversations.filter((c) => c.customerId === customerId)
    const files = mockCustomerFiles[customerId] || []
    const logs = mockInteractionLog[customerId] || []
    const insight = getAtlasCustomerInsight(customer)
    const employeeName = (id) => mockEmployees.find((e) => e.id === id)?.name || t('Hệ thống')

    const alphaBorder = theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08)
    const alphaDivider = theme.palette.alpha?.divider || alpha(theme.palette.text.primary, 0.06)

    const activityFeed = useMemo(() => {
        const items = []
        logs.forEach((l) => items.push({ ...l, kind: l.action }))
        notes.forEach((n) =>
            items.push({ id: `note-${n.id}`, at: n.at, actorId: n.authorId, action: 'note', summary: n.text, kind: 'note' })
        )
        items.sort((a, b) => (b.at > a.at ? 1 : b.at < a.at ? -1 : 0))
        return items.slice(0, 12)
    }, [logs, notes])

    const addNote = () => {
        if (!newNote.trim()) return
        const now = new Date()
        const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(
            now.getHours()
        ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
        setNotes((prev) => [{ id: `n-${Date.now()}`, authorId: 'e1', at: ts, text: newNote.trim() }, ...prev])
        setNewNote('')
    }

    if (!customer) {
        return (
            <Box sx={{ p: 3 }}>
                <MainCard border sx={{ borderRadius: 2.5 }} contentSX={{ p: 3 }}>
                    <Typography color='text.secondary'>{t('Không tìm thấy khách hàng.')}</Typography>
                </MainCard>
            </Box>
        )
    }

    const displayActive = waveIdx !== null ? waveIdx : activeStepIndex
    const displayLabel = t(type?.stages[displayActive]?.label) || ''

    const Eyebrow = ({ children }) => (
        <Typography
            variant='caption'
            sx={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'text.disabled'
            }}
        >
            {children}
        </Typography>
    )
    Eyebrow.propTypes = { children: PropTypes.node }

    const Field = ({ label, value }) => (
        <Grid item xs={12} sm={6}>
            <Stack spacing={0.5}>
                <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.75rem' }}>
                    {label}
                </Typography>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 500 }}>{value || '—'}</Typography>
            </Stack>
        </Grid>
    )
    Field.propTypes = { label: PropTypes.node, value: PropTypes.node }

    const SectionCard = ({ title, action, children }) => (
        <Box
            sx={{
                border: `1px solid ${alphaBorder}`,
                borderRadius: 2.5,
                p: 3,
                bgcolor: theme.palette.background.paper
            }}
        >
            {(title || action) && (
                <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 2 }}>
                    {title && <Eyebrow>{title}</Eyebrow>}
                    {action}
                </Stack>
            )}
            {children}
        </Box>
    )
    SectionCard.propTypes = { title: PropTypes.node, action: PropTypes.node, children: PropTypes.node }

    const AtlasCard = ({ label, headline, body, source }) => (
        <Box
            sx={{
                border: `1px solid ${alphaBorder}`,
                borderRadius: 2.5,
                p: 2.5,
                bgcolor: theme.palette.background.paper
            }}
        >
            <Stack spacing={1}>
                <Stack direction='row' spacing={1} alignItems='center' sx={{ flexWrap: 'wrap' }}>
                    <Eyebrow>{t('GỢI Ý')}</Eyebrow>
                    {label && (
                        <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.6875rem' }}>
                            · {label}
                        </Typography>
                    )}
                </Stack>
                {headline && <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.4 }}>{headline}</Typography>}
                {body && (
                    <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
                        {body}
                    </Typography>
                )}
                <Typography
                    variant='caption'
                    sx={{
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                        mt: 0.5,
                        pt: 1,
                        borderTop: `1px solid ${alphaBorder}`
                    }}
                >
                    {source}
                </Typography>
            </Stack>
        </Box>
    )
    AtlasCard.propTypes = { label: PropTypes.node, headline: PropTypes.node, body: PropTypes.node, source: PropTypes.node }

    const feedIconFor = (kind) => {
        if (kind === 'chat' || kind === 'reply') return iconComponent('Chats')
        if (kind === 'note') return iconComponent('Note')
        if (kind === 'file') return iconComponent('File')
        return iconComponent('ClockCounterClockwise')
    }

    return (
        <Box sx={{ px: { xs: 2, md: 3 }, py: 2.5 }}>
            <Stack direction='row' spacing={0.75} alignItems='center' sx={{ mb: 1.5, color: 'text.secondary' }}>
                <Box
                    component='button'
                    type='button'
                    onClick={() => navigate('/customers')}
                    sx={{
                        border: 0,
                        background: 'transparent',
                        p: 0,
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                        color: 'text.secondary',
                        fontFamily: 'inherit',
                        '&:hover': { color: 'text.primary' }
                    }}
                >
                    {t('Khách hàng')}
                </Box>
                <AppIcon name='CaretRight' size={14} />
                <Typography sx={{ fontSize: '0.8125rem', color: 'text.primary', fontWeight: 500 }} noWrap>
                    {customer.name}
                </Typography>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }} sx={{ mb: 3 }}>
                <PersonAvatar name={customer.name} size={52} />
                <Stack sx={{ flex: 1, minWidth: 0 }} spacing={0.75}>
                    <Stack direction='row' alignItems='center' sx={{ flexWrap: 'wrap', columnGap: 2, rowGap: 1, minWidth: 0 }}>
                        <Typography
                            component='h1'
                            sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' }, fontWeight: 700, lineHeight: 1.2, minWidth: 0 }}
                            noWrap
                        >
                            {customer.name}
                        </Typography>
                        {type?.stages?.length > 0 && (
                            <Box
                                role='group'
                                aria-label={t('Sales pipeline')}
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}
                            >
                                {type.stages.map((s, i) => {
                                    const isActive = i === displayActive
                                    const isPast = i < displayActive
                                    const isFirst = i === 0
                                    const spec = theme.palette.spectrum?.[stageTone(i)] || theme.palette.primary
                                    const bg = isActive
                                        ? spec.main
                                        : isPast
                                        ? tintBg(theme, spec.main, 0.15, 0.24)
                                        : alpha(theme.palette.text.primary, 0.05)
                                    // white on the saturated active fill reads in both themes
                                    const color = isActive ? '#fff' : isPast ? tintText(theme, spec) : theme.palette.text.disabled
                                    const hoverBg = isActive
                                        ? spec.dark
                                        : isPast
                                        ? tintBg(theme, spec.main, 0.25, 0.34)
                                        : alpha(theme.palette.text.primary, 0.1)
                                    const clip = isFirst
                                        ? 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)'
                                        : 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%, 10px 50%)'
                                    const width = isActive ? Math.max(150, 48 + displayLabel.length * 9) : 46
                                    return (
                                        <Tooltip key={s.id} title={t(s.label)} placement='top'>
                                            <Box
                                                component='button'
                                                type='button'
                                                onClick={() => moveStage(s.id)}
                                                aria-pressed={isActive}
                                                aria-label={t('Chuyển sang {stage}', { stage: t(s.label) })}
                                                sx={{
                                                    cursor: 'pointer',
                                                    border: 0,
                                                    height: 32,
                                                    width,
                                                    pl: isFirst ? 1.5 : 2.25,
                                                    pr: 2.25,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 0.75,
                                                    fontFamily: 'inherit',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    color,
                                                    bgcolor: bg,
                                                    clipPath: clip,
                                                    transition:
                                                        'background-color 140ms ease-out, color 140ms ease-out, width 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                                                    '&:hover': { bgcolor: hoverBg },
                                                    '&:focus-visible': { outline: 'none', boxShadow: theme.customShadows?.focusRing },
                                                    flexShrink: 0,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <AppIcon name={isPast ? 'Check' : getStageIcon(s.id)} size={14} />
                                                {isActive && <span>{t(s.label)}</span>}
                                            </Box>
                                        </Tooltip>
                                    )
                                })}
                            </Box>
                        )}
                    </Stack>
                    <Stack direction='row' spacing={1} alignItems='center' sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                        <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.8125rem' }}>
                            {t(type?.name)}
                        </Typography>
                        {customer.tags.map((tag) => (
                            <Typography key={tag} variant='caption' color='text.secondary' sx={{ fontSize: '0.8125rem' }}>
                                · {t(tag)}
                            </Typography>
                        ))}
                    </Stack>
                </Stack>
                <Stack direction='row' spacing={1} alignItems='center' sx={{ flexShrink: 0 }}>
                    <Button variant='contained' startIcon={<AppIcon name='PencilSimpleLine' size={16} />}>
                        {t('Chỉnh sửa')}
                    </Button>
                    <Tooltip title={t('Hành động khác')}>
                        <IconButton
                            aria-label={t('Hành động khác')}
                            onClick={(e) => setMenuAnchor(e.currentTarget)}
                            sx={{ width: 36, height: 36, borderRadius: 1.5, border: `1px solid ${alphaBorder}` }}
                        >
                            <AppIcon name='DotsThree' size={17} />
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={menuAnchor}
                        open={Boolean(menuAnchor)}
                        onClose={() => setMenuAnchor(null)}
                        PaperProps={{ sx: { minWidth: 200, borderRadius: 1.5 } }}
                    >
                        <MenuItem onClick={() => setMenuAnchor(null)} sx={{ fontSize: '0.875rem' }}>
                            {t('Đổi giai đoạn')}
                        </MenuItem>
                        <MenuItem onClick={() => setMenuAnchor(null)} sx={{ fontSize: '0.875rem' }}>
                            {t('Gộp bản ghi')}
                        </MenuItem>
                        <MenuItem onClick={() => setMenuAnchor(null)} sx={{ fontSize: '0.875rem' }}>
                            {t('Xuất hồ sơ')}
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={() => setMenuAnchor(null)} sx={{ fontSize: '0.875rem', color: 'error.main' }}>
                            {t('Xoá khách hàng')}
                        </MenuItem>
                    </Menu>
                </Stack>
            </Stack>

            <Grid container spacing={2.5}>
                <Grid item xs={12} md={7} lg={7.5}>
                    <Stack spacing={2.5}>
                        <Box sx={{ borderBottom: `1px solid ${alphaBorder}` }}>
                            <Tabs
                                value={tab}
                                onChange={(_, v) => setTab(v)}
                                sx={{
                                    minHeight: 40,
                                    '& .MuiTab-root': {
                                        minHeight: 40,
                                        textTransform: 'none',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: 'text.secondary',
                                        px: 1.5,
                                        '&.Mui-selected': { fontWeight: 600, color: 'text.primary' }
                                    },
                                    '& .MuiTabs-indicator': { height: 2, borderRadius: '2px 2px 0 0', bgcolor: 'primary.main' }
                                }}
                            >
                                <Tab label={t('Thông tin')} />
                                <Tab label={t('Lịch sử')} />
                                <Tab label={t('Ghi chú')} />
                                <Tab label={t('Cơ hội & Hội thoại')} />
                            </Tabs>
                        </Box>

                        <TabPanel value={tab} index={0}>
                            <Stack spacing={2.5}>
                                <SectionCard title={t('Thông tin liên hệ')}>
                                    <Grid container spacing={2.5}>
                                        <Field label={t('Email')} value={customer.email} />
                                        <Field label={t('Số điện thoại')} value={customer.phone} />
                                        <Field label={t('Ngày tạo')} value={customer.createdAt} />
                                        <Field label={t('Liên hệ gần nhất')} value={customer.lastContactAt} />
                                    </Grid>
                                </SectionCard>

                                <SectionCard title={t('Thuộc tính')}>
                                    <Grid container spacing={2.5}>
                                        {mockAttributeDefs.map((attr) => (
                                            <Field
                                                key={attr.id}
                                                label={t(attr.label)}
                                                value={formatAttrValue(attr, customer.attributes[attr.id], t, locale)}
                                            />
                                        ))}
                                    </Grid>
                                </SectionCard>
                            </Stack>
                        </TabPanel>

                        <TabPanel value={tab} index={1}>
                            <SectionCard title={t('Lịch sử tương tác')}>
                                {logs.length === 0 ? (
                                    <Typography variant='body2' color='text.secondary'>
                                        {t('Chưa có tương tác nào được ghi nhận.')}
                                    </Typography>
                                ) : (
                                    <Stack spacing={0}>
                                        {logs.map((log, i) => (
                                            <Stack
                                                key={log.id}
                                                direction='row'
                                                spacing={2}
                                                alignItems='flex-start'
                                                sx={{ pb: i === logs.length - 1 ? 0 : 2.5 }}
                                            >
                                                <Box sx={{ position: 'relative', width: 18, flexShrink: 0, pt: 0.25 }}>
                                                    <AppIcon
                                                        name={LOG_ICONS[log.action] || 'ClockCounterClockwise'}
                                                        size={18}
                                                        color={theme.palette.primary.main}
                                                        style={{ display: 'block' }}
                                                    />
                                                    {i < logs.length - 1 && (
                                                        <Box
                                                            sx={{
                                                                position: 'absolute',
                                                                top: 24,
                                                                bottom: -18,
                                                                left: '50%',
                                                                width: 1,
                                                                bgcolor: alphaDivider
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                                <Stack spacing={0.5} sx={{ flex: 1 }}>
                                                    <Typography sx={{ fontSize: '0.9375rem' }}>{log.summary}</Typography>
                                                    <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.75rem' }}>
                                                        {log.at} · {employeeName(log.actorId)}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        ))}
                                    </Stack>
                                )}
                            </SectionCard>
                        </TabPanel>

                        <TabPanel value={tab} index={2}>
                            <Stack spacing={2.5}>
                                <SectionCard title={t('Ghi chú nội bộ')}>
                                    <Stack direction='row' spacing={1} sx={{ mb: 2 }}>
                                        <TextField
                                            fullWidth
                                            size='small'
                                            placeholder={t('Thêm ghi chú mới...')}
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault()
                                                    addNote()
                                                }
                                            }}
                                        />
                                        <Button
                                            variant='contained'
                                            startIcon={<AppIcon name='Plus' size={15} />}
                                            onClick={addNote}
                                            disabled={!newNote.trim()}
                                        >
                                            {t('Thêm')}
                                        </Button>
                                    </Stack>
                                    {notes.length === 0 ? (
                                        <Typography variant='body2' color='text.secondary'>
                                            {t('Chưa có ghi chú nào.')}
                                        </Typography>
                                    ) : (
                                        <Stack spacing={1.5} aria-live='polite'>
                                            {notes.map((n) => (
                                                <Box
                                                    key={n.id}
                                                    sx={{
                                                        border: `1px solid ${alphaBorder}`,
                                                        borderRadius: 2,
                                                        p: 2
                                                    }}
                                                >
                                                    <Stack direction='row' spacing={1} sx={{ mb: 0.5 }}>
                                                        <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                                                            {employeeName(n.authorId)}
                                                        </Typography>
                                                        <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.75rem' }}>
                                                            {n.at}
                                                        </Typography>
                                                    </Stack>
                                                    <Typography sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}>{n.text}</Typography>
                                                </Box>
                                            ))}
                                        </Stack>
                                    )}
                                </SectionCard>

                                <SectionCard title={t('Tệp đính kèm')}>
                                    {files.length === 0 ? (
                                        <Typography variant='body2' color='text.secondary'>
                                            {t('Chưa có tệp nào được đính kèm.')}
                                        </Typography>
                                    ) : (
                                        <Stack spacing={1}>
                                            {files.map((f) => (
                                                <Stack
                                                    key={f.id}
                                                    direction='row'
                                                    spacing={1.5}
                                                    alignItems='center'
                                                    sx={{
                                                        border: `1px solid ${alphaBorder}`,
                                                        borderRadius: 2,
                                                        p: 1.5
                                                    }}
                                                >
                                                    <AppIcon name='File' size={18} />
                                                    <Stack sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }} noWrap>
                                                            {f.name}
                                                        </Typography>
                                                        <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.75rem' }}>
                                                            {f.size} · {employeeName(f.uploadedBy)} · {f.uploadedAt}
                                                        </Typography>
                                                    </Stack>
                                                </Stack>
                                            ))}
                                        </Stack>
                                    )}
                                </SectionCard>
                            </Stack>
                        </TabPanel>

                        <TabPanel value={tab} index={3}>
                            <SectionCard title={t('Hội thoại')}>
                                {conversations.length === 0 ? (
                                    <Typography variant='body2' color='text.secondary'>
                                        {t('Chưa có hội thoại nào với khách này.')}
                                    </Typography>
                                ) : (
                                    <Stack spacing={1.5}>
                                        {conversations.map((c) => {
                                            const ChannelIcon = getChannelIcon(c.channel)
                                            const lastMessage = c.messages[c.messages.length - 1]
                                            return (
                                                <Box
                                                    key={c.id}
                                                    sx={{
                                                        border: `1px solid ${alphaBorder}`,
                                                        borderRadius: 2,
                                                        p: 2
                                                    }}
                                                >
                                                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                                                        <Stack direction='row' spacing={1} alignItems='center'>
                                                            <ChannelIcon size={16} />
                                                            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                                                {t(CHANNELS[c.channel].label)}
                                                            </Typography>
                                                            <Chip
                                                                size='small'
                                                                color={STATUS[c.status].color}
                                                                label={t(STATUS[c.status].label)}
                                                                sx={{ height: 20, fontSize: '0.6875rem' }}
                                                            />
                                                        </Stack>
                                                        <Button
                                                            size='small'
                                                            endIcon={<AppIcon name='ArrowSquareOut' size={13} />}
                                                            onClick={() => navigate('/omnichannel')}
                                                        >
                                                            {t('Mở trong Hộp thư')}
                                                        </Button>
                                                    </Stack>
                                                    <Typography
                                                        variant='body2'
                                                        color='text.secondary'
                                                        sx={{ mt: 1, fontSize: '0.8125rem' }}
                                                        noWrap
                                                    >
                                                        {lastMessage?.text}
                                                    </Typography>
                                                </Box>
                                            )
                                        })}
                                    </Stack>
                                )}
                            </SectionCard>
                        </TabPanel>
                    </Stack>
                </Grid>

                <Grid item xs={12} md={5} lg={4.5}>
                    <Stack spacing={2}>
                        {insight && (
                            <>
                                <AtlasCard
                                    label={t('Giá trị vòng đời')}
                                    headline={insight.ltv}
                                    body={insight.purchasePattern}
                                    source={t('Từ {n} tương tác của khách trên hệ thống', { n: logs.length + notes.length })}
                                />
                                <AtlasCard
                                    label={t('Nguy cơ rời bỏ')}
                                    headline={t(insight.churnRisk)}
                                    body={insight.nextBestAction}
                                    source={t('Nguồn: pipeline giai đoạn {stage} · {n} hội thoại 30 ngày qua', {
                                        stage: activeStepIndex + 1,
                                        n: conversations.length
                                    })}
                                />
                                {insight.upsell?.length > 0 && (
                                    <AtlasCard
                                        label={t('Đề xuất bán thêm')}
                                        headline={insight.upsell[0]}
                                        body={insight.upsell.slice(1).join(' · ')}
                                        source={t('Từ dữ liệu: lịch sử mua {type} + đặc điểm nhóm khách', { type: t(type?.name) })}
                                    />
                                )}
                            </>
                        )}

                        <Box
                            sx={{
                                border: `1px solid ${alphaBorder}`,
                                borderRadius: 2.5,
                                bgcolor: theme.palette.background.paper,
                                overflow: 'hidden'
                            }}
                        >
                            <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
                                <Eyebrow>{t('Hoạt động gần đây')}</Eyebrow>
                                <Tooltip title={t('Thêm ghi chú')}>
                                    <IconButton size='small' onClick={() => setTab(2)} sx={{ width: 26, height: 26 }}>
                                        <AppIcon name='PencilSimple' size={14} />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                            <Box sx={{ px: 2.5, pb: 2.5 }}>
                                {activityFeed.length === 0 ? (
                                    <Typography variant='body2' color='text.secondary'>
                                        {t('Chưa có hoạt động nào.')}
                                    </Typography>
                                ) : (
                                    <Stack spacing={0}>
                                        {activityFeed.map((it, i) => {
                                            const Icon = feedIconFor(it.kind)
                                            return (
                                                <Stack
                                                    key={it.id}
                                                    direction='row'
                                                    spacing={1.5}
                                                    alignItems='flex-start'
                                                    sx={{ pb: i === activityFeed.length - 1 ? 0 : 2 }}
                                                >
                                                    <Box sx={{ position: 'relative', width: 20, flexShrink: 0, pt: 0.5 }}>
                                                        <Box
                                                            sx={{
                                                                width: 20,
                                                                height: 20,
                                                                borderRadius: '50%',
                                                                bgcolor: alpha(theme.palette.text.primary, 0.05),
                                                                color: 'text.secondary',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                        >
                                                            <Icon size={12} strokeWidth={1.75} />
                                                        </Box>
                                                        {i < activityFeed.length - 1 && (
                                                            <Box
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: 24,
                                                                    bottom: -8,
                                                                    left: '50%',
                                                                    width: 1,
                                                                    bgcolor: alphaDivider,
                                                                    transform: 'translateX(-50%)'
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                    <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography sx={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
                                                            {it.summary}
                                                        </Typography>
                                                        <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.75rem' }}>
                                                            {it.at} · {employeeName(it.actorId)}
                                                        </Typography>
                                                    </Stack>
                                                </Stack>
                                            )
                                        })}
                                    </Stack>
                                )}
                            </Box>
                        </Box>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    )
}

export default CustomerDetail
