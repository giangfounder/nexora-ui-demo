import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import {
    Autocomplete,
    Box,
    Button,
    ButtonBase,
    Checkbox,
    CircularProgress,
    Dialog,
    Divider,
    IconButton,
    InputAdornment,
    Menu,
    MenuItem,
    OutlinedInput,
    Select,
    Slider,
    Stack,
    Switch,
    Table,
    TableBody,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { AppIcon, iconComponent } from '@/ui-component/icons/AppIcon'

import assistantsApi from '@/api/assistants'
import documentStoreApi from '@/api/documentstore'
import { FormField } from '@/hooks/useDialogShell'
import { SharedTableCell, SharedTableContainer, SharedTableRow } from '@/ui-component/table/SharedTable'
import {
    Eyebrow,
    LabelWithTip,
    MetaText,
    NavItem,
    R_CARD,
    R_CONTROL,
    SectionCard,
    SettingRow,
    cardShadow,
    cardSx,
    inputShadow,
    ToneTag,
    hairlineListSx,
    quietButtonSx,
    segmentItemSx,
    segmentTrackSx,
    stripVi
} from './primitives'
import { TOOL_CATALOG, TOOL_GROUPS, blankToolState, initialToolState, toolMeta } from './catalog'
import { buildRegistry } from './tokens'
import PlaybookSheet, { playbookHealth } from './PlaybookSheet'
import TokenEditor from './TokenEditor'
import ToolSheet from './ToolSheet'
import ChatTestPanel from './ChatTestPanel'

const parseModel = (m) => {
    const paren = m.label.match(/\(([^)]+)\)/)?.[1]
    const head = m.label.replace(/\s*\([^)]*\)/, '').trim()
    // "(Local)" / "(Vietnamese)" are qualifiers, not model names
    const short = paren && !/^(local|vietnamese)$/i.test(paren) ? paren : head
    const provider = m.description?.split('provider: ')[1] || m.label.split(' ')[0]
    return { ...m, short, provider }
}

const storeStats = (s) => ({
    chunks: (s.loaders || []).reduce((n, l) => n + (l.totalChunks || 0), 0),
    chars: (s.loaders || []).reduce((n, l) => n + (l.totalChars || 0), 0)
})

// Dropdown paper shared by the model and store pickers.
const pickerPaperSlot = (theme) => ({
    paper: {
        sx: {
            mt: 0.5,
            borderRadius: R_CARD,
            border: `1px solid ${theme.palette.alpha.border}`,
            boxShadow: theme.customShadows?.md
        }
    }
})

