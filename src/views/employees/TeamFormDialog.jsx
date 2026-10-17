import { createPortal } from 'react-dom'
import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'

import { alpha, useTheme } from '@mui/material/styles'
import { Box, Button, Checkbox, Drawer, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { AppIcon } from '@/ui-component/icons/AppIcon'

import { useLanguage } from '@/store/context/LanguageContext'
import { FormField, useSheetShell } from '@/hooks/useDialogShell'
import PersonAvatar from '@/ui-component/avatar/PersonAvatar'

const emptyTeam = { id: '', name: '', description: '', leaderId: '', memberIds: [], color: 'primary' }
const COLOR_OPTIONS = ['primary', 'success', 'warning', 'secondary', 'error']
const COLOR_LABEL = { primary: 'Màu chính', success: 'Xanh lá', warning: 'Vàng', secondary: 'Màu phụ', error: 'Đỏ' }

const TeamFormDialog = ({ show, team, employees, onCancel, onSave }) => {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const { t } = useLanguage()
    const { drawerProps, headerProps, contentProps, footerProps } = useSheetShell({ width: 'md' })
    const [form, setForm] = useState(emptyTeam)

    useEffect(() => {
        if (show) setForm(team ? { ...emptyTeam, ...team } : emptyTeam)
    }, [show, team])

    const activeEmployees = useMemo(() => employees.filter((e) => e.status !== 'disabled'), [employees])
    const alphaBorder = theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08)

    const toggleMember = (id) => {
        setForm((prev) => {
            const has = prev.memberIds.includes(id)
            const memberIds = has ? prev.memberIds.filter((m) => m !== id) : [...prev.memberIds, id]
            const leaderId = has && prev.leaderId === id ? '' : prev.leaderId
            return { ...prev, memberIds, leaderId }
        })
    }

    const save = () => {
        if (!form.name.trim() || form.memberIds.length === 0) return
        onSave({ ...form, id: form.id || `team-${Date.now()}` })
    }

    const drawer = (
        <Drawer {...drawerProps} open={show} onClose={onCancel}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box {...headerProps}>
                    <Typography sx={{ fontSize: '1.125rem', fontWeight: 600 }}>{team ? t('Chỉnh sửa nhóm') : t('Tạo nhóm mới')}</Typography>
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
                        <AppIcon name='X' size={16} />
                    </IconButton>
                </Box>

                <Box {...contentProps}>
                    <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 180px' } }}>
                        <FormField label={t('Tên nhóm')} required>
                            <TextField
                                fullWidth
                                size='small'
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                // eslint-disable-next-line jsx-a11y/no-autofocus -- intentional: focus the first field when the dialog/panel opens
                                autoFocus
                            />
                        </FormField>
                        <FormField label={t('Màu nhãn')}>
                            <TextField
                                select
                                fullWidth
                                size='small'
                                value={form.color}
                                onChange={(e) => setForm({ ...form, color: e.target.value })}
                            >
                                {COLOR_OPTIONS.map((c) => (
                                    <MenuItem key={c} value={c}>
                                        <Stack direction='row' spacing={1} alignItems='center'>
                                            <AppIcon
                                                name='UsersThree'
                                                size={16}
                                                color={theme.palette[c]?.main || theme.palette.primary.main}
                                            />
                                            {t(COLOR_LABEL[c] || c)}
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </FormField>
                    </Box>

                    <FormField label={t('Mô tả')}>
                        <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            size='small'
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </FormField>

                    <FormField
                        label={t('Thành viên · {n} đã chọn', { n: form.memberIds.length })}
                        hint={t('Chọn thành viên, chọn tiếp một người để đặt làm trưởng nhóm.')}
                    >
                        <Box sx={{ border: `1px solid ${alphaBorder}`, borderRadius: 1.5, maxHeight: 320, overflowY: 'auto' }}>
                            {activeEmployees.map((emp, idx) => {
                                const selected = form.memberIds.includes(emp.id)
                                const isLeader = form.leaderId === emp.id
                                return (
                                    <Box
                                        key={emp.id}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.25,
                                            px: 1.5,
                                            py: 1,
                                            borderTop: idx === 0 ? 'none' : `1px solid ${alphaBorder}`,
                                            transition: 'background-color 120ms ease-out',
                                            '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.03) }
                                        }}
                                    >
                                        <Checkbox size='small' checked={selected} onChange={() => toggleMember(emp.id)} />
                                        <PersonAvatar name={emp.name} size={30} />
                                        <Stack sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }} noWrap>
                                                {emp.name}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }} noWrap>
                                                {emp.jobTitle} · {emp.department}
                                            </Typography>
                                        </Stack>
                                        {selected && (
                                            <Box
                                                component='button'
                                                type='button'
                                                onClick={() => setForm((prev) => ({ ...prev, leaderId: isLeader ? '' : emp.id }))}
                                                sx={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 0.5,
                                                    height: 22,
                                                    px: 1,
                                                    borderRadius: 0.75,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    fontFamily: 'inherit',
                                                    cursor: 'pointer',
                                                    bgcolor: isLeader
                                                        ? alpha(
                                                              theme.palette.spectrum?.amber?.main || theme.palette.warning.main,
                                                              isDark ? 0.2 : 0.12
                                                          )
                                                        : alpha(theme.palette.text.primary, 0.05),
                                                    color: isLeader
                                                        ? isDark
                                                            ? theme.palette.spectrum?.amber?.light || theme.palette.warning.light
                                                            : theme.palette.spectrum?.amber?.dark || theme.palette.warning.dark
                                                        : theme.palette.text.primary,
                                                    border: `1px solid ${alpha(
                                                        isLeader
                                                            ? theme.palette.spectrum?.amber?.main || theme.palette.warning.main
                                                            : theme.palette.text.primary,
                                                        0.15
                                                    )}`
                                                }}
                                            >
                                                {isLeader && <AppIcon name='Crown' size={12} />}
                                                {isLeader ? t('Trưởng nhóm') : t('Đặt làm trưởng nhóm')}
                                            </Box>
                                        )}
                                    </Box>
                                )
                            })}
                        </Box>
                    </FormField>
                </Box>

                <Box {...footerProps}>
                    <Button onClick={onCancel} color='inherit' sx={{ fontWeight: 500 }}>
                        {t('Huỷ')}
                    </Button>
                    <Button variant='contained' onClick={save} disabled={!form.name.trim() || form.memberIds.length === 0}>
                        {t('Lưu')}
                    </Button>
                </Box>
            </Box>
        </Drawer>
    )

    return createPortal(drawer, document.getElementById('portal') || document.body)
}

TeamFormDialog.propTypes = {
    show: PropTypes.bool,
    team: PropTypes.object,
    employees: PropTypes.array,
    onCancel: PropTypes.func,
    onSave: PropTypes.func
}

export default TeamFormDialog
