import PropTypes from 'prop-types'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    Menu,
    MenuItem,
    Select,
    Skeleton,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material'
import { AppIcon } from '@/ui-component/icons/AppIcon'

import assistantsApi from '@/api/assistants'
import useConfirm from '@/hooks/useConfirm'
import useDialogShell, { FormField } from '@/hooks/useDialogShell'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'
import { StatusPill } from '@/ui-component/table/SharedTable'
import { MetaPill, stripVi } from '@/views/assistants/custom/workspace/primitives'

import FlowGlyph from './FlowGlyph'
import { CHANNELS } from './nodeCatalog'
import { createDoc, deleteDoc, duplicateDoc, listDocs } from './store'

const ago = (iso) => {
    const s = (Date.now() - new Date(iso).getTime()) / 1000
    if (s < 60) return 'vừa xong'
    if (s < 3600) return `${Math.floor(s / 60)} phút trước`
    if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`
    if (s < 86400 * 30) return `${Math.floor(s / 86400)} ngày trước`
    return new Date(iso).toLocaleDateString('vi-VN')
}

const shortModel = (m) => {
    if (!m) return null
    const paren = m.label.match(/\(([^)]+)\)/)?.[1]
    return paren && !/^(local|vietnamese)$/i.test(paren) ? paren : m.label.replace(/\s*\([^)]*\)/, '')
}

const AssistantCard = ({ doc, modelLabel, onOpen, onDuplicate, onDelete }) => {
    const theme = useTheme()
    const [anchor, setAnchor] = useState(null)
    const kb = (doc.tools || []).filter((t) => t.kind === 'kb' || t.kind === 'retrieverAgentflow').length
    const tools = (doc.tools || []).length - kb
    const channels = (doc.channels || []).map((c) => CHANNELS.find((x) => x.id === c)?.label).filter(Boolean)

    return (
        <Box
            role='link'
            tabIndex={0}
            aria-label={`Mở ${doc.name}`}
            onClick={onOpen}
            onKeyDown={(e) => e.key === 'Enter' && onOpen()}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '10px',
                border: `1px solid ${theme.palette.alpha.border}`,
                bgcolor: 'background.paper',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'border-color 200ms ease-out',
                '&:hover': { borderColor: theme.palette.alpha.borderStrong },
                '&:hover .glyph': { bgcolor: theme.palette.alpha.hover },
                '&:focus-visible': { outline: 'none', boxShadow: theme.customShadows?.focusRing }
            }}
        >
            <Box
                className='glyph'
                sx={{
                    height: 136,
                    px: 1,
                    bgcolor: theme.palette.surface?.sunken,
                    borderBottom: `1px solid ${theme.palette.alpha.border}`,
                    transition: 'background-color 200ms ease-out'
                }}
            >
                <FlowGlyph doc={doc} height={136} />
            </Box>
            <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Stack direction='row' alignItems='center' spacing={1}>
                    <Typography variant='h4' noWrap sx={{ flex: 1, minWidth: 0 }} title={doc.name}>
                        {doc.name}
                    </Typography>
                    <Tooltip title='Thao tác'>
                        <IconButton
                            size='small'
                            aria-label={`Thao tác với ${doc.name}`}
                            onClick={(e) => {
                                e.stopPropagation()
                                setAnchor(e.currentTarget)
                            }}
                        >
                            <AppIcon name='DotsThreeVertical' size={16} />
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={anchor}
                        open={Boolean(anchor)}
                        onClose={() => setAnchor(null)}
                        onClick={(e) => e.stopPropagation()}
                        PaperProps={{ sx: { minWidth: 180 } }}
                    >
                        <MenuItem onClick={onOpen} sx={{ fontSize: '0.875rem' }}>
                            Mở
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                setAnchor(null)
                                onDuplicate()
                            }}
                            sx={{ fontSize: '0.875rem' }}
                        >
                            Nhân bản
                        </MenuItem>
                        <Divider />
                        <MenuItem
                            onClick={() => {
                                setAnchor(null)
                                onDelete()
                            }}
                            sx={{ fontSize: '0.875rem', color: 'error.main' }}
                        >
                            Xoá
                        </MenuItem>
                    </Menu>
                </Stack>
                <Stack direction='row' sx={{ gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                    {doc.status === 'active' ? (
                        <StatusPill tone='emerald' label='Đang hoạt động' />
                    ) : (
                        <StatusPill tone='teal' label='Bản nháp' />
                    )}
                    {modelLabel && <MetaPill>{modelLabel}</MetaPill>}
                    <MetaPill tone='emerald'>{kb} kho</MetaPill>
                    <MetaPill tone='orange'>{tools} công cụ</MetaPill>
                </Stack>
                <Box sx={{ flex: 1 }} />
                <Typography variant='caption' color='text.secondary' noWrap sx={{ display: 'block', mt: 2 }}>
                    {[channels.join(' · '), `Cập nhật ${ago(doc.updatedAt)}`].filter(Boolean).join('  ·  ')}
                </Typography>
            </Box>
        </Box>
    )
}
AssistantCard.propTypes = {
    doc: PropTypes.object,
    modelLabel: PropTypes.string,
    onOpen: PropTypes.func,
    onDuplicate: PropTypes.func,
    onDelete: PropTypes.func
}

const CreateDialog = ({ open, onClose, models, onCreate }) => {
    const { dialogProps, titleProps, contentProps, actionsProps } = useDialogShell({ size: 'sm' })
    const [name, setName] = useState('')
    const [modelName, setModelName] = useState('chatOpenAI')
    const [touched, setTouched] = useState(false)
    const error = touched && !name.trim()
    useEffect(() => {
        if (open) {
            setName('')
            setTouched(false)
        }
    }, [open])
    const submit = () => {
        setTouched(true)
        if (name.trim()) onCreate({ name: name.trim(), modelName })
    }
    return (
        <Dialog
            open={open}
            onClose={onClose}
            {...dialogProps}
            PaperProps={{ ...dialogProps.PaperProps, sx: { ...dialogProps.PaperProps.sx, height: 'auto' } }}
        >
            <DialogTitle {...titleProps}>Tạo trợ lý</DialogTitle>
            <DialogContent {...contentProps}>
                <FormField label='Tên trợ lý' required>
                    <TextField
                        // eslint-disable-next-line jsx-a11y/no-autofocus -- intentional: focus the first field when the dialog/panel opens
                        autoFocus
                        size='small'
                        value={name}
                        error={error}
                        helperText={error ? 'Đặt tên để dễ tìm lại trợ lý' : undefined}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && submit()}
                        placeholder='vd: Trợ lý CSKH Zalo'
                    />
                </FormField>
                <FormField label='Mô hình'>
                    <Select size='small' value={modelName} onChange={(e) => setModelName(e.target.value)}>
                        {models.map((m) => (
                            <MenuItem key={m.name} value={m.name}>
                                {m.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormField>
            </DialogContent>
            <DialogActions {...actionsProps}>
                <Button onClick={onClose}>Huỷ</Button>
                <Button variant='contained' onClick={submit}>
                    Tạo
                </Button>
            </DialogActions>
        </Dialog>
    )
}
CreateDialog.propTypes = { open: PropTypes.bool, onClose: PropTypes.func, models: PropTypes.array, onCreate: PropTypes.func }

const AssistantDirectory = () => {
    const theme = useTheme()
    const navigate = useNavigate()
    const { confirm } = useConfirm()
    const [docs, setDocs] = useState(null)
    const [models, setModels] = useState([])
    const [q, setQ] = useState('')
    const [filter, setFilter] = useState('all')
    const [sort, setSort] = useState('recent')
    const [creating, setCreating] = useState(false)

    const refresh = () => setDocs(listDocs())
    useEffect(() => {
        refresh()
        assistantsApi
            .getChatModels()
            .then((r) => setModels(r.data || []))
            .catch(() => setModels([]))
    }, [])

    const counts = useMemo(() => {
        const all = docs || []
        return {
            all: all.length,
            active: all.filter((d) => d.status === 'active').length,
            draft: all.filter((d) => d.status !== 'active').length
        }
    }, [docs])

    const shown = useMemo(() => {
        const needle = stripVi(q.trim())
        const list = (docs || []).filter(
            (d) =>
                (filter === 'all' || (filter === 'active' ? d.status === 'active' : d.status !== 'active')) &&
                (!needle || stripVi(d.name).includes(needle))
        )
        return sort === 'name' ? [...list].sort((a, b) => a.name.localeCompare(b.name, 'vi')) : list
    }, [docs, q, filter, sort])

    const open = (id) => navigate(`/assistants/studio/${id}`)

    const remove = async (doc) => {
        const ok = await confirm({
            title: 'Xoá trợ lý',
            description: `Xoá “${doc.name}”? Workflow và cấu hình sẽ mất.`,
            confirmButtonName: 'Xoá',
            cancelButtonName: 'Huỷ'
        })
        if (ok) {
            deleteDoc(doc.id)
            refresh()
        }
    }

    return (
        <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
                <Stack direction='row' alignItems='baseline' spacing={1} sx={{ flex: 1 }}>
                    <Typography component='h1' sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' }, fontWeight: 700, lineHeight: 1.2 }}>
                        Trợ lý
                    </Typography>
                    <Typography variant='caption' color='text.secondary' sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {docs ? counts.all : ''}
                    </Typography>
                </Stack>
                <TextField
                    size='small'
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder='Tìm theo tên trợ lý'
                    sx={{ width: { xs: '100%', sm: 280 } }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position='start'>
                                <AppIcon name='MagnifyingGlass' size={16} />
                            </InputAdornment>
                        )
                    }}
                />
                <Button
                    variant='contained'
                    startIcon={<AppIcon name='Plus' size={16} />}
                    onClick={() => setCreating(true)}
                    sx={{ flexShrink: 0 }}
                >
                    Tạo trợ lý
                </Button>
            </Stack>

            <Stack direction='row' alignItems='center' spacing={1.5} sx={{ mb: 2 }}>
                <ToggleButtonGroup
                    size='small'
                    exclusive
                    value={filter}
                    onChange={(_, v) => v && setFilter(v)}
                    sx={{ '& .MuiToggleButton-root': { px: 1.5, textTransform: 'none', fontSize: '0.8125rem' } }}
                >
                    <ToggleButton value='all'>Tất cả · {counts.all}</ToggleButton>
                    <ToggleButton value='active'>Đang hoạt động · {counts.active}</ToggleButton>
                    <ToggleButton value='draft'>Bản nháp · {counts.draft}</ToggleButton>
                </ToggleButtonGroup>
                <Box sx={{ flex: 1 }} />
                <Select
                    size='small'
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    sx={{ '& .MuiSelect-select': { py: 0.75, fontSize: '0.8125rem' } }}
                >
                    <MenuItem value='recent'>Cập nhật gần nhất</MenuItem>
                    <MenuItem value='name'>Tên A–Z</MenuItem>
                </Select>
            </Stack>

            {docs === null ? (
                <Grid container spacing={2}>
                    {[0, 1, 2].map((i) => (
                        <Grid item xs={12} sm={6} lg={4} key={i}>
                            <Skeleton variant='rounded' height={250} sx={{ borderRadius: '10px' }} />
                        </Grid>
                    ))}
                </Grid>
            ) : shown.length === 0 ? (
                <Stack
                    alignItems='center'
                    spacing={1.5}
                    sx={{ py: 8, borderRadius: '10px', border: `1px dashed ${theme.palette.alpha.borderStrong}` }}
                >
                    <Typography variant='h5'>{q ? `Không có trợ lý nào tên “${q}”` : 'Chưa có trợ lý nào'}</Typography>
                    {!q && (
                        <Button variant='contained' startIcon={<AppIcon name='Plus' size={16} />} onClick={() => setCreating(true)}>
                            Tạo trợ lý
                        </Button>
                    )}
                </Stack>
            ) : (
                <Grid container spacing={2}>
                    {shown.map((d) => (
                        <Grid item xs={12} sm={6} lg={4} xl={3} key={d.id}>
                            <AssistantCard
                                doc={d}
                                modelLabel={shortModel(models.find((m) => m.name === d.settings?.modelName))}
                                onOpen={() => open(d.id)}
                                onDuplicate={() => {
                                    duplicateDoc(d.id)
                                    refresh()
                                }}
                                onDelete={() => remove(d)}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            <CreateDialog
                open={creating}
                onClose={() => setCreating(false)}
                models={models}
                onCreate={(payload) => {
                    const d = createDoc(payload)
                    setCreating(false)
                    open(d.id)
                }}
            />
            <ConfirmDialog />
        </Box>
    )
}

export default AssistantDirectory
