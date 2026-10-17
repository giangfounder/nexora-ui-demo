import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { useState } from 'react'

import { alpha, useTheme } from '@mui/material/styles'
import { Box, Button, Drawer, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { IconPlus, IconTrashFilled, IconX } from '@tabler/icons-react'

import { StyledButton } from '@/ui-component/button/StyledButton'
import { FormField, useSheetShell } from '@/hooks/useDialogShell'
import { useLanguage } from '@/store/context/LanguageContext'

const ATTRIBUTE_TYPES = [
    { value: 'text', label: 'Văn bản' },
    { value: 'number', label: 'Số' },
    { value: 'select', label: 'Chọn 1' },
    { value: 'multiselect', label: 'Chọn nhiều' },
    { value: 'checkbox', label: 'Có/Không' }
]

const EmployeeSettingsDialog = ({ show, attributeDefs, onCancel, onSave }) => {
    const { t } = useLanguage()
    const theme = useTheme()
    const { drawerProps, headerProps, contentProps, footerProps } = useSheetShell({ width: 'lg' })
    const portalElement = typeof document !== 'undefined' ? document.getElementById('portal') : null
    const [attrs, setAttrs] = useState(attributeDefs || [])

    const updateAttr = (index, patch) => setAttrs((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)))
    const addAttr = () => setAttrs((prev) => [...prev, { id: `attr-${Date.now()}`, label: t('Thuộc tính mới'), type: 'text', options: [] }])
    const removeAttr = (index) => setAttrs((prev) => prev.filter((_, i) => i !== index))

    const component = (
        <Drawer {...drawerProps} open={show} onClose={onCancel}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box {...headerProps}>
                    <Typography sx={{ fontSize: '1.125rem', fontWeight: 600 }}>{t('Cấu hình nhân sự')}</Typography>
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
                    <FormField label={t('Thuộc tính tuỳ chỉnh')} hint={t('Định nghĩa các trường bổ sung cho hồ sơ nhân viên.')}>
                        <Stack spacing={1.5}>
                            {attrs.map((attr, index) => (
                                <Stack key={attr.id} direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ sm: 'center' }}>
                                    <TextField
                                        size='small'
                                        placeholder={t('Tên thuộc tính')}
                                        value={attr.label}
                                        onChange={(e) => updateAttr(index, { label: e.target.value })}
                                        sx={{ flex: 1 }}
                                    />
                                    <TextField
                                        select
                                        size='small'
                                        value={attr.type}
                                        onChange={(e) => updateAttr(index, { type: e.target.value })}
                                        sx={{ width: { xs: '100%', sm: 160 } }}
                                    >
                                        {ATTRIBUTE_TYPES.map((at) => (
                                            <MenuItem key={at.value} value={at.value}>
                                                {t(at.label)}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                    {(attr.type === 'select' || attr.type === 'multiselect') && (
                                        <TextField
                                            size='small'
                                            placeholder={t('Tuỳ chọn, phân cách bằng dấu phẩy')}
                                            value={(attr.options || []).join(', ')}
                                            onChange={(e) =>
                                                updateAttr(index, {
                                                    options: e.target.value
                                                        .split(',')
                                                        .map((o) => o.trim())
                                                        .filter(Boolean)
                                                })
                                            }
                                            sx={{ flex: 1 }}
                                        />
                                    )}
                                    <IconButton
                                        size='small'
                                        onClick={() => removeAttr(index)}
                                        aria-label={t('Xoá {name}', { name: attr.label })}
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: 1,
                                            color: 'text.secondary',
                                            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08), color: 'error.main' }
                                        }}
                                    >
                                        <IconTrashFilled size={16} />
                                    </IconButton>
                                </Stack>
                            ))}
                            <Button
                                startIcon={<IconPlus size={16} strokeWidth={2.5} />}
                                onClick={addAttr}
                                sx={{ alignSelf: 'flex-start', fontWeight: 500 }}
                            >
                                {t('Thêm thuộc tính')}
                            </Button>
                        </Stack>
                    </FormField>
                </Box>

                <Box {...footerProps}>
                    <Button onClick={onCancel} color='inherit' sx={{ fontWeight: 500 }}>
                        {t('Huỷ')}
                    </Button>
                    <StyledButton variant='contained' onClick={() => onSave(attrs)}>
                        {t('Lưu')}
                    </StyledButton>
                </Box>
            </Box>
        </Drawer>
    )

    return portalElement ? createPortal(component, portalElement) : component
}

EmployeeSettingsDialog.propTypes = {
    show: PropTypes.bool,
    attributeDefs: PropTypes.array,
    onCancel: PropTypes.func,
    onSave: PropTypes.func
}

export default EmployeeSettingsDialog