const AssistantWorkspace = () => {
    const theme = useTheme()
    const navigate = useNavigate()
    const { id } = useParams()
    const { enqueueSnackbar } = useSnackbar()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [baseline, setBaseline] = useState(null)
    const [tab, setTab] = useState(0)
    const [menuAnchor, setMenuAnchor] = useState(null)

    const [models, setModels] = useState([])
    const [stores, setStores] = useState([])

    const [name, setName] = useState('')
    const [welcome, setWelcome] = useState('Xin chào {{customer.name}}! Mình là trợ lý của Nexora, bạn cần hỗ trợ gì ạ?')
    const [instruction, setInstruction] = useState('')
    const [modelName, setModelName] = useState('')
    const [params, setParams] = useState({ temperature: 0.7, topP: 0.95, maxTokens: 2048, memory: 10, streaming: true })
    const [retrieval, setRetrieval] = useState({
        topK: 4,
        threshold: 0.6,
        cite: true,
        query: '{{user_message}} — khách quan tâm {{customer.industry}}'
    })
    const [selectedStoreIds, setSelectedStoreIds] = useState(['ds-demo-1', 'ds-demo-2'])
    const [toolState, setToolState] = useState(initialToolState)

    const [promptFull, setPromptFull] = useState(false)
    const [toolFilter, setToolFilter] = useState('all')
    const [toolQuery, setToolQuery] = useState('')
    const [openToolId, setOpenToolId] = useState(null)
    const [playbookOpen, setPlaybookOpen] = useState(false)

    useEffect(() => {
        let alive = true
        ;(async () => {
            try {
                const [mRes, sRes, aRes] = await Promise.all([
                    assistantsApi.getChatModels(),
                    documentStoreApi.getAllDocumentStores({ page: 1, limit: 50 }),
                    id && id !== 'new' ? assistantsApi.getSpecificAssistant(id) : Promise.resolve({ data: null })
                ])
                if (!alive) return
                const ms = (mRes.data || []).map(parseModel)
                setModels(ms)
                setStores(sRes.data?.data || sRes.data || [])
                const details = aRes.data?.details ? JSON.parse(aRes.data.details) : {}
                setName(details.name || 'Trợ lý mới')
                setInstruction(details.instruction || '')
                setModelName(details.chatModel?.name || ms[0]?.name || '')
                // Saved config wins; demo assistants keep their sample setup; a new assistant starts empty.
                const cfg = details.config
                if (cfg) {
                    if (cfg.welcome !== undefined) setWelcome(cfg.welcome)
                    if (cfg.params) setParams((p) => ({ ...p, ...cfg.params }))
                    if (cfg.retrieval) setRetrieval((r) => ({ ...r, ...cfg.retrieval }))
                    if (cfg.selectedStoreIds) setSelectedStoreIds(cfg.selectedStoreIds)
                    if (cfg.toolState) setToolState({ ...initialToolState(), ...cfg.toolState })
                } else if (!String(aRes.data?.id || id).startsWith('as-demo')) {
                    setSelectedStoreIds([])
                    setToolState(blankToolState())
                }
            } finally {
                if (alive) setLoading(false)
            }
        })()
        return () => {
            alive = false
        }
    }, [id])

    const snapshot = useMemo(
        () => JSON.stringify({ name, welcome, instruction, modelName, params, retrieval, selectedStoreIds, toolState }),
        [name, welcome, instruction, modelName, params, retrieval, selectedStoreIds, toolState]
    )
    useEffect(() => {
        if (!loading && baseline === null) setBaseline(snapshot)
    }, [loading, baseline, snapshot])
    const dirty = baseline !== null && snapshot !== baseline

    const model = models.find((m) => m.name === modelName)
    const enabledCount = Object.values(toolState.enabled).filter(Boolean).length
    const varCount = toolState.collectInfo.variables.length

    const NAV_ITEMS = [
        { key: 'setup', label: 'Thiết lập', Icon: iconComponent('Sliders'), tone: 'orange' },
        { key: 'knowledge', label: 'Kiến thức', Icon: iconComponent('Book'), tone: 'emerald', count: selectedStoreIds.length },
        { key: 'tools', label: 'Công cụ', Icon: iconComponent('PuzzlePiece'), tone: 'teal', count: enabledCount }
    ]

    const filteredTools = useMemo(() => {
        const q = stripVi(toolQuery.trim())
        return TOOL_CATALOG.filter((t) => {
            if (toolFilter === 'enabled' && !toolState.enabled[t.id]) return false
            if (toolFilter === 'advanced' && t.group !== 'advanced') return false
            return !q || stripVi(t.label).includes(q)
        })
    }, [toolFilter, toolQuery, toolState.enabled])

    const registry = useMemo(() => buildRegistry({ toolState, stores, selectedStoreIds }), [toolState, stores, selectedStoreIds])
    // Playbooks that need attention are flagged on the trigger (dot + hidden text) without opening the sheet.
    const playbookAlert = useMemo(() => {
        const tones = toolState.playbooks.map((pb) => playbookHealth(pb, { registry, toolState, customer: undefined }).tone)
        const count = tones.filter((t) => t === 'rose' || t === 'amber').length
        return { count, tone: tones.includes('rose') ? 'rose' : count ? 'amber' : undefined }
    }, [toolState, registry])

    const toggleStore = (sid) => setSelectedStoreIds((p) => (p.includes(sid) ? p.filter((x) => x !== sid) : [...p, sid]))
    const toggleTool = (tid) => setToolState((s) => ({ ...s, enabled: { ...s.enabled, [tid]: !s.enabled[tid] } }))

    const save = async () => {
        setSaving(true)
        try {
            await assistantsApi.updateAssistant(id, {
                details: JSON.stringify({
                    name,
                    instruction,
                    chatModel: { name: modelName, label: model?.label },
                    config: { welcome, params, retrieval, selectedStoreIds, toolState }
                }),
                type: 'CUSTOM'
            })
            setBaseline(snapshot)
            enqueueSnackbar('Đã lưu trợ lý', { variant: 'success' })
        } finally {
            setSaving(false)
        }
    }

    const generateInstruction = async () => {
        const res = await assistantsApi.generateAssistantInstruction({ task: name })
        setInstruction(res.data?.instruction || instruction)
    }

    const goParams = () => {
        setMenuAnchor(null)
        setTab(0)
        setTimeout(() => document.getElementById('section-params')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80)
    }

    if (loading) {
        return (
            <Stack alignItems='center' justifyContent='center' sx={{ height: '60vh' }}>
                <CircularProgress size={28} />
            </Stack>
        )
    }

    const selectedStores = stores.filter((s) => selectedStoreIds.includes(s.id))
    const groupCount = {
        all: TOOL_CATALOG.length,
        enabled: enabledCount,
        advanced: TOOL_CATALOG.filter((t) => t.group === 'advanced').length
    }

    return (
        <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
            {/* Breadcrumb */}
            <Stack direction='row' spacing={0.5} alignItems='center' sx={{ mb: 1.5, color: 'text.secondary' }}>
                <Box
                    component='button'
                    type='button'
                    onClick={() => navigate('/assistants/custom')}
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        border: 0,
                        px: 0.75,
                        py: 0.25,
                        ml: -0.75,
                        borderRadius: R_CONTROL,
                        background: 'transparent',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: 'text.secondary',
                        '&:hover': { color: 'text.primary', bgcolor: theme.palette.alpha.hover }
                    }}
                >
                    <AppIcon name='ArrowLeft' size={14} />
                    Trợ lý
                </Box>
                <AppIcon name='CaretRight' size={14} />
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500 }} color='text.primary' noWrap>
                    {name}
                </Typography>
            </Stack>

            {/* Header card */}
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                alignItems={{ md: 'center' }}
                sx={{ ...cardSx(theme), mb: 3, px: { xs: 2, md: 3 }, py: 2.5 }}
            >
                <Box sx={{ position: 'relative', flexShrink: 0, alignSelf: { xs: 'flex-start', md: 'center' } }}>
                    <Box
                        aria-hidden
                        sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            letterSpacing: '0.02em',
                            color: 'primary.main',
                            bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.09),
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
                            boxShadow: inputShadow(theme)
                        }}
                    >
                        <AppIcon name='Robot' size={28} />
                    </Box>
                    <Box
                        aria-hidden
                        sx={{
                            position: 'absolute',
                            right: -3,
                            bottom: -3,
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            bgcolor: dirty ? 'warning.main' : 'success.main',
                            border: `3px solid ${theme.palette.background.paper}`
                        }}
                    />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction='row' alignItems='center' sx={{ flexWrap: 'wrap', columnGap: 1.5, rowGap: 0.5, minWidth: 0 }}>
                        <Typography
                            component='h1'
                            noWrap
                            sx={{
                                fontSize: { xs: '1.375rem', md: '1.625rem' },
                                fontWeight: 700,
                                letterSpacing: '-0.01em',
                                lineHeight: 1.2,
                                minWidth: 0
                            }}
                        >
                            {name || 'Trợ lý mới'}
                        </Typography>
                        <Box
                            component='span'
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.75,
                                height: 24,
                                px: 1.25,
                                borderRadius: '999px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                bgcolor: alpha(dirty ? theme.palette.warning.main : theme.palette.success.main, 0.12),
                                color: dirty ? 'warning.dark' : 'success.dark'
                            }}
                        >
                            <AppIcon name={dirty ? 'PencilSimpleLine' : 'CheckCircle'} size={14} />
                            {dirty ? 'Chưa lưu' : 'Đang hoạt động'}
                        </Box>
                    </Stack>
                    <Stack direction='row' sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
                        {[
                            {
                                key: 'model',
                                Icon: iconComponent('Cpu'),
                                tone: 'orange',
                                text: model?.short || 'Chưa chọn mô hình',
                                go: () => setTab(0)
                            },
                            {
                                key: 'kb',
                                Icon: iconComponent('Book'),
                                tone: 'emerald',
                                n: selectedStoreIds.length,
                                text: 'kho tài liệu',
                                go: () => setTab(1)
                            },
                            {
                                key: 'tools',
                                Icon: iconComponent('PuzzlePiece'),
                                tone: 'teal',
                                n: enabledCount,
                                text: 'công cụ',
                                go: () => setTab(2)
                            },
                            {
                                key: 'pb',
                                Icon: iconComponent('Signpost'),
                                tone: 'amber',
                                n: toolState.playbooks.length,
                                text: 'kịch bản',
                                go: () => setPlaybookOpen(true)
                            },
                            {
                                key: 'vars',
                                Icon: iconComponent('BracketsSquare'),
                                tone: 'amber',
                                n: varCount,
                                text: 'biến thu thập',
                                go: () => setOpenToolId('collectInfo')
                            }
                        ].map((st) => (
                            <ButtonBase
                                key={st.key}
                                onClick={st.go}
                                aria-label={st.n !== undefined ? `${st.n} ${st.text}` : st.text}
                                sx={{
                                    gap: 0.75,
                                    height: 30,
                                    pl: 1,
                                    pr: 1.25,
                                    borderRadius: '999px',
                                    border: `1px solid ${theme.palette.alpha.border}`,
                                    bgcolor: 'background.paper',
                                    boxShadow: inputShadow(theme),
                                    fontSize: '0.8125rem',
                                    color: 'text.secondary',
                                    transition: 'border-color 120ms ease-out, box-shadow 120ms ease-out, color 120ms ease-out',
                                    '&:hover': {
                                        borderColor: alpha(theme.palette.primary.main, 0.45),
                                        color: 'text.primary',
                                        boxShadow: cardShadow(theme, 1)
                                    },
                                    '&.Mui-focusVisible': { boxShadow: theme.customShadows?.focusRing }
                                }}
                            >
                                <Box
                                    component='span'
                                    sx={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: '50%',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: alpha(theme.palette.spectrum?.[st.tone]?.main || theme.palette.primary.main, 0.14),
                                        color: theme.palette.spectrum?.[st.tone]?.dark || 'primary.main'
                                    }}
                                >
                                    <st.Icon size={12} stroke={1.75} />
                                </Box>
                                {st.n !== undefined && (
                                    <Box
                                        component='span'
                                        sx={{ fontWeight: 700, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}
                                    >
                                        {st.n}
                                    </Box>
                                )}
                                <Box
                                    component='span'
                                    sx={{
                                        fontWeight: st.n === undefined ? 600 : 500,
                                        color: st.n === undefined ? 'text.primary' : 'inherit'
                                    }}
                                >
                                    {st.text}
                                </Box>
                            </ButtonBase>
                        ))}
                    </Stack>
                </Box>
                <Stack direction='row' spacing={1} alignItems='center' sx={{ flexShrink: 0 }}>
                    <Button
                        variant='contained'
                        size='medium'
                        onClick={save}
                        disabled={saving || !dirty}
                        startIcon={saving ? <CircularProgress size={14} color='inherit' /> : <AppIcon name='FloppyDisk' size={16} />}
                        sx={{
                            minWidth: 120,
                            height: 40,
                            px: 2.5,
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            boxShadow: `0 1px 2px ${alpha(theme.palette.primary.main, 0.3)}, 0 8px 20px -6px ${alpha(
                                theme.palette.primary.main,
                                0.5
                            )}`,
                            '&:hover': {
                                boxShadow: `0 2px 4px ${alpha(theme.palette.primary.main, 0.35)}, 0 12px 26px -6px ${alpha(
                                    theme.palette.primary.main,
                                    0.55
                                )}`,
                                transform: 'translateY(-1px)'
                            },
                            '&:active': { transform: 'translateY(0)' },
                            '&.Mui-disabled': {
                                boxShadow: 'none',
                                bgcolor: alpha(theme.palette.text.primary, 0.08),
                                color: 'text.disabled'
                            },
                            transition: 'transform 120ms ease-out, box-shadow 120ms ease-out, background-color 120ms ease-out'
                        }}
                    >
                        {dirty ? 'Lưu thay đổi' : 'Đã lưu'}
                    </Button>
                    <Button
                        variant='outlined'
                        size='medium'
                        aria-label='Hành động khác'
                        aria-haspopup='menu'
                        onClick={(e) => setMenuAnchor(e.currentTarget)}
                        startIcon={<AppIcon name='DotsThreeVertical' size={16} />}
                        sx={{
                            height: 40,
                            px: 2,
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: 'text.primary',
                            borderColor: theme.palette.alpha.borderStrong,
                            bgcolor: 'background.paper',
                            boxShadow: inputShadow(theme),
                            '&:hover': { bgcolor: theme.palette.alpha.hover, borderColor: 'text.primary', boxShadow: cardShadow(theme, 1) }
                        }}
                    >
                        Thêm
                    </Button>
                    <Menu
                        anchorEl={menuAnchor}
                        open={Boolean(menuAnchor)}
                        onClose={() => setMenuAnchor(null)}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        PaperProps={{ sx: { minWidth: 220, mt: 1 } }}
                    >
                        <MenuItem
                            onClick={() => {
                                setMenuAnchor(null)
                                navigate('/assistants/custom')
                            }}
                            sx={{ fontSize: '0.875rem' }}
                        >
                            Thêm trợ lý
                        </MenuItem>
                        <MenuItem onClick={goParams} sx={{ fontSize: '0.875rem' }}>
                            Tham số mô hình
                        </MenuItem>
                        {['Lịch sử tin nhắn', 'Khách hàng tiềm năng', 'Phân tích', 'Nhân bản'].map((label) => (
                            <MenuItem key={label} onClick={() => setMenuAnchor(null)} sx={{ fontSize: '0.875rem' }}>
                                {label}
                            </MenuItem>
                        ))}
                        <Divider />
                        <MenuItem onClick={() => setMenuAnchor(null)} sx={{ fontSize: '0.875rem', color: 'error.main' }}>
                            Xoá trợ lý
                        </MenuItem>
                    </Menu>
                </Stack>
            </Stack>

            {/* Sidebar nav + content + chat panel */}
            <Box
                sx={{
                    display: { xs: 'flex', lg: 'grid' },
                    flexDirection: { xs: 'column', lg: 'initial' },
                    gridTemplateColumns: { lg: '220px minmax(0, 1fr) minmax(0, 480px)' },
                    gap: 3,
                    alignItems: 'start'
                }}
            >
                {/* Sidebar nav */}
                <Box
                    role='tablist'
                    aria-label='Mục cấu hình trợ lý'
                    sx={{
                        position: { lg: 'sticky' },
                        top: { lg: 88 },
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        p: 1,
                        bgcolor: 'background.paper',
                        border: `1px solid ${theme.palette.alpha.border}`,
                        borderRadius: R_CARD,
                        boxShadow: cardShadow(theme, 1)
                    }}
                >
                    {NAV_ITEMS.map((it, i) => (
                        <NavItem
                            key={it.key}
                            icon={it.Icon}
                            label={it.label}
                            tone={it.tone}
                            count={it.count}
                            selected={tab === i}
                            onClick={() => setTab(i)}
                            ariaControls={`ws-tabpanel-${i}`}
                        />
                    ))}
                    <Box sx={{ mt: 1, pt: 1, borderTop: `1px solid ${theme.palette.alpha.divider}` }}>
                        <NavItem
                            icon={iconComponent('Signpost')}
                            label='Kịch bản'
                            tone='amber'
                            count={toolState.playbooks.length}
                            selected={false}
                            onClick={() => setPlaybookOpen(true)}
                            ariaLabel={playbookAlert.count ? `Mở kịch bản xử lý, ${playbookAlert.count} cần xem lại` : 'Mở kịch bản xử lý'}
                            endIcon={
                                playbookAlert.count > 0 ? (
                                    <AppIcon
                                        name={playbookAlert.tone === 'rose' ? 'WarningOctagon' : 'WarningCircle'}
                                        size={16}
                                        color={playbookAlert.tone === 'rose' ? theme.palette.error.main : theme.palette.warning.main}
                                    />
                                ) : null
                            }
                        />
                    </Box>
                </Box>

                {/* ===== Middle: configuration ===== */}
                <Box sx={{ minWidth: 0 }}>
                    <Stack spacing={3}>
                        {/* ---------- Tab: Thiết lập ---------- */}
                        {tab === 0 && (
                            <Stack spacing={3} role='tabpanel' id='ws-tabpanel-0' aria-labelledby='ws-tab-0'>
                                <SectionCard title='Danh tính' icon={iconComponent('User')} tone='orange'>
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gap: 3,
                                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }
                                        }}
                                    >
                                        <FormField label='Tên trợ lý' required htmlFor='ws-name'>
                                            <TextField
                                                id='ws-name'
                                                size='small'
                                                fullWidth
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </FormField>
                                        <FormField label='Mô hình' htmlFor='ws-model'>
                                            <Autocomplete
                                                id='ws-model'
                                                size='small'
                                                disableClearable
                                                options={models}
                                                value={model || null}
                                                groupBy={(o) => o.provider}
                                                getOptionLabel={(o) => o.short}
                                                isOptionEqualToValue={(o, v) => o.name === v.name}
                                                onChange={(_, v) => v && setModelName(v.name)}
                                                renderGroup={(p) => (
                                                    <Box component='li' key={p.key} sx={{ listStyle: 'none' }}>
                                                        <Eyebrow component='div' sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
                                                            {p.group}
                                                        </Eyebrow>
                                                        <Box component='ul' sx={{ p: 0, m: 0 }}>
                                                            {p.children}
                                                        </Box>
                                                    </Box>
                                                )}
                                                renderOption={(props, o, { selected }) => (
                                                    <Box component='li' {...props} key={o.name}>
                                                        <Typography variant='body2' noWrap sx={{ fontWeight: selected ? 600 : 400 }}>
                                                            {o.short}
                                                        </Typography>
                                                    </Box>
                                                )}
                                                slotProps={pickerPaperSlot(theme)}
                                                renderInput={(p) => (
                                                    <TextField
                                                        {...p}
                                                        placeholder='Chọn model'
                                                        inputProps={{ ...p.inputProps, 'aria-label': 'Mô hình' }}
                                                    />
                                                )}
                                            />
                                        </FormField>
                                        <FormField label='Lời chào' sx={{ gridColumn: '1 / -1' }}>
                                            <TokenEditor
                                                value={welcome}
                                                onChange={setWelcome}
                                                registry={registry}
                                                minRows={1}
                                                maxRows={4}
                                                groups={['customer', 'system']}
                                                ariaLabel='Lời chào'
                                            />
                                        </FormField>
                                    </Box>
                                </SectionCard>

                                <SectionCard
                                    title='Hướng dẫn'
                                    icon={iconComponent('Article')}
                                    tone='amber'
                                    action={
                                        <>
                                            <Typography
                                                variant='caption'
                                                sx={{ color: 'text.disabled', fontVariantNumeric: 'tabular-nums', mr: 0.5 }}
                                            >
                                                {instruction.length.toLocaleString('vi-VN')} ký tự
                                            </Typography>
                                            <Tooltip title='Viết hướng dẫn bằng AI từ tên trợ lý'>
                                                <Button size='small' onClick={generateInstruction} sx={quietButtonSx(theme)}>
                                                    Viết
                                                </Button>
                                            </Tooltip>
                                            <Tooltip title='Mở toàn màn hình'>
                                                <IconButton
                                                    size='small'
                                                    aria-label='Mở toàn màn hình'
                                                    onClick={() => setPromptFull(true)}
                                                    sx={{ width: 26, height: 26, borderRadius: R_CONTROL, color: 'text.secondary' }}
                                                >
                                                    <AppIcon name='ArrowsOut' size={14} />
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                    }
                                >
                                    <TokenEditor
                                        value={instruction}
                                        onChange={setInstruction}
                                        registry={registry}
                                        minRows={7}
                                        maxRows={16}
                                        ariaLabel='Hướng dẫn'
                                        placeholder='Vai trò, giọng điệu, giới hạn của trợ lý… vd: xưng hô với khách bằng {{customer.name}}'
                                    />
                                </SectionCard>

                                <SectionCard title='Tham số' id='section-params' icon={iconComponent('Brain')} tone='teal'>
                                    <Box sx={hairlineListSx(theme)}>
                                        <SettingRow label='Temperature' labelId='p-temp' value={params.temperature.toFixed(1)}>
                                            <Slider
                                                size='small'
                                                aria-labelledby='p-temp'
                                                value={params.temperature}
                                                min={0}
                                                max={2}
                                                step={0.1}
                                                onChange={(_, v) => setParams((p) => ({ ...p, temperature: v }))}
                                                sx={{ maxWidth: 360, mx: 1 }}
                                            />
                                        </SettingRow>
                                        <SettingRow label='Top-P' labelId='p-topp' value={params.topP.toFixed(2)}>
                                            <Slider
                                                size='small'
                                                aria-labelledby='p-topp'
                                                value={params.topP}
                                                min={0}
                                                max={1}
                                                step={0.05}
                                                onChange={(_, v) => setParams((p) => ({ ...p, topP: v }))}
                                                sx={{ maxWidth: 360, mx: 1 }}
                                            />
                                        </SettingRow>
                                        <SettingRow label='Max tokens' labelId='p-max' value={params.maxTokens.toLocaleString('vi-VN')}>
                                            <Slider
                                                size='small'
                                                aria-labelledby='p-max'
                                                value={params.maxTokens}
                                                min={256}
                                                max={8192}
                                                step={256}
                                                onChange={(_, v) => setParams((p) => ({ ...p, maxTokens: v }))}
                                                sx={{ maxWidth: 360, mx: 1 }}
                                            />
                                        </SettingRow>
                                        <SettingRow label='Nhớ hội thoại' labelId='p-mem' align='end'>
                                            <Select
                                                size='small'
                                                labelId='p-mem'
                                                value={params.memory}
                                                onChange={(e) => setParams((p) => ({ ...p, memory: e.target.value }))}
                                                sx={{ minWidth: 200 }}
                                            >
                                                {[0, 5, 10, 20, 50].map((n) => (
                                                    <MenuItem key={n} value={n}>
                                                        {n === 0 ? 'Không nhớ' : `${n} tin nhắn gần nhất`}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </SettingRow>
                                        <SettingRow label='Phản hồi dạng stream' labelId='p-stream' align='end'>
                                            <Switch
                                                size='small'
                                                checked={params.streaming}
                                                onChange={(e) => setParams((p) => ({ ...p, streaming: e.target.checked }))}
                                                inputProps={{ 'aria-labelledby': 'p-stream' }}
                                            />
                                        </SettingRow>
                                    </Box>
                                </SectionCard>
                            </Stack>
                        )}

                        {/* ---------- Tab: Kiến thức ---------- */}
                        {tab === 1 && (
                            <Stack spacing={3} role='tabpanel' id='ws-tabpanel-1' aria-labelledby='ws-tab-1'>
                                <SectionCard
                                    title='Kho tài liệu'
                                    icon={iconComponent('Book')}
                                    tone='emerald'
                                    action={
                                        <Tooltip title='Tạo kho tài liệu mới'>
                                            <Button
                                                size='small'
                                                startIcon={<AppIcon name='Plus' size={14} />}
                                                onClick={() => navigate('/document-stores')}
                                                sx={quietButtonSx(theme)}
                                            >
                                                Tạo
                                            </Button>
                                        </Tooltip>
                                    }
                                >
                                    <Autocomplete
                                        multiple
                                        size='small'
                                        disableCloseOnSelect
                                        // The clear button would silently detach every store.
                                        disableClearable
                                        options={stores}
                                        value={selectedStores}
                                        getOptionLabel={(o) => o.name}
                                        isOptionEqualToValue={(o, v) => o.id === v.id}
                                        onChange={(_, v) => setSelectedStoreIds(v.map((x) => x.id))}
                                        filterOptions={(opts, { inputValue }) => {
                                            const q = stripVi(inputValue.trim())
                                            return q ? opts.filter((o) => stripVi(`${o.name} ${o.description}`).includes(q)) : opts
                                        }}
                                        // Tags are hidden (the list below shows the selection), so Backspace must not remove one.
                                        renderTags={() => null}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace' && !e.target.value) e.defaultMuiPrevented = true
                                        }}
                                        renderOption={(props, o, { selected }) => (
                                            <Box component='li' {...props} key={o.id} sx={{ gap: 1.5 }}>
                                                <Checkbox size='small' checked={selected} sx={{ p: 0 }} />
                                                <Typography variant='body2' noWrap sx={{ flex: 1, minWidth: 0, fontWeight: 500 }}>
                                                    {o.name}
                                                </Typography>
                                                <Typography
                                                    variant='caption'
                                                    color='text.secondary'
                                                    sx={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
                                                >
                                                    {storeStats(o).chunks} chunk
                                                </Typography>
                                            </Box>
                                        )}
                                        slotProps={pickerPaperSlot(theme)}
                                        renderInput={(p) => (
                                            <TextField
                                                {...p}
                                                placeholder='Tìm và gắn kho tài liệu'
                                                inputProps={{ ...p.inputProps, 'aria-label': 'Gắn kho tài liệu' }}
                                                InputProps={{
                                                    ...p.InputProps,
                                                    startAdornment: (
                                                        <InputAdornment position='start' sx={{ color: 'text.secondary', ml: 0.5 }}>
                                                            <AppIcon name='MagnifyingGlass' size={16} />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        )}
                                    />

                                    {selectedStores.length === 0 ? (
                                        <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
                                            Chưa gắn kho tài liệu nào.
                                        </Typography>
                                    ) : (
                                        <Box sx={{ mt: 1.5, ...hairlineListSx(theme) }}>
                                            {selectedStores.map((s) => {
                                                const st = storeStats(s)
                                                return (
                                                    <Stack key={s.id} direction='row' spacing={1.5} alignItems='center' sx={{ py: 1.5 }}>
                                                        <Box sx={{ display: 'inline-flex', color: 'text.secondary', flexShrink: 0 }}>
                                                            <AppIcon name='Book' size={18} />
                                                        </Box>
                                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                                            <Stack direction='row' spacing={1} alignItems='center' sx={{ minWidth: 0 }}>
                                                                <Typography
                                                                    noWrap
                                                                    sx={{ fontSize: '0.875rem', fontWeight: 500, minWidth: 0 }}
                                                                >
                                                                    {s.name}
                                                                </Typography>
                                                                {s.status !== 'SYNC' && <ToneTag tone='amber'>Chưa đồng bộ</ToneTag>}
                                                            </Stack>
                                                            <MetaText
                                                                items={[
                                                                    `${st.chunks} chunk`,
                                                                    `${st.chars.toLocaleString('vi-VN')} ký tự`,
                                                                    s.vectorStoreConfig?.name
                                                                ]}
                                                            />
                                                        </Box>
                                                        <Tooltip title='Gỡ khỏi trợ lý'>
                                                            <IconButton
                                                                size='small'
                                                                aria-label={`Gỡ ${s.name}`}
                                                                onClick={() => toggleStore(s.id)}
                                                                sx={{
                                                                    width: 32,
                                                                    height: 32,
                                                                    borderRadius: R_CONTROL,
                                                                    color: 'text.secondary'
                                                                }}
                                                            >
                                                                <AppIcon name='X' size={16} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                )
                                            })}
                                        </Box>
                                    )}
                                </SectionCard>

                                <SectionCard title='Truy xuất' icon={iconComponent('FileText')} tone='teal'>
                                    <FormField
                                        label={
                                            <LabelWithTip
                                                text='Ngữ cảnh truy vấn'
                                                tip='Bổ sung thuộc tính khách vào câu tìm kiếm để kết quả sát nhu cầu hơn.'
                                            />
                                        }
                                    >
                                        <TokenEditor
                                            value={retrieval.query}
                                            onChange={(q) => setRetrieval((r) => ({ ...r, query: q }))}
                                            registry={registry}
                                            minRows={1}
                                            maxRows={3}
                                            groups={['customer', 'collect', 'output', 'system']}
                                            ariaLabel='Ngữ cảnh truy vấn'
                                        />
                                    </FormField>
                                    <Box sx={{ mt: 2, ...hairlineListSx(theme) }}>
                                        <SettingRow label='Số đoạn lấy về' labelId='r-topk' value={retrieval.topK}>
                                            <Slider
                                                size='small'
                                                marks
                                                aria-labelledby='r-topk'
                                                min={1}
                                                max={10}
                                                step={1}
                                                value={retrieval.topK}
                                                onChange={(_, v) => setRetrieval((r) => ({ ...r, topK: v }))}
                                                sx={{ maxWidth: 360, mx: 1 }}
                                            />
                                        </SettingRow>
                                        <SettingRow label='Ngưỡng tương đồng' labelId='r-thr' value={retrieval.threshold.toFixed(2)}>
                                            <Slider
                                                size='small'
                                                aria-labelledby='r-thr'
                                                min={0}
                                                max={1}
                                                step={0.05}
                                                value={retrieval.threshold}
                                                onChange={(_, v) => setRetrieval((r) => ({ ...r, threshold: v }))}
                                                sx={{ maxWidth: 360, mx: 1 }}
                                            />
                                        </SettingRow>
                                        <SettingRow label='Kèm trích dẫn' labelId='r-cite' align='end'>
                                            <Switch
                                                size='small'
                                                checked={retrieval.cite}
                                                onChange={(e) => setRetrieval((r) => ({ ...r, cite: e.target.checked }))}
                                                inputProps={{ 'aria-labelledby': 'r-cite' }}
                                            />
                                        </SettingRow>
                                    </Box>
                                </SectionCard>
                            </Stack>
                        )}

                        {/* ---------- Tab: Công cụ ---------- */}
                        {tab === 2 && (
                            <Stack spacing={3} role='tabpanel' id='ws-tabpanel-2' aria-labelledby='ws-tab-2'>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                                    <Stack
                                        direction='row'
                                        role='tablist'
                                        aria-label='Lọc công cụ'
                                        sx={{ ...segmentTrackSx(theme), alignSelf: 'flex-start' }}
                                    >
                                        {TOOL_GROUPS.map((g) => {
                                            const active = toolFilter === g.id
                                            const n = groupCount[g.id]
                                            return (
                                                <ButtonBase
                                                    key={g.id}
                                                    role='tab'
                                                    aria-selected={active}
                                                    onClick={() => setToolFilter(g.id)}
                                                    sx={segmentItemSx(theme, active)}
                                                >
                                                    {g.label}
                                                    {g.id !== 'all' && n > 0 && (
                                                        <Box
                                                            component='span'
                                                            sx={{
                                                                fontVariantNumeric: 'tabular-nums',
                                                                color: 'text.disabled',
                                                                fontWeight: 600
                                                            }}
                                                        >
                                                            {n}
                                                        </Box>
                                                    )}
                                                </ButtonBase>
                                            )
                                        })}
                                    </Stack>
                                    <Box sx={{ flex: 1 }} />
                                    <OutlinedInput
                                        size='small'
                                        value={toolQuery}
                                        onChange={(e) => setToolQuery(e.target.value)}
                                        placeholder='Tìm công cụ'
                                        inputProps={{ 'aria-label': 'Tìm công cụ' }}
                                        startAdornment={
                                            <InputAdornment position='start' sx={{ color: 'text.secondary' }}>
                                                <AppIcon name='MagnifyingGlass' size={16} />
                                            </InputAdornment>
                                        }
                                        sx={{ width: { xs: '100%', sm: 240 }, height: 36, '& input': { fontSize: '0.875rem' } }}
                                    />
                                </Stack>

                                {filteredTools.length === 0 ? (
                                    <Stack alignItems='center' spacing={1} sx={{ py: 8, color: 'text.disabled' }}>
                                        <AppIcon name='PuzzlePiece' size={28} />
                                        <Typography variant='body2'>Không có công cụ phù hợp</Typography>
                                    </Stack>
                                ) : (
                                    <SharedTableContainer sx={{ borderRadius: R_CARD, boxShadow: cardShadow(theme, 1) }}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <SharedTableCell>Công cụ</SharedTableCell>
                                                    <SharedTableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                                        Cấu hình
                                                    </SharedTableCell>
                                                    <SharedTableCell align='right'>Bật</SharedTableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {filteredTools.map((t) => {
                                                    const on = !!toolState.enabled[t.id]
                                                    const meta = toolMeta(t.id, toolState)
                                                    const warn = meta.filter((p) => p.tone === 'amber' || p.tone === 'rose')
                                                    const plain = meta.filter((p) => !warn.includes(p))
                                                    return (
                                                        <SharedTableRow
                                                            key={t.id}
                                                            interactive
                                                            hover
                                                            tabIndex={0}
                                                            aria-label={`Cấu hình ${t.label}`}
                                                            onClick={() => setOpenToolId(t.id)}
                                                            onKeyDown={(e) => e.key === 'Enter' && setOpenToolId(t.id)}
                                                        >
                                                            <SharedTableCell>
                                                                <Stack direction='row' spacing={1.5} alignItems='center'>
                                                                    <Box
                                                                        sx={{
                                                                            display: 'inline-flex',
                                                                            flexShrink: 0,
                                                                            color: on ? 'text.secondary' : 'text.disabled'
                                                                        }}
                                                                    >
                                                                        <t.Icon size={18} stroke={1.75} />
                                                                    </Box>
                                                                    <Typography
                                                                        variant='body2'
                                                                        noWrap
                                                                        sx={{
                                                                            fontWeight: 500,
                                                                            color: on ? 'text.primary' : 'text.secondary'
                                                                        }}
                                                                    >
                                                                        {t.label}
                                                                    </Typography>
                                                                </Stack>
                                                            </SharedTableCell>
                                                            <SharedTableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                                                <Stack direction='row' spacing={1} alignItems='center' sx={{ minWidth: 0 }}>
                                                                    <Typography
                                                                        noWrap
                                                                        sx={{ fontSize: '0.8125rem', color: 'text.secondary', minWidth: 0 }}
                                                                    >
                                                                        {plain.map((p) => p.text).join(' · ')}
                                                                    </Typography>
                                                                    {warn.map((p) => (
                                                                        <ToneTag key={p.text} tone={p.tone}>
                                                                            {p.text}
                                                                        </ToneTag>
                                                                    ))}
                                                                </Stack>
                                                            </SharedTableCell>
                                                            <SharedTableCell
                                                                align='right'
                                                                sx={{ width: 72 }}
                                                                onClick={(e) => e.stopPropagation()}
                                                                onKeyDown={(e) => e.stopPropagation()}
                                                            >
                                                                <Switch
                                                                    size='small'
                                                                    checked={on}
                                                                    onChange={() => toggleTool(t.id)}
                                                                    inputProps={{ 'aria-label': `Bật ${t.label}` }}
                                                                />
                                                            </SharedTableCell>
                                                        </SharedTableRow>
                                                    )
                                                })}
                                            </TableBody>
                                        </Table>
                                    </SharedTableContainer>
                                )}
                            </Stack>
                        )}
                    </Stack>
                </Box>

                {/* ===== Right: live test ===== */}
                <Box sx={{ position: { lg: 'sticky' }, top: { lg: 88 }, minWidth: 0 }}>
                    <ChatTestPanel
                        assistantName={name}
                        welcome={welcome}
                        modelLabel={model?.short || '—'}
                        stores={stores}
                        selectedStoreIds={selectedStoreIds}
                        toolState={toolState}
                        registry={registry}
                        retrievalQuery={retrieval.query}
                    />
                </Box>
            </Box>

            <Dialog
                fullScreen
                open={promptFull}
                onClose={() => setPromptFull(false)}
                PaperProps={{ sx: { bgcolor: 'background.default' } }}
            >
                <Stack
                    direction='row'
                    alignItems='center'
                    spacing={1}
                    sx={{ px: 3, py: 2, bgcolor: 'background.paper', borderBottom: `1px solid ${theme.palette.alpha.border}` }}
                >
                    <Typography noWrap sx={{ flex: 1, minWidth: 0, fontSize: '1.125rem', fontWeight: 600 }}>
                        Hướng dẫn · {name}
                    </Typography>
                    <Typography variant='caption' sx={{ color: 'text.disabled', fontVariantNumeric: 'tabular-nums' }}>
                        {instruction.length.toLocaleString('vi-VN')} ký tự
                    </Typography>
                    <Tooltip title='Viết hướng dẫn bằng AI từ tên trợ lý'>
                        <Button size='small' onClick={generateInstruction} sx={quietButtonSx(theme)}>
                            Viết
                        </Button>
                    </Tooltip>
                    <Tooltip title='Thu nhỏ'>
                        <IconButton
                            aria-label='Thu nhỏ'
                            onClick={() => setPromptFull(false)}
                            sx={{ width: 36, height: 36, borderRadius: R_CARD, color: 'text.secondary' }}
                        >
                            <AppIcon name='ArrowsIn' size={18} />
                        </IconButton>
                    </Tooltip>
                </Stack>
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        maxWidth: 960,
                        mx: 'auto',
                        px: 3,
                        py: 3,
                        gap: 2,
                        minHeight: 0
                    }}
                >
                    <TokenEditor
                        value={instruction}
                        onChange={setInstruction}
                        registry={registry}
                        fill
                        // eslint-disable-next-line jsx-a11y/no-autofocus -- intentional: focus the first field when the dialog/panel opens
                        autoFocus
                        ariaLabel='Hướng dẫn toàn màn hình'
                    />
                </Box>
            </Dialog>

            <PlaybookSheet
                open={playbookOpen}
                onClose={() => setPlaybookOpen(false)}
                toolState={toolState}
                setToolState={setToolState}
                registry={registry}
            />

            {openToolId && (
                <ToolSheet
                    tool={TOOL_CATALOG.find((t) => t.id === openToolId)}
                    toolState={toolState}
                    setToolState={setToolState}
                    onClose={() => setOpenToolId(null)}
                />
            )}
        </Box>
    )
}

export default AssistantWorkspace
