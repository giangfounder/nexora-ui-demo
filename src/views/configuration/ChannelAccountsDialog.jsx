import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

import { alpha, getLuminance, useTheme } from '@mui/material/styles'
import { Avatar, Box, Button, Chip, Drawer, IconButton, Stack, Switch, TextField, Tooltip, Typography } from '@mui/material'
import { IconPlus, IconTrashFilled, IconX } from '@tabler/icons-react'

import { useLanguage } from '@/store/context/LanguageContext'
import { FormField, useSheetShell } from '@/hooks/useDialogShell'
import { CHANNELS } from '@/views/omnichannel/mockConversations'
import { getChannelIcon } from '@/views/omnichannel/utils'

const ChannelAccountsDialog = ({ show, channel, accounts, onCancel, onSave }) => {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const { t } = useLanguage()
    const { drawerProps, headerProps, contentProps, footerProps } = useSheetShell({ width: 'lg' })
    const [items, setItems] = useState([])
    const [draft, setDraft] = useState({ name: '', handle: '' })

    useEffect(() => {
        if (show) {
            setItems(accounts || [])
            setDraft({ name: '', handle: '' })
        }
    }, [show, accounts])

    const alphaBorder = theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08)
    const meta = channel ? CHANNELS[channel] : null
    // Very dark brand colours (TikTok, Lazada) disappear on dark surfaces — fall back to text colour there
    const accentColor = meta?.color && isDark && getLuminance(meta.color) < 0.05 ? theme.palette.text.primary : meta?.color
    const ChannelIcon = channel ? getChannelIcon(channel) : null

    const addAccount = () => {
        if (!draft.name.trim()) return
        setItems((prev) => [
            ...prev,
            {
                id: `${channel}-${Date.now()}`,
                name: draft.name.trim(),
                handle: draft.handle.trim() || '—',
                addedOn: new Date().toISOString().slice(0, 10),
                enabled: true
            }
        ])
        setDraft({ name: '', handle: '' })
    }

    const removeAccount = (id) => setItems((prev) => prev.filter((a) => a.id !== id))
    const toggleAccount = (id) => setItems((prev) => prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)))

    const save = () => onSave(items)

    const drawer = (
        <Drawer {...drawerProps} open={show && !!channel} onClose={onCancel}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box {...headerProps}>
                    <Stack direction='row' spacing={1.5} alignItems='center' sx={{ minWidth: 0 }}>
                        {meta && ChannelIcon && (
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: theme.palette.background.paper,
                                    border: `1px solid ${alphaBorder}`,
                                    flexShrink: 0
                                }}
                            >
                                <ChannelIcon size={18} />
                            </Box>
                        )}
                        <Typography sx={{ fontSize: '1.125rem', fontWeight: 600 }}>
                            {t('{channel} — {n} tài khoản', { channel: meta?.label || t('Kênh'), n: items.length })}
                        </Typography>
                    </Stack>
                    <IconButton
                        onClick={onCancel}
                        aria-label={t('Đóng')}
                        size='small'
                        sx={{
                            width: 28,
                            height: 28,
                            borderRadius: 1,
                            color: 'text.secondary',
                            '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.06), color: 'text.primary' }
                        }}
                    >
                        <IconX size={16} strokeWidth={2.5} />
                    </IconButton>
                </Box>

                <Box {...contentProps}>
                    <FormField label={t('Thêm tài khoản mới')} hint={t('Nhấn Enter để thêm nhanh.')}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ sm: 'flex-start' }}>
                            <TextField
                                size='small'
                                placeholder={t('Tên page/tài khoản')}
                                value={draft.name}
                                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                                fullWidth
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') addAccount()
                                }}
                            />
                            <TextField
                                size='small'
                                placeholder={t('@handle · số điện thoại · URL')}
                                value={draft.handle}
                                onChange={(e) => setDraft({ ...draft, handle: e.target.value })}
                                fullWidth
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') addAccount()
                                }}
                            />
                            <Button
                                variant='contained'
                                size='small'
                                startIcon={<IconPlus size={16} strokeWidth={2.5} />}
                                onClick={addAccount}
                                disabled={!draft.name.trim()}
                                sx={{ flexShrink: 0, height: 40 }}
                            >
                                {t('Thêm')}
                            </Button>
                        </Stack>
                    </FormField>

                    {items.length === 0 ? (
                        <Box sx={{ py: 6, textAlign: 'center', color: 'text.disabled' }}>
                            <Typography sx={{ fontSize: '0.875rem' }}>
                                {t('Chưa có tài khoản nào. Thêm một tài khoản để bắt đầu.')}
                            </Typography>
                        </Box>
                    ) : (
                        <Stack sx={{ border: `1px solid ${alphaBorder}`, borderRadius: 1.5, overflow: 'hidden' }}>
                            {items.map((acc, idx) => (
                                <Box
                                    key={acc.id}
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: 'auto 1fr auto auto',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        px: 2,
                                        py: 1.25,
                                        borderTop: idx === 0 ? 'none' : `1px solid ${alphaBorder}`,
                                        bgcolor: acc.enabled ? 'transparent' : alpha(theme.palette.text.primary, 0.02),
                                        opacity: acc.enabled ? 1 : 0.7,
                                        transition: 'background-color 120ms ease-out'
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            bgcolor: meta
                                                ? alpha(accentColor, isDark ? 0.24 : 0.15)
                                                : alpha(theme.palette.text.primary, 0.08),
                                            color: accentColor
                                        }}
                                    >
                                        {acc.name.slice(0, 2).toUpperCase()}
                                    </Avatar>
                                    <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }} noWrap>
                                            {acc.name}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }} noWrap>
                                            {acc.handle} · {t('thêm {date}', { date: acc.addedOn })}
                                        </Typography>
                                    </Stack>
                                    <Chip
                                        size='small'
                                        label={acc.enabled ? t('Bật') : t('Tắt')}
                                        variant='outlined'
                                        sx={{ height: 20, fontSize: '0.75rem' }}
                                    />
                                    <Stack direction='row' spacing={0.25} alignItems='center'>
                                        <Switch size='small' checked={acc.enabled} onChange={() => toggleAccount(acc.id)} />
                                        <Tooltip title={t('Xoá')}>
                                            <IconButton
                                                size='small'
                                                aria-label={t('Xoá {name}', { name: acc.name })}
                                                onClick={() => removeAccount(acc.id)}
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: 1,
                                                    color: 'text.secondary',
                                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08), color: 'error.main' }
                                                }}
                                            >
                                                <IconTrashFilled size={14} />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Box>

                <Box {...footerProps}>
                    <Button onClick={onCancel} color='inherit' sx={{ fontWeight: 500 }}>
                        {t('Đóng')}
                    </Button>
                    <Button variant='contained' onClick={save}>
                        {t('Lưu')}
                    </Button>
                </Box>
            </Box>
        </Drawer>
    )

    return createPortal(drawer, document.getElementById('portal') || document.body)
}

ChannelAccountsDialog.propTypes = {
    show: PropTypes.bool,
    channel: PropTypes.string,
    accounts: PropTypes.array,
    onCancel: PropTypes.func,
    onSave: PropTypes.func
}

export default ChannelAccountsDialog
