import { useMemo, useState } from 'react'

import { alpha, useTheme } from '@mui/material/styles'
import { Box, Button, ButtonGroup, Chip, Divider, Grid, Paper, Stack, Tooltip, Typography } from '@mui/material'
import { AppIcon } from '@/ui-component/icons/AppIcon'

import MainCard from '@/ui-component/cards/MainCard'
import { useLanguage } from '@/store/context/LanguageContext'
import { CHANNELS } from '@/views/omnichannel/mockConversations'
import { getChannelIcon } from '@/views/omnichannel/utils'
import { mockChannelIntegrations } from './mockSettings'
import ChannelAccountsDialog from './ChannelAccountsDialog'

const CHANNEL_GROUP = {
    facebook: 'social',
    instagram: 'social',
    tiktok: 'social',
    zalo: 'social',
    zalo_personal: 'social',
    whatsapp: 'messaging',
    website: 'messaging',
    email: 'messaging',
    shopee: 'marketplace',
    lazada: 'marketplace'
}

const GROUP_LABEL = { social: 'Mạng xã hội', messaging: 'Nhắn tin trực tiếp', marketplace: 'Sàn TMĐT' }

// lastSync is stored as source text ('Vừa xong', '2 phút trước', 'Realtime', '—') and translated at render
const MINUTES_AGO = /^(\d+) phút trước$/
const syncLabel = (value, t) => {
    const m = typeof value === 'string' && value.match(MINUTES_AGO)
    return m ? t('{n} phút trước', { n: m[1] }) : t(value)
}

