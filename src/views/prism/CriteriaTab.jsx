import { useState } from 'react'

// material-ui
import { alpha, useTheme } from '@mui/material/styles'
import { Box, Button, IconButton, Stack, Table, TableBody, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material'
import { AppIcon } from '@/ui-component/icons/AppIcon'

// project imports
import CriterionFormDialog from './CriterionFormDialog'
import { useLanguage } from '@/store/context/LanguageContext'
import { SharedTableCell, SharedTableContainer, SharedTableRow, StatusIcon } from '@/ui-component/table/SharedTable'
import { mockEmployees } from '@/views/employees/mockEmployees'
import { DEFAULT_AI_PROMPT, mockPrismCriteria } from './mockPrism'

const STATUS = {
    active: { tone: 'emerald', label: 'Đang áp dụng', icon: 'CheckCircle' },
    draft: { tone: 'amber', label: 'Bản nháp', icon: 'NotePencil' }
}

const formatDate = (iso, locale) => {
    if (!iso) return '—'
    const d = new Date(iso.slice(0, 10))
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })
}

const CriteriaTab = () => {
    const { t, locale } = useLanguage()
    const theme = useTheme()
    const alphaBorder = theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08)
    const [criteria, setCriteria] = useState(mockPrismCriteria)
    const [aiPrompt, setAiPrompt] = useState(DEFAULT_AI_PROMPT)
    const [saved, setSaved] = useState({ criteria: mockPrismCriteria, aiPrompt: DEFAULT_AI_PROMPT })
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const dirty = criteria !== saved.criteria || aiPrompt !== saved.aiPrompt

    const activeWeight = criteria.filter((c) => c.status === 'active').reduce((s, c) => s + c.weight, 0)
    const ownerName = (id) => mockEmployees.find((e) => e.id === id)?.name || '—'

    const remove = (id) => setCriteria((prev) => prev.filter((c) => c.id !== id))
    const openAdd = () => {
        setEditing(null)
        setDialogOpen(true)
    }
    const openEdit = (c) => {
        setEditing(c)
        setDialogOpen(true)
    }
    const closeDialog = () => {
        setDialogOpen(false)
        setEditing(null)
    }
    const handleSave = (crit) => {
        setCriteria((prev) => (prev.some((c) => c.id === crit.id) ? prev.map((c) => (c.id === crit.id ? crit : c)) : [...prev, crit]))
        closeDialog()
    }
    const save = () => setSaved({ criteria, aiPrompt })
    const revert = () => {
        setCriteria(saved.criteria)
        setAiPrompt(saved.aiPrompt)
    }

    return (
        <Stack spacing={3}>
            <Box sx={{ border: `1px solid ${alphaBorder}`, borderRadius: 2, bgcolor: 'background.paper', p: 2.5 }}>
                <Stack spacing={1.5}>
                    <Typography variant='h5'>{t('Hướng dẫn chấm điểm')}</Typography>
                    <TextField
                        multiline
                        minRows={3}
                        fullWidth
                        size='small'
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                    />
                </Stack>
            </Box>

            <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ flexWrap: 'wrap', gap: 1.5 }}>
                <Stack direction='row' spacing={1.5} alignItems='baseline'>
                    <Typography variant='h5'>{t('Tiêu chí chấm điểm')}</Typography>
                    <Typography variant='caption' color='text.secondary' sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {t('Trọng số đang áp dụng {n}/100', { n: activeWeight })}
                    </Typography>
                </Stack>
                <Stack direction='row' spacing={1}>
                    <Button startIcon={<AppIcon name='ArrowUUpLeft' size={16} />} disabled={!dirty} onClick={revert} size='small'>
                        {t('Hoàn tác')}
                    </Button>
                    <Button
                        variant='outlined'
                        startIcon={<AppIcon name='FloppyDisk' size={16} />}
                        disabled={!dirty}
                        onClick={save}
                        size='small'
                    >
                        {t('Lưu')}
                    </Button>
                    <Button variant='contained' startIcon={<AppIcon name='Plus' size={16} />} onClick={openAdd} size='small'>
                        {t('Thêm tiêu chí')}
                    </Button>
                </Stack>
            </Stack>

            <SharedTableContainer>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <SharedTableCell>{t('Tên')}</SharedTableCell>
                            <SharedTableCell numeric>{t('Trọng số')}</SharedTableCell>
                            <SharedTableCell>{t('Phiên bản')}</SharedTableCell>
                            <SharedTableCell>{t('Người phụ trách')}</SharedTableCell>
                            <SharedTableCell numeric>{t('Ngày hiệu lực')}</SharedTableCell>
                            <SharedTableCell>{t('Trạng thái')}</SharedTableCell>
                            <SharedTableCell align='right'>{t('Thao tác')}</SharedTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {criteria.length === 0 && (
                            <SharedTableRow>
                                <SharedTableCell colSpan={7} sx={{ textAlign: 'center', color: 'text.secondary', py: 5 }}>
                                    {t('Chưa có tiêu chí nào')}
                                </SharedTableCell>
                            </SharedTableRow>
                        )}
                        {criteria.map((c) => {
                            const status = STATUS[c.status] || STATUS.draft
                            return (
                                <SharedTableRow key={c.id}>
                                    <SharedTableCell sx={{ maxWidth: 420 }}>
                                        <Typography variant='body2' sx={{ fontWeight: 500 }}>
                                            {c.name}
                                        </Typography>
                                        {c.description && (
                                            <Tooltip title={c.description}>
                                                <Typography variant='caption' color='text.secondary' noWrap component='div'>
                                                    {c.description}
                                                </Typography>
                                            </Tooltip>
                                        )}
                                    </SharedTableCell>
                                    <SharedTableCell numeric>{c.weight}</SharedTableCell>
                                    <SharedTableCell sx={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                                        {c.version || '—'}
                                    </SharedTableCell>
                                    <SharedTableCell sx={{ whiteSpace: 'nowrap' }}>{ownerName(c.owner)}</SharedTableCell>
                                    <SharedTableCell numeric sx={{ whiteSpace: 'nowrap' }}>
                                        {formatDate(c.effectiveDate, locale)}
                                    </SharedTableCell>
                                    <SharedTableCell sx={{ whiteSpace: 'nowrap' }}>
                                        <Stack direction='row' spacing={0.75} alignItems='center'>
                                            <StatusIcon tone={status.tone} icon={status.icon} />
                                            <span>{t(status.label)}</span>
                                        </Stack>
                                    </SharedTableCell>
                                    <SharedTableCell align='right' sx={{ whiteSpace: 'nowrap' }}>
                                        <Tooltip title={t('Chỉnh sửa')}>
                                            <IconButton
                                                size='small'
                                                onClick={() => openEdit(c)}
                                                aria-label={t('Chỉnh sửa {name}', { name: c.name })}
                                            >
                                                <AppIcon name='PencilSimpleLine' size={16} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('Xoá')}>
                                            <IconButton
                                                size='small'
                                                onClick={() => remove(c.id)}
                                                aria-label={t('Xoá {name}', { name: c.name })}
                                                sx={{
                                                    color: 'text.secondary',
                                                    '&:hover': { color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.08) }
                                                }}
                                            >
                                                <AppIcon name='Trash' size={16} />
                                            </IconButton>
                                        </Tooltip>
                                    </SharedTableCell>
                                </SharedTableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </SharedTableContainer>

            <CriterionFormDialog show={dialogOpen} criterion={editing} onCancel={closeDialog} onSave={handleSave} />
        </Stack>
    )
}

export default CriteriaTab
