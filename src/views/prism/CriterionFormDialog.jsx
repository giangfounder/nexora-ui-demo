import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'

// material-ui
import { alpha, useTheme } from '@mui/material/styles'
import { Box, Button, Drawer, IconButton, MenuItem, Slider, Stack, TextField, Typography } from '@mui/material'
import { AppIcon } from '@/ui-component/icons/AppIcon'

// project imports
import { FormField, useSheetShell } from '@/hooks/useDialogShell'
import { StyledButton } from '@/ui-component/button/StyledButton'
import DateField from '@/ui-component/input/DateField'
import { useLanguage } from '@/store/context/LanguageContext'
import { mockEmployees } from '@/views/employees/mockEmployees'

const today = () => new Date().toISOString().slice(0, 10)

const emptyCriterion = () => ({
    id: '',
    name: '',
    weight: 10,
    version: 'v1.0',
    owner: mockEmployees[0]?.id || '',
    effectiveDate: today(),
    status: 'draft',
    description: ''
})

const CriterionFormDialog = ({ show, criterion, onCancel, onSave }) => {
    const { t } = useLanguage()
    const theme = useTheme()
    const { drawerProps, headerProps, contentProps, footerProps } = useSheetShell({ width: 'md' })
    const portalElement = typeof document !== 'undefined' ? document.getElementById('portal') : null
    const [form, setForm] = useState(emptyCriterion)

    useEffect(() => {
        if (show) setForm(criterion ? { ...emptyCriterion(), ...criterion } : emptyCriterion())
    }, [show, criterion])

    const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }))
    const canSave = form.name.trim().length > 0 && form.version.trim().length > 0 && !!form.effectiveDate

    const component = (
        <Drawer {...drawerProps} open={!!show} onClose={onCancel}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box {...headerProps}>
                    <Typography variant='h4'>{criterion ? t('Chỉnh sửa tiêu chí') : t('Thêm tiêu chí chấm điểm')}</Typography>
                    <IconButton
                        onClick={onCancel}
                        aria-label={t('Đóng')}
                        size='small'
                        sx={{
                            width: 28,
                            height: 28,
                            color: 'text.secondary',
                            '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.06), color: 'text.primary' }
                        }}
                    >
                        <AppIcon name='X' size={16} />
                    </IconButton>
                </Box>

                <Box {...contentProps}>
                    <FormField label={t('Tên tiêu chí')} required htmlFor='crit-name'>
                        <TextField
                            id='crit-name'
                            fullWidth
                            size='small'
                            value={form.name}
                            onChange={(e) => set('name')(e.target.value)}
                            // eslint-disable-next-line jsx-a11y/no-autofocus -- intentional: focus the first field when the dialog/panel opens
                            autoFocus
                            placeholder={t('Ví dụ: Chào hỏi & xưng danh')}
                        />
                    </FormField>

                    <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' } }}>
                        <FormField label={t('Phiên bản')} required htmlFor='crit-version'>
                            <TextField
                                id='crit-version'
                                fullWidth
                                size='small'
                                value={form.version}
                                onChange={(e) => set('version')(e.target.value)}
                                placeholder='v1.0'
                            />
                        </FormField>

                        <FormField label={t('Trạng thái')}>
                            <TextField select fullWidth size='small' value={form.status} onChange={(e) => set('status')(e.target.value)}>
                                <MenuItem value='active'>{t('Đang áp dụng')}</MenuItem>
                                <MenuItem value='draft'>{t('Nháp')}</MenuItem>
                            </TextField>
                        </FormField>

                        <FormField label={t('Người phụ trách')}>
                            <TextField select fullWidth size='small' value={form.owner} onChange={(e) => set('owner')(e.target.value)}>
                                {mockEmployees.map((e) => (
                                    <MenuItem key={e.id} value={e.id}>
                                        {e.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </FormField>

                        <FormField label={t('Ngày hiệu lực')} required>
                            <DateField value={form.effectiveDate} onChange={set('effectiveDate')} clearable={false} />
                        </FormField>
                    </Box>

                    <FormField label={t('Trọng số')} hint={t('Tổng trọng số các tiêu chí đang áp dụng nên bằng 100.')}>
                        <Stack direction='row' spacing={2} alignItems='center'>
                            <Slider
                                size='small'
                                value={form.weight}
                                min={0}
                                max={50}
                                onChange={(_, v) => set('weight')(v)}
                                aria-label={t('Trọng số')}
                                sx={{ flex: 1 }}
                            />
                            <Typography
                                variant='body2'
                                sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', minWidth: 24, textAlign: 'right' }}
                            >
                                {form.weight}
                            </Typography>
                        </Stack>
                    </FormField>

                    <FormField label={t('Hướng dẫn chấm')} htmlFor='crit-desc'>
                        <TextField
                            id='crit-desc'
                            fullWidth
                            multiline
                            minRows={4}
                            size='small'
                            value={form.description}
                            onChange={(e) => set('description')(e.target.value)}
                        />
                    </FormField>
                </Box>

                <Box {...footerProps}>
                    <Button onClick={onCancel} color='inherit' sx={{ fontWeight: 500 }}>
                        {t('Huỷ')}
                    </Button>
                    <StyledButton
                        variant='contained'
                        disabled={!canSave}
                        onClick={() => onSave({ ...form, id: form.id || `crit-${Date.now()}` })}
                    >
                        {t('Lưu')}
                    </StyledButton>
                </Box>
            </Box>
        </Drawer>
    )

    return portalElement ? createPortal(component, portalElement) : component
}

CriterionFormDialog.propTypes = {
    show: PropTypes.bool,
    criterion: PropTypes.object,
    onCancel: PropTypes.func,
    onSave: PropTypes.func
}

export default CriterionFormDialog
