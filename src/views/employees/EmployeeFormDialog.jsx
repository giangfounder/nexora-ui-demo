import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { useState } from 'react'

import { alpha, useTheme } from '@mui/material/styles'
import { Box, Button, Drawer, IconButton, MenuItem, TextField, Typography } from '@mui/material'
import { IconX } from '@tabler/icons-react'

import { StyledButton } from '@/ui-component/button/StyledButton'
import { FormField, useSheetShell } from '@/hooks/useDialogShell'
import { useLanguage } from '@/store/context/LanguageContext'

const emptyForm = {
    name: '',
    email: '',
    phone: '',
    jobTitle: '',
    department: '',
    roleId: '',
    status: 'invited'
}

const EmployeeFormDialog = ({ show, employee, roles, onCancel, onSave }) => {
    const { t } = useLanguage()
    const theme = useTheme()
    const { drawerProps, headerProps, contentProps, footerProps } = useSheetShell({ width: 'md' })
    const portalElement = typeof document !== 'undefined' ? document.getElementById('portal') : null
    const [form, setForm] = useState(employee || emptyForm)

    const update = (patch) => setForm((prev) => ({ ...prev, ...patch }))

    const component = (
        <Drawer {...drawerProps} open={show} onClose={onCancel}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box {...headerProps}>
                    <Typography sx={{ fontSize: '1.125rem', fontWeight: 600 }}>
                        {employee ? t('Chỉnh sửa nhân viên') : t('Mời nhân viên')}
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
                        <IconX size={16} strokeWidth={2.5} />
                    </IconButton>
                </Box>

                <Box {...contentProps}>
                    <FormField label={t('Họ và tên')} required>
                        {/* eslint-disable-next-line jsx-a11y/no-autofocus -- intentional: focus the first field when the dialog/panel opens */}
                        <TextField fullWidth size='small' value={form.name} onChange={(e) => update({ name: e.target.value })} autoFocus />
                    </FormField>

                    <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' } }}>
                        <FormField label={t('Email')} required>
                            <TextField
                                fullWidth
                                size='small'
                                type='email'
                                value={form.email}
                                onChange={(e) => update({ email: e.target.value })}
                            />
                        </FormField>
                        <FormField label={t('Số điện thoại')}>
                            <TextField fullWidth size='small' value={form.phone} onChange={(e) => update({ phone: e.target.value })} />
                        </FormField>
                        <FormField label={t('Chức danh')}>
                            <TextField
                                fullWidth
                                size='small'
                                value={form.jobTitle}
                                onChange={(e) => update({ jobTitle: e.target.value })}
                            />
                        </FormField>
                        <FormField label={t('Phòng ban')}>
                            <TextField
                                fullWidth
                                size='small'
                                value={form.department}
                                onChange={(e) => update({ department: e.target.value })}
                            />
                        </FormField>
                        <FormField label={t('Vai trò')} required>
                            <TextField
                                select
                                fullWidth
                                size='small'
                                value={form.roleId}
                                onChange={(e) => update({ roleId: e.target.value })}
                            >
                                {roles.map((r) => (
                                    <MenuItem key={r.id} value={r.id}>
                                        {r.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </FormField>
                        <FormField label={t('Trạng thái')}>
                            <TextField
                                select
                                fullWidth
                                size='small'
                                value={form.status}
                                onChange={(e) => update({ status: e.target.value })}
                            >
                                <MenuItem value='active'>{t('Đang hoạt động')}</MenuItem>
                                <MenuItem value='invited'>{t('Đã mời')}</MenuItem>
                                <MenuItem value='disabled'>{t('Vô hiệu')}</MenuItem>
                            </TextField>
                        </FormField>
                    </Box>
                </Box>

                <Box {...footerProps}>
                    <Button onClick={onCancel} color='inherit' sx={{ fontWeight: 500 }}>
                        {t('Huỷ')}
                    </Button>
                    <StyledButton
                        variant='contained'
                        disabled={!form.name.trim() || !form.email.trim() || !form.roleId}
                        onClick={() => onSave(form)}
                    >
                        {employee ? t('Lưu') : t('Gửi lời mời')}
                    </StyledButton>
                </Box>
            </Box>
        </Drawer>
    )

    return portalElement ? createPortal(component, portalElement) : component
}

EmployeeFormDialog.propTypes = {
    show: PropTypes.bool,
    employee: PropTypes.object,
    roles: PropTypes.array,
    onCancel: PropTypes.func,
    onSave: PropTypes.func
}

export default EmployeeFormDialog
