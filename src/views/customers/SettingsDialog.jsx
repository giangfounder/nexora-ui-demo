import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { useState } from 'react'

import { Box, Button, Chip, Drawer, IconButton, MenuItem, Stack, Tab, Tabs, TextField, Typography } from '@mui/material'
import { AppIcon } from '@/ui-component/icons/AppIcon'

import { StyledButton } from '@/ui-component/button/StyledButton'
import { TabPanel } from '@/ui-component/tabs/TabPanel'
import { useLanguage } from '@/store/context/LanguageContext'
import { useSheetShell } from '@/hooks/useDialogShell'
import { alpha, useTheme } from '@mui/material/styles'
import { ATTRIBUTE_TYPES } from './mockCustomers'

const SettingsDialog = ({ show, attributeDefs, customerTypes, onCancel, onSave }) => {
    const { t } = useLanguage()
    const theme = useTheme()
    const { drawerProps, headerProps, contentProps, footerProps } = useSheetShell({ width: 'lg' })
    const portalElement = typeof document !== 'undefined' ? document.getElementById('portal') : null
    const [tab, setTab] = useState(0)
    const [attrs, setAttrs] = useState(attributeDefs)
    const [types, setTypes] = useState(customerTypes)

    const updateAttr = (index, patch) => setAttrs((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)))
    const addAttr = () => setAttrs((prev) => [...prev, { id: `attr-${Date.now()}`, label: t('Thuộc tính mới'), type: 'text', options: [] }])
    const removeAttr = (index) => setAttrs((prev) => prev.filter((_, i) => i !== index))

    const updateType = (typeIndex, patch) => setTypes((prev) => prev.map((ct, i) => (i === typeIndex ? { ...ct, ...patch } : ct)))
    const addType = () =>
        setTypes((prev) => [
            ...prev,
            { id: `type-${Date.now()}`, name: t('Loại khách mới'), stages: [{ id: `stage-${Date.now()}`, label: t('Giai đoạn 1') }] }
        ])
    const removeType = (typeIndex) => setTypes((prev) => prev.filter((_, i) => i !== typeIndex))
    const addStage = (typeIndex) =>
        setTypes((prev) =>
            prev.map((ct, i) =>
                i === typeIndex ? { ...ct, stages: [...ct.stages, { id: `stage-${Date.now()}`, label: t('Giai đoạn mới') }] } : ct
            )
        )
    const updateStage = (typeIndex, stageIndex, label) =>
        setTypes((prev) =>
            prev.map((ct, i) =>
                i === typeIndex ? { ...ct, stages: ct.stages.map((s, si) => (si === stageIndex ? { ...s, label } : s)) } : ct
            )
        )
    const removeStage = (typeIndex, stageIndex) =>
        setTypes((prev) => prev.map((ct, i) => (i === typeIndex ? { ...ct, stages: ct.stages.filter((_, si) => si !== stageIndex) } : ct)))

    const rowDeleteSx = {
        width: 32,
        height: 32,
        borderRadius: 1,
        color: 'text.secondary',
        '&:hover': { bgcolor: alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.16 : 0.08), color: 'error.main' }
    }

    const component = (
        <Drawer {...drawerProps} open={show} onClose={onCancel}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box {...headerProps}>
                    <Typography sx={{ fontSize: '1.125rem', fontWeight: 600 }}>{t('Cấu hình khách hàng')}</Typography>
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

                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    sx={{
                        px: 3,
                        borderBottom: 1,
                        borderColor: 'divider',
                        minHeight: 42,
                        '& .MuiTab-root': {
                            minHeight: 42,
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'text.secondary',
                            '&.Mui-selected': { fontWeight: 600, color: 'primary.main' }
                        },
                        '& .MuiTabs-indicator': { height: 2.5, borderRadius: '2px 2px 0 0' }
                    }}
                >
                    <Tab label={t('Thuộc tính tuỳ chỉnh')} />
                    <Tab label={t('Loại khách & pipeline')} />
                </Tabs>

                <Box {...contentProps}>
                    <TabPanel value={tab} index={0}>
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
                                        sx={{ width: { xs: '100%', sm: 180 } }}
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
                                        sx={rowDeleteSx}
                                    >
                                        <AppIcon name='Trash' size={16} />
                                    </IconButton>
                                </Stack>
                            ))}
                            <Button
                                startIcon={<AppIcon name='Plus' size={16} />}
                                onClick={addAttr}
                                sx={{ alignSelf: 'flex-start', fontWeight: 500 }}
                            >
                                {t('Thêm thuộc tính')}
                            </Button>
                        </Stack>
                    </TabPanel>

                    <TabPanel value={tab} index={1}>
                        <Stack spacing={2.5}>
                            {types.map((type, typeIndex) => (
                                <Box
                                    key={type.id}
                                    sx={{
                                        p: 2,
                                        border: `1px solid ${theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08)}`,
                                        borderRadius: 1.5
                                    }}
                                >
                                    <Stack direction='row' spacing={1.25} alignItems='center' sx={{ mb: 1.5 }}>
                                        <TextField
                                            size='small'
                                            placeholder={t('Tên loại khách')}
                                            value={type.name}
                                            onChange={(e) => updateType(typeIndex, { name: e.target.value })}
                                            sx={{ flex: 1 }}
                                        />
                                        <IconButton
                                            size='small'
                                            onClick={() => removeType(typeIndex)}
                                            aria-label={t('Xoá {name}', { name: type.name })}
                                            sx={rowDeleteSx}
                                        >
                                            <AppIcon name='Trash' size={16} />
                                        </IconButton>
                                    </Stack>
                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: 'text.secondary', mb: 1 }}>
                                        {t('Các giai đoạn pipeline (theo thứ tự)')}
                                    </Typography>
                                    <Stack spacing={1}>
                                        {type.stages.map((stage, stageIndex) => (
                                            <Stack key={stage.id} direction='row' spacing={1} alignItems='center'>
                                                <Chip
                                                    size='small'
                                                    label={stageIndex + 1}
                                                    sx={{
                                                        height: 22,
                                                        fontSize: '0.75rem',
                                                        bgcolor: alpha(theme.palette.text.primary, 0.06),
                                                        color: 'text.primary'
                                                    }}
                                                />
                                                <TextField
                                                    size='small'
                                                    placeholder={t('Giai đoạn {n}', { n: stageIndex + 1 })}
                                                    value={stage.label}
                                                    onChange={(e) => updateStage(typeIndex, stageIndex, e.target.value)}
                                                    sx={{ flex: 1 }}
                                                />
                                                <IconButton
                                                    size='small'
                                                    aria-label={t('Xoá {name}', { name: stage.label })}
                                                    onClick={() => removeStage(typeIndex, stageIndex)}
                                                    sx={{ ...rowDeleteSx, width: 28, height: 28 }}
                                                >
                                                    <AppIcon name='Trash' size={14} />
                                                </IconButton>
                                            </Stack>
                                        ))}
                                        <Button
                                            size='small'
                                            startIcon={<AppIcon name='Plus' size={14} />}
                                            onClick={() => addStage(typeIndex)}
                                            sx={{ alignSelf: 'flex-start', fontWeight: 500 }}
                                        >
                                            {t('Thêm giai đoạn')}
                                        </Button>
                                    </Stack>
                                </Box>
                            ))}
                            <Button
                                startIcon={<AppIcon name='Plus' size={16} />}
                                onClick={addType}
                                sx={{ alignSelf: 'flex-start', fontWeight: 500 }}
                            >
                                {t('Thêm loại khách')}
                            </Button>
                        </Stack>
                    </TabPanel>
                </Box>

                <Box {...footerProps}>
                    <Button onClick={onCancel} color='inherit' sx={{ fontWeight: 500 }}>
                        {t('Huỷ')}
                    </Button>
                    <StyledButton variant='contained' onClick={() => onSave({ attributeDefs: attrs, customerTypes: types })}>
                        {t('Lưu')}
                    </StyledButton>
                </Box>
            </Box>
        </Drawer>
    )

    return portalElement ? createPortal(component, portalElement) : component
}

SettingsDialog.propTypes = {
    show: PropTypes.bool,
    attributeDefs: PropTypes.array,
    customerTypes: PropTypes.array,
    onCancel: PropTypes.func,
    onSave: PropTypes.func
}

export default SettingsDialog