const IntegrationsTab = () => {
    const { t } = useLanguage()
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const [integrations, setIntegrations] = useState(mockChannelIntegrations)
    const [filter, setFilter] = useState('all')
    const [openChannel, setOpenChannel] = useState(null)

    const openAccounts = (channel) => setOpenChannel(channel)
    const closeAccounts = () => setOpenChannel(null)
    const saveAccounts = (accounts) => {
        setIntegrations((prev) =>
            prev.map((i) =>
                i.channel === openChannel
                    ? {
                          ...i,
                          accounts,
                          connected: accounts.some((a) => a.enabled),
                          account: accounts.find((a) => a.enabled)?.name || '',
                          lastSync: accounts.length > 0 ? 'Vừa xong' : '—'
                      }
                    : i
            )
        )
        closeAccounts()
    }
    const openIntegration = openChannel ? integrations.find((i) => i.channel === openChannel) : null

    const toggle = (channel) =>
        setIntegrations((prev) =>
            prev.map((i) =>
                i.channel === channel
                    ? {
                          ...i,
                          connected: !i.connected,
                          account: !i.connected ? `demo-${channel}` : '',
                          lastSync: !i.connected ? 'Vừa xong' : '—'
                      }
                    : i
            )
        )

    const sync = (channel) => setIntegrations((prev) => prev.map((i) => (i.channel === channel ? { ...i, lastSync: 'Vừa xong' } : i)))

    const connectedCount = integrations.filter((i) => i.connected).length

    const visible = useMemo(() => {
        if (filter === 'connected') return integrations.filter((i) => i.connected)
        if (filter === 'disconnected') return integrations.filter((i) => !i.connected)
        return integrations
    }, [integrations, filter])

    const groups = useMemo(() => {
        const map = {}
        visible.forEach((it) => {
            const g = CHANNEL_GROUP[it.channel] || 'other'
            if (!map[g]) map[g] = []
            map[g].push(it)
        })
        return map
    }, [visible])

    const groupOrder = ['messaging', 'social', 'marketplace', 'other']

    return (
        <Stack spacing={3}>
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                alignItems={{ xs: 'flex-start', md: 'center' }}
                justifyContent='space-between'
                spacing={2}
            >
                <Stack direction='row' spacing={2.5} alignItems='center'>
                    <Typography variant='h3' component='p' sx={{ lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                        {connectedCount}
                        <Typography component='span' variant='body2' sx={{ color: 'text.secondary', ml: 0.5 }}>
                            {t('/ {n} kênh đã kết nối', { n: integrations.length })}
                        </Typography>
                    </Typography>
                </Stack>

                <ButtonGroup size='small' variant='outlined'>
                    <Button onClick={() => setFilter('all')} variant={filter === 'all' ? 'contained' : 'outlined'} disableElevation>
                        {t('Tất cả')} · {integrations.length}
                    </Button>
                    <Button
                        onClick={() => setFilter('connected')}
                        variant={filter === 'connected' ? 'contained' : 'outlined'}
                        disableElevation
                    >
                        {t('Đã kết nối')} · {connectedCount}
                    </Button>
                    <Button
                        onClick={() => setFilter('disconnected')}
                        variant={filter === 'disconnected' ? 'contained' : 'outlined'}
                        disableElevation
                    >
                        {t('Chưa kết nối')} · {integrations.length - connectedCount}
                    </Button>
                </ButtonGroup>
            </Stack>

            {groupOrder
                .filter((g) => groups[g]?.length > 0)
                .map((g) => (
                    <Stack key={g} spacing={1.5}>
                        <Typography
                            variant='caption'
                            sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}
                        >
                            {t(GROUP_LABEL[g] || g)}
                        </Typography>
                        <Grid container spacing={2}>
                            {groups[g].map((it) => {
                                const meta = CHANNELS[it.channel]
                                const ChannelIcon = getChannelIcon(it.channel)
                                return (
                                    <Grid item xs={12} sm={6} md={4} key={it.channel}>
                                        <MainCard
                                            border
                                            sx={{
                                                height: '100%',
                                                cursor: 'pointer',
                                                boxShadow: 'none',
                                                transition: 'border-color 120ms ease-out',
                                                '&:hover': {
                                                    boxShadow: 'none',
                                                    borderColor: alpha(theme.palette.text.primary, 0.24)
                                                }
                                            }}
                                            contentSX={{ p: 2.25, '&:last-child': { pb: 2.25 } }}
                                            onClick={() => openAccounts(it.channel)}
                                            role='button'
                                            tabIndex={0}
                                            aria-label={t('Xem tài khoản {channel}', { channel: meta.label })}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault()
                                                    openAccounts(it.channel)
                                                }
                                            }}
                                        >
                                            <Stack spacing={2}>
                                                <Stack direction='row' spacing={1.5} alignItems='center'>
                                                    <Box
                                                        sx={{
                                                            position: 'relative',
                                                            width: 28,
                                                            height: 28,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        <ChannelIcon size={24} />
                                                        <Box
                                                            aria-hidden
                                                            sx={{
                                                                position: 'absolute',
                                                                right: -4,
                                                                bottom: -4,
                                                                display: 'inline-flex',
                                                                borderRadius: '50%',
                                                                bgcolor: theme.palette.background.paper,
                                                                color: it.connected
                                                                    ? theme.palette.success.main
                                                                    : theme.palette.text.disabled
                                                            }}
                                                        >
                                                            <AppIcon name={it.connected ? 'CheckCircle' : 'MinusCircle'} size={14} />
                                                        </Box>
                                                    </Box>
                                                    <Stack sx={{ minWidth: 0, flex: 1 }}>
                                                        <Typography variant='body2' sx={{ fontWeight: 600 }} noWrap>
                                                            {meta.label}
                                                        </Typography>
                                                        <Typography variant='caption' color='text.secondary' noWrap>
                                                            {it.connected ? it.account : t('Chưa liên kết')}
                                                        </Typography>
                                                    </Stack>
                                                </Stack>

                                                <Stack
                                                    direction='row'
                                                    spacing={0.75}
                                                    alignItems='center'
                                                    sx={{ minHeight: 22, flexWrap: 'wrap', gap: 0.5 }}
                                                >
                                                    {it.connected ? (
                                                        <>
                                                            <Chip
                                                                size='small'
                                                                label={t('{n} tài khoản', { n: (it.accounts || []).length })}
                                                                sx={{
                                                                    bgcolor: alpha(theme.palette.success.main, isDark ? 0.2 : 0.1),
                                                                    color: isDark ? theme.palette.success.light : theme.palette.success.dark
                                                                }}
                                                            />
                                                            <Typography variant='caption' color='text.secondary'>
                                                                · {t('Đồng bộ {time}', { time: syncLabel(it.lastSync, t) })}
                                                            </Typography>
                                                        </>
                                                    ) : (
                                                        <Chip
                                                            size='small'
                                                            variant='outlined'
                                                            label={t('Chưa kết nối')}
                                                            sx={{ color: 'text.secondary' }}
                                                        />
                                                    )}
                                                </Stack>

                                                <Divider />

                                                <Stack direction='row' spacing={1} alignItems='center' onClick={(e) => e.stopPropagation()}>
                                                    {it.connected ? (
                                                        <>
                                                            <Button
                                                                size='small'
                                                                variant='text'
                                                                color='inherit'
                                                                startIcon={<AppIcon name='ArrowClockwise' size={14} />}
                                                                onClick={() => sync(it.channel)}
                                                                sx={{ flex: 1, justifyContent: 'flex-start' }}
                                                            >
                                                                {t('Đồng bộ')}
                                                            </Button>
                                                            <Tooltip title={t('Quản lý tài khoản/page')}>
                                                                <Button
                                                                    size='small'
                                                                    variant='text'
                                                                    color='inherit'
                                                                    aria-label={t('Cấu hình {channel}', { channel: meta.label })}
                                                                    onClick={() => openAccounts(it.channel)}
                                                                    sx={{ minWidth: 32, px: 1 }}
                                                                >
                                                                    <AppIcon name='GearSix' size={15} />
                                                                </Button>
                                                            </Tooltip>
                                                            <Button
                                                                size='small'
                                                                variant='text'
                                                                color='error'
                                                                startIcon={<AppIcon name='Plugs' size={14} />}
                                                                onClick={() => toggle(it.channel)}
                                                            >
                                                                {t('Ngắt')}
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            size='small'
                                                            fullWidth
                                                            variant='contained'
                                                            startIcon={<AppIcon name='PlugsConnected' size={14} />}
                                                            onClick={() => openAccounts(it.channel)}
                                                        >
                                                            {t('Thêm tài khoản')}
                                                        </Button>
                                                    )}
                                                </Stack>
                                            </Stack>
                                        </MainCard>
                                    </Grid>
                                )
                            })}
                            {(() => {
                                const emptySlots = (3 - (groups[g].length % 3)) % 3
                                if (emptySlots === 0) return null
                                return Array.from({ length: emptySlots }).map((_, i) => {
                                    const isPrimary = i === 0
                                    return (
                                        <Grid item xs={12} sm={6} md={4} key={`ghost-${g}-${i}`}>
                                            <Paper
                                                elevation={0}
                                                component='button'
                                                type='button'
                                                aria-label={t('Yêu cầu tích hợp kênh mới')}
                                                onClick={() => {}}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '100%',
                                                    height: '100%',
                                                    minHeight: 168,
                                                    p: 2.25,
                                                    boxShadow: 'none',
                                                    border: `1px dashed ${alpha(theme.palette.text.primary, 0.16)}`,
                                                    bgcolor: 'transparent',
                                                    color: 'inherit',
                                                    font: 'inherit',
                                                    cursor: 'pointer',
                                                    transition: 'border-color 120ms ease-out, background-color 120ms ease-out',
                                                    '&:hover': {
                                                        borderColor: alpha(theme.palette.primary.main, 0.5),
                                                        bgcolor: alpha(theme.palette.primary.main, 0.03)
                                                    },
                                                    '&:focus-visible': {
                                                        outline: 'none',
                                                        borderColor: theme.palette.primary.main,
                                                        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.18)}`
                                                    }
                                                }}
                                            >
                                                <Stack alignItems='center' spacing={1}>
                                                    <Box
                                                        sx={{
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            bgcolor: alpha(theme.palette.text.primary, 0.04),
                                                            color: 'text.secondary'
                                                        }}
                                                    >
                                                        <AppIcon name='Plus' size={16} />
                                                    </Box>
                                                    {isPrimary && (
                                                        <>
                                                            <Typography variant='body2' sx={{ fontWeight: 500, color: 'text.secondary' }}>
                                                                {t('Thêm kênh khác')}
                                                            </Typography>
                                                            <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                                                                {t('Yêu cầu tích hợp')}
                                                            </Typography>
                                                        </>
                                                    )}
                                                </Stack>
                                            </Paper>
                                        </Grid>
                                    )
                                })
                            })()}
                        </Grid>
                    </Stack>
                ))}

            <ChannelAccountsDialog
                show={!!openChannel}
                channel={openChannel}
                accounts={openIntegration?.accounts || []}
                onCancel={closeAccounts}
                onSave={saveAccounts}
            />
        </Stack>
    )
}

export default IntegrationsTab
