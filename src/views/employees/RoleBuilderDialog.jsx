import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { useState } from 'react'

import { alpha, useTheme } from '@mui/material/styles'
import {
    Box,
    Button,
    Checkbox,
    Drawer,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material'
import { FormField, useSheetShell } from '@/hooks/useDialogShell'
import { AppIcon } from '@/ui-component/icons/AppIcon'

import { StyledButton } from '@/ui-component/button/StyledButton'
import { SharedTableCell, SharedTableContainer } from '@/ui-component/table/SharedTable'
import { useLanguage } from '@/store/context/LanguageContext'
import { PERMISSION_ACTIONS, PERMISSION_MODULES } from './mockEmployees'

const ACTION_LABEL = { view: 'Xem', create: 'Tạo', edit: 'Sửa', delete: 'Xoá' }

const emptyPermissions = () =>
    PERMISSION_MODULES.reduce((acc, m) => {
        acc[m.id] = PERMISSION_ACTIONS.reduce((a, act) => ({ ...a, [act]: false }), {})
        return acc
    }, {})

const RoleBuilderDialog = ({ show, role, onCancel, onSave }) => {
    const { t } = useLanguage()
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const { drawerProps, headerProps, contentProps, footerProps } = useSheetShell({ width: 'xl' })
    const portalElement = typeof document !== 'undefined' ? document.getElementById('portal') : null
    const readOnly = !!role?.isSystem

    const [name, setName] = useState(role?.name || '')
    const [description, setDescription] = useState(role?.description || '')
    const [permissions, setPermissions] = useState(role?.permissions || emptyPermissions())

    const toggleCell = (moduleId, action) => {
        if (readOnly) return
        setPermissions((prev) => ({ ...prev, [moduleId]: { ...prev[moduleId], [action]: !prev[moduleId][action] } }))
    }

    const toggleRow = (moduleId) => {
        if (readOnly) return
        const allChecked = PERMISSION_ACTIONS.every((act) => permissions[moduleId][act])
        setPermissions((prev) => ({
            ...prev,
            [moduleId]: PERMISSION_ACTIONS.reduce((a, act) => ({ ...a, [act]: !allChecked }), {})
        }))
    }

    const toggleColumn = (action) => {
        if (readOnly) return
        const allChecked = PERMISSION_MODULES.every((m) => permissions[m.id][action])
        setPermissions((prev) => {
            const next = { ...prev }
            PERMISSION_MODULES.forEach((m) => {
                next[m.id] = { ...next[m.id], [action]: !allChecked }
            })
            return next
        })
    }

    const handleSave = () => {
        onSave({
            id: role?.id || `role-${Date.now()}`,
            name,
            description,
            isSystem: false,
            permissions
        })
    }

    const component = (
        <Drawer {...drawerProps} open={show} onClose={onCancel}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box {...headerProps}>
                    <Typography sx={{ fontSize: '1.125rem', fontWeight: 600 }}>
                        {role ? (readOnly ? t('Xem vai trò') : t('Chỉnh sửa vai trò')) : t('Tạo vai trò')}
                    </Typography>
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
                    <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' } }}>
                        <FormField label={t('Tên vai trò')} required>
                            <TextField fullWidth size='small' value={name} disabled={readOnly} onChange={(e) => setName(e.target.value)} />
                        </FormField>
                        <FormField label={t('Mô tả')}>
                            <TextField
                                fullWidth
                                size='small'
                                value={description}
                                disabled={readOnly}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </FormField>
                    </Box>

                    {readOnly && (
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 1.5,
                                bgcolor: alpha(theme.palette.spectrum?.amber?.main || theme.palette.warning.main, isDark ? 0.18 : 0.1),
                                border: `1px solid ${alpha(theme.palette.spectrum?.amber?.main || theme.palette.warning.main, 0.25)}`
                            }}
                        >
                            <Typography
                                sx={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
                                color={
                                    isDark
                                        ? theme.palette.spectrum?.amber?.light || theme.palette.warning.light
                                        : theme.palette.spectrum?.amber?.dark || theme.palette.warning.dark
                                }
                            >
                                {t('Hệ thống')}
                            </Typography>
                            <Typography sx={{ fontSize: '0.8125rem', mt: 0.25 }}>
                                {t('Vai trò hệ thống có quyền cố định và không thể chỉnh sửa.')}
                            </Typography>
                        </Box>
                    )}

                    <FormField label={t('Ma trận phân quyền')}>
                        <SharedTableContainer>
                            <Table size='small'>
                                <TableHead>
                                    <TableRow>
                                        <SharedTableCell>{t('Chức năng')}</SharedTableCell>
                                        {PERMISSION_ACTIONS.map((action) => (
                                            <SharedTableCell key={action} align='center'>
                                                <Stack alignItems='center' spacing={-0.5}>
                                                    <Checkbox
                                                        size='small'
                                                        disabled={readOnly}
                                                        inputProps={{
                                                            'aria-label': t('Bật/tắt cột: {action}', {
                                                                action: t(ACTION_LABEL[action] || action)
                                                            })
                                                        }}
                                                        checked={PERMISSION_MODULES.every((m) => permissions[m.id][action])}
                                                        onChange={() => toggleColumn(action)}
                                                    />
                                                    <Typography sx={{ fontSize: '0.75rem' }}>
                                                        {t(ACTION_LABEL[action] || action)}
                                                    </Typography>
                                                </Stack>
                                            </SharedTableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {PERMISSION_MODULES.map((m) => (
                                        <TableRow key={m.id} hover>
                                            <SharedTableCell>
                                                <Stack direction='row' spacing={1} alignItems='center'>
                                                    <Checkbox
                                                        size='small'
                                                        disabled={readOnly}
                                                        inputProps={{ 'aria-label': t('Bật/tắt hàng: {module}', { module: t(m.label) }) }}
                                                        checked={PERMISSION_ACTIONS.every((act) => permissions[m.id][act])}
                                                        onChange={() => toggleRow(m.id)}
                                                    />
                                                    <Typography sx={{ fontSize: '0.8125rem' }}>{t(m.label)}</Typography>
                                                </Stack>
                                            </SharedTableCell>
                                            {PERMISSION_ACTIONS.map((action) => (
                                                <SharedTableCell key={action} align='center'>
                                                    <Checkbox
                                                        size='small'
                                                        disabled={readOnly}
                                                        inputProps={{
                                                            'aria-label': t('{module} — {action}', {
                                                                module: t(m.label),
                                                                action: t(ACTION_LABEL[action] || action)
                                                            })
                                                        }}
                                                        checked={permissions[m.id][action]}
                                                        onChange={() => toggleCell(m.id, action)}
                                                    />
                                                </SharedTableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </SharedTableContainer>
                    </FormField>
                </Box>

                <Box {...footerProps}>
                    <Button onClick={onCancel} color='inherit' sx={{ fontWeight: 500 }}>
                        {readOnly ? t('Đóng') : t('Huỷ')}
                    </Button>
                    {!readOnly && (
                        <StyledButton variant='contained' onClick={handleSave} disabled={!name.trim()}>
                            {t('Lưu')}
                        </StyledButton>
                    )}
                </Box>
            </Box>
        </Drawer>
    )

    return portalElement ? createPortal(component, portalElement) : component
}

RoleBuilderDialog.propTypes = {
    show: PropTypes.bool,
    role: PropTypes.object,
    onCancel: PropTypes.func,
    onSave: PropTypes.func
}

export default RoleBuilderDialog
