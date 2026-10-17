import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { useEffect, useMemo, useState } from 'react'

import { alpha, useTheme } from '@mui/material/styles'
import { Box, Button, Checkbox, Drawer, FormControlLabel, IconButton, MenuItem, TextField, Typography } from '@mui/material'
import { IconX } from '@tabler/icons-react'

import { StyledButton } from '@/ui-component/button/StyledButton'
import DateField from '@/ui-component/input/DateField'
import { FormField, useSheetShell } from '@/hooks/useDialogShell'
import { useLanguage } from '@/store/context/LanguageContext'

const emptyCustomer = { name: '', typeId: '', stageId: '', email: '', phone: '', tags: [], attributes: {} }

const CustomerFormDialog = ({ show, customer, customerTypes, attributeDefs, onCancel, onSave }) => {
    const { t } = useLanguage()
    const theme = useTheme()
    const { drawerProps, headerProps, contentProps, footerProps } = useSheetShell({ width: 'md' })
    const portalElement = typeof document !== 'undefined' ? document.getElementById('portal') : null
    const [form, setForm] = useState(emptyCustomer)

    useEffect(() => {
        if (customer) setForm(customer)
        else setForm({ ...emptyCustomer, typeId: customerTypes[0]?.id, stageId: customerTypes[0]?.stages[0]?.id })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customer, show])

    const selectedType = useMemo(() => customerTypes.find((ct) => ct.id === form.typeId), [customerTypes, form.typeId])
    const setAttr = (attrId, value) => setForm((prev) => ({ ...prev, attributes: { ...prev.attributes, [attrId]: value } }))

    const alphaBorder = theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08)

    const renderAttr = (attr) => {
        if (attr.type === 'checkbox') {
            return (
                <FormControlLabel
                    control={
                        <Checkbox size='small' checked={!!form.attributes[attr.id]} onChange={(e) => setAttr(attr.id, e.target.checked)} />
                    }
                    label={<Typography variant='body2'>{t(attr.label)}</Typography>}
                />
            )
        }
        const common = {
            fullWidth: true,
            size: 'small',
            value: form.attributes[attr.id] || (attr.type === 'multiselect' ? [] : ''),
            onChange: (e) => setAttr(attr.id, e.target.value)
        }
        if (attr.type === 'select' || attr.type === 'multiselect') {
            return (
                <FormField label={t(attr.label)}>
                    <TextField
                        {...common}
                        select
                        SelectProps={
                            attr.type === 'multiselect'
                                ? { multiple: true, renderValue: (sel) => sel.map((v) => t(v)).join(', ') }
                                : undefined
                        }
                    >
                        {(attr.options || []).map((opt) => (
                            <MenuItem key={opt} value={opt}>
                                {t(opt)}
                            </MenuItem>
                        ))}
                    </TextField>
                </FormField>
            )
        }
        if (attr.type === 'date') {
            return (
                <FormField label={t(attr.label)}>
                    <DateField value={form.attributes[attr.id] || ''} onChange={(v) => setAttr(attr.id, v)} placeholder='dd/mm/yyyy' />
                </FormField>
            )
        }
        return (
            <FormField label={t(attr.label)}>
                <TextField {...common} type={attr.type === 'number' ? 'number' : 'text'} />
            </FormField>
        )
    }

    const halfAttrs = attributeDefs.filter((a) => a.type !== 'checkbox')
    const fullAttrs = attributeDefs.filter((a) => a.type === 'checkbox')

    const component = (
        <Drawer {...drawerProps} open={show} onClose={onCancel}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box {...headerProps}>
                    <Typography sx={{ fontSize: '1.125rem', fontWeight: 600 }}>
                        {customer ? t('Chỉnh sửa khách hàng') : t('Thêm khách hàng')}
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
                    <FormField label={t('Tên khách hàng')} required>
                        <TextField
                            fullWidth
                            size='small'
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            // eslint-disable-next-line jsx-a11y/no-autofocus -- intentional: focus the first field when the dialog/panel opens
                            autoFocus
                            placeholder={t('Ví dụ: Công ty ABC')}
                        />
                    </FormField>

                    <Box
                        sx={{
                            display: 'grid',
                            gap: 2.5,
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }
                        }}
                    >
                        <FormField label={t('Loại khách hàng')}>
                            <TextField
                                select
                                fullWidth
                                size='small'
                                value={form.typeId}
                                onChange={(e) => {
                                    const type = customerTypes.find((ct) => ct.id === e.target.value)
                                    setForm({ ...form, typeId: e.target.value, stageId: type?.stages[0]?.id })
                                }}
                            >
                                {customerTypes.map((ct) => (
                                    <MenuItem key={ct.id} value={ct.id}>
                                        {t(ct.name)}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </FormField>

                        <FormField label={t('Giai đoạn pipeline')}>
                            <TextField
                                select
                                fullWidth
                                size='small'
                                value={form.stageId}
                                onChange={(e) => setForm({ ...form, stageId: e.target.value })}
                            >
                                {(selectedType?.stages || []).map((s) => (
                                    <MenuItem key={s.id} value={s.id}>
                                        {t(s.label)}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </FormField>

                        <FormField label={t('Email')}>
                            <TextField
                                fullWidth
                                size='small'
                                type='email'
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                        </FormField>

                        <FormField label={t('Số điện thoại')}>
                            <TextField
                                fullWidth
                                size='small'
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            />
                        </FormField>

                        {halfAttrs.map((attr) => (
                            <Box key={attr.id}>{renderAttr(attr)}</Box>
                        ))}
                    </Box>

                    {fullAttrs.length > 0 && (
                        <Box
                            sx={{
                                pt: 2,
                                borderTop: `1px solid ${alphaBorder}`,
                                display: 'flex',
                                flexWrap: 'wrap',
                                columnGap: 3,
                                rowGap: 1
                            }}
                        >
                            {fullAttrs.map((attr) => (
                                <Box key={attr.id}>{renderAttr(attr)}</Box>
                            ))}
                        </Box>
                    )}
                </Box>

                <Box {...footerProps}>
                    <Button onClick={onCancel} color='inherit' sx={{ fontWeight: 500 }}>
                        {t('Huỷ')}
                    </Button>
                    <StyledButton variant='contained' onClick={() => onSave(form)} disabled={!form.name.trim()}>
                        {t('Lưu')}
                    </StyledButton>
                </Box>
            </Box>
        </Drawer>
    )

    return portalElement ? createPortal(component, portalElement) : component
}

CustomerFormDialog.propTypes = {
    show: PropTypes.bool,
    customer: PropTypes.object,
    customerTypes: PropTypes.array,
    attributeDefs: PropTypes.array,
    onCancel: PropTypes.func,
    onSave: PropTypes.func
}

export default CustomerFormDialog
