import PropTypes from 'prop-types'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
    Box,
    Button,
    Chip,
    Collapse,
    Dialog,
    Drawer,
    FormControlLabel,
    IconButton,
    MenuItem,
    Select,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { AppIcon, iconComponent } from '@/ui-component/icons/AppIcon'

import { useSheetShell } from '@/hooks/useDialogShell'
import { AttentionStrip, Eyebrow, R_CARD, R_CONTROL, ToneTag, cardSx, closeButtonSx, hairlineListSx } from './primitives'
import { ON_ERROR, newPlaybook } from './catalog'
import { compilePlaybook } from './planner'
import TokenEditor, { TokenChip, VariablePalette } from './TokenEditor'

// ---------------------------------------------------------------------------
// Read-back: one row per compiled step → [number] [action label] [what, as chips]
// ---------------------------------------------------------------------------

const STEP_META = {
    profile: { label: 'Lấy từ hồ sơ', Icon: iconComponent('User') },
    ask: { label: 'Hỏi khách', Icon: iconComponent('ChatText') },
    call: { label: 'Gọi API', Icon: iconComponent('PlugsConnected') },
    search: { label: 'Tìm tài liệu', Icon: iconComponent('Book') },
    reply: { label: 'Trả lời', Icon: iconComponent('ArrowBendUpLeft') }
}

const Muted = ({ children }) => (
    <Box component='span' sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
        {children}
    </Box>
)
Muted.propTypes = { children: PropTypes.node }

const StepContent = ({ step, registry }) => {
    const chip = (n) => <TokenChip key={n} name={n} registry={registry} size='sm' />
    if (!step) return <Muted>Trả lời khách bằng thông tin đã có</Muted>
    if (step.kind === 'profile')
        return (
            <>
                {chip(step.attr)}
                {step.orAsk && (
                    <>
                        <Muted>chưa định danh thì hỏi</Muted>
                        {chip(step.orAsk.name)}
                    </>
                )}
            </>
        )
    if (step.kind === 'ask')
        return (
            <>
                {chip(step.var.name)}
                {step.forApi && (
                    <>
                        <Muted>để gọi</Muted>
                        {chip(`api.${step.forApi.key}`)}
                    </>
                )}
                {!step.var.required && <Muted>(tuỳ chọn)</Muted>}
            </>
        )
    if (step.kind === 'call')
        return (
            <>
                {chip(`api.${step.api.key}`)}
                {step.outputs.length > 0 && (
                    <>
                        <AppIcon name='ArrowRight' size={14} style={{ opacity: 0.5, flexShrink: 0 }} />
                        <Muted>nhận</Muted>
                        {step.outputs.map((o) => chip(o))}
                    </>
                )}
            </>
        )
    return chip(step.token)
}
StepContent.propTypes = { step: PropTypes.object, registry: PropTypes.object }

const stepKind = (s) => (!s ? 'reply' : STEP_META[s.kind] ? s.kind : 'search')

const WHEN_PLACEHOLDER = 'vd: khách hỏi tình trạng đơn hàng, giao hàng hoặc mã đơn'
const SCRIPT_PLACEHOLDER =
    'Viết như hướng dẫn cho nhân viên: hỏi số điện thoại, gọi API tra cứu, tìm trong kho tài liệu… Bấm biến ở bảng bên phải để chèn.'

// Settings row for a safety rule: label on the left, switch on the right.
const ruleRowSx = {
    display: 'flex',
    m: 0,
    py: 1.5,
    width: '100%',
    justifyContent: 'space-between',
    gap: 2,
    '& .MuiFormControlLabel-label': { fontSize: '0.875rem', fontWeight: 500 }
}

// Field label: icon + label (secondary, so the value in the box reads first) + optional full-screen button.
const FieldHead = ({ icon: Icon, label, htmlFor, onExpand }) => (
    <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 1, minHeight: 26 }}>
        {Icon && <Icon size={15} stroke={1.75} style={{ flexShrink: 0, opacity: 0.6 }} />}
        <Typography
            component='label'
            htmlFor={htmlFor}
            sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', lineHeight: 1.4 }}
        >
            {label}
        </Typography>
        <Box sx={{ flex: 1 }} />
        {onExpand && (
            <Tooltip title='Mở toàn màn hình'>
                <IconButton
                    size='small'
                    aria-label={`Mở toàn màn hình: ${label}`}
                    onClick={onExpand}
                    sx={{ width: 26, height: 26, color: 'text.secondary' }}
                >
                    <AppIcon name='ArrowsOut' size={14} />
                </IconButton>
            </Tooltip>
        )}
    </Stack>
)
FieldHead.propTypes = { icon: PropTypes.elementType, label: PropTypes.string, htmlFor: PropTypes.string, onExpand: PropTypes.func }

// "Agent hiểu như sau" — numbered steps, each with an explicit action label and its variables.
const Readback = ({ steps, issues, registry, sx }) => {
    const theme = useTheme()
    const rows = steps.length ? [...steps, null] : []
    return (
        <Box sx={{ ...cardSx(theme), ...sx }}>
            <Stack
                direction='row'
                alignItems='center'
                spacing={1}
                sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.alpha.divider}` }}
            >
                <AppIcon name='ListBullets' size={16} style={{ opacity: 0.6 }} />
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700 }}>Agent hiểu như sau</Typography>
                <Box sx={{ flex: 1 }} />
                {rows.length > 0 && (
                    <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                        {rows.length} bước
                    </Typography>
                )}
            </Stack>
            {issues.length > 0 && (
                <Stack spacing={0.5} sx={{ px: 2, pt: 1.5 }}>
                    {issues.map((it, i) => (
                        <AttentionStrip key={i} tone={it.tone === 'rose' ? 'rose' : 'amber'}>
                            {it.text}
                        </AttentionStrip>
                    ))}
                </Stack>
            )}
            {rows.length === 0 ? (
                <Typography sx={{ px: 2, py: 2, fontSize: '0.8125rem', color: 'text.secondary' }}>
                    Chèn biến khách hàng, API hoặc kho tài liệu vào phần cách xử lý để tạo các bước.
                </Typography>
            ) : (
                <Box component='ol' sx={{ m: 0, px: 2, py: 1, listStyle: 'none' }}>
                    {rows.map((s, i) => {
                        const k = stepKind(s)
                        const { label, Icon } = STEP_META[k]
                        return (
                            <Box
                                key={i}
                                component='li'
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: '22px 128px minmax(0, 1fr)',
                                    columnGap: 1.5,
                                    alignItems: 'start',
                                    py: 1,
                                    borderTop: i ? `1px solid ${theme.palette.alpha.divider}` : 'none'
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.6875rem',
                                        fontWeight: 700,
                                        fontVariantNumeric: 'tabular-nums',
                                        bgcolor:
                                            k === 'reply'
                                                ? alpha(theme.palette.success.main, 0.14)
                                                : alpha(theme.palette.primary.main, 0.1),
                                        color: k === 'reply' ? 'success.dark' : 'primary.main'
                                    }}
                                >
                                    {i + 1}
                                </Box>
                                <Stack direction='row' alignItems='center' spacing={0.75} sx={{ minHeight: 22 }}>
                                    <Icon size={14} stroke={1.75} style={{ flexShrink: 0, opacity: 0.55 }} />
                                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.3 }}>
                                        {label}
                                    </Typography>
                                </Stack>
                                <Stack direction='row' alignItems='center' sx={{ flexWrap: 'wrap', gap: 0.75, minHeight: 22, minWidth: 0 }}>
                                    {s?.conditional && (
                                        <Box
                                            component='span'
                                            sx={{
                                                fontSize: '0.6875rem',
                                                fontWeight: 600,
                                                px: 0.75,
                                                height: 20,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                borderRadius: R_CONTROL,
                                                border: `1px dashed ${theme.palette.alpha.borderStrong}`,
                                                color: 'text.secondary'
                                            }}
                                        >
                                            Khi cần
                                        </Box>
                                    )}
                                    <StepContent step={s} registry={registry} />
                                </Stack>
                            </Box>
                        )
                    })}
                </Box>
            )}
        </Box>
    )
}
Readback.propTypes = { steps: PropTypes.array, issues: PropTypes.array, registry: PropTypes.object, sx: PropTypes.object }

// Full-screen editor for one playbook: trigger + script on the left, variables + read-back on the right.
const PlaybookFocus = ({ open, focus, pb, health, registry, onChange, onClose }) => {
    const theme = useTheme()
    const scriptRef = useRef(null)
    return (
        <Dialog
            fullScreen
            open={open}
            onClose={onClose}
            aria-labelledby={`pb-focus-title-${pb.id}`}
            PaperProps={{ sx: { bgcolor: 'background.default' } }}
        >
            <Stack
                direction='row'
                alignItems='center'
                spacing={1.5}
                sx={{ px: 3, py: 2, bgcolor: 'background.paper', borderBottom: `1px solid ${theme.palette.alpha.border}` }}
            >
                <AppIcon name='Signpost' size={20} style={{ opacity: 0.7 }} />
                <Typography id={`pb-focus-title-${pb.id}`} noWrap sx={{ minWidth: 0, fontSize: '1.125rem', fontWeight: 600 }}>
                    {pb.name?.trim() || 'Kịch bản chưa đặt tên'}
                </Typography>
                {(health.tone === 'rose' || health.tone === 'amber') && (
                    <ToneTag tone={health.tone} size='md'>
                        {health.label}
                    </ToneTag>
                )}
                <Box sx={{ flex: 1 }} />
                <Button variant='contained' onClick={onClose} startIcon={<AppIcon name='ArrowsIn' size={16} />}>
                    Thu nhỏ
                </Button>
            </Stack>
            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    width: '100%',
                    maxWidth: 1400,
                    mx: 'auto',
                    px: 3,
                    py: 3,
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 380px' },
                    gap: 3,
                    overflowY: { xs: 'auto', md: 'hidden' }
                }}
            >
                <Stack spacing={3} sx={{ minWidth: 0, minHeight: { md: 0 } }}>
                    <Box>
                        <FieldHead icon={iconComponent('Lightning')} label='Trường hợp kích hoạt' htmlFor={`pb-when-full-${pb.id}`} />
                        <TextField
                            id={`pb-when-full-${pb.id}`}
                            fullWidth
                            multiline
                            minRows={3}
                            maxRows={8}
                            // eslint-disable-next-line jsx-a11y/no-autofocus -- intentional: focus the first field when the dialog/panel opens
                            autoFocus={focus === 'when'}
                            value={pb.when}
                            onChange={(e) => onChange({ ...pb, when: e.target.value })}
                            placeholder={WHEN_PLACEHOLDER}
                            sx={{ '& .MuiInputBase-root': { fontSize: '0.9375rem', lineHeight: 1.7, bgcolor: 'background.paper' } }}
                        />
                    </Box>
                    <Box sx={{ flex: 1, minHeight: { xs: 360, md: 0 }, display: 'flex', flexDirection: 'column' }}>
                        <FieldHead icon={iconComponent('Path')} label='Cách xử lý' />
                        <TokenEditor
                            ref={scriptRef}
                            value={pb.script}
                            onChange={(script) => onChange({ ...pb, script })}
                            registry={registry}
                            fill
                            palette={false}
                            // eslint-disable-next-line jsx-a11y/no-autofocus -- intentional: focus the first field when the dialog/panel opens
                            autoFocus={focus === 'script'}
                            ariaLabel={`Cách xử lý — toàn màn hình: ${pb.name?.trim() || 'kịch bản chưa đặt tên'}`}
                            placeholder={SCRIPT_PLACEHOLDER}
                        />
                    </Box>
                </Stack>
                <Stack spacing={2} sx={{ minWidth: 0, minHeight: { md: 0 }, overflowY: { md: 'auto' } }}>
                    <VariablePalette registry={registry} value={pb.script} onPick={(n) => scriptRef.current?.insert(n)} maxHeight='48vh' />
                    <Readback steps={health.steps} issues={health.issues} registry={registry} />
                </Stack>
            </Box>
        </Dialog>
    )
}
PlaybookFocus.propTypes = {
    open: PropTypes.bool,
    focus: PropTypes.string,
    pb: PropTypes.object.isRequired,
    health: PropTypes.object.isRequired,
    registry: PropTypes.object,
    onChange: PropTypes.func,
    onClose: PropTypes.func
}

// Health of one playbook, shared by the workspace trigger and each row.
export const playbookHealth = (pb, ctx) => {
    const { steps, issues } = compilePlaybook(pb.script, ctx)
    if (!pb.script.trim()) return { steps, issues, tone: undefined, label: 'Chưa có bước' }
    if (issues.length)
        return { steps, issues, tone: issues.some((i) => i.tone === 'rose') ? 'rose' : 'amber', label: `${issues.length} lưu ý` }
    if (steps.length === 0) return { steps, issues, tone: undefined, label: 'Chưa có bước' }
    return { steps, issues, tone: 'emerald', label: 'Hợp lệ' }
}

const PlaybookItem = ({ pb, index, expanded, onToggle, onChange, onDelete, registry, toolState, chevronRef }) => {
    const theme = useTheme()
    const on = pb.enabled !== false
    const title = pb.name?.trim() || 'Kịch bản chưa đặt tên'
    const a11yName = `kịch bản ${index + 1}: ${title}`
    // which field the full-screen editor should focus ('when' | 'script'), null = closed
    const [focus, setFocus] = useState(null)
    const scriptRef = useRef(null)
    const { steps, issues, tone, label } = useMemo(
        () => playbookHealth(pb, { registry, toolState, customer: undefined }),
        [pb, registry, toolState]
    )

    // Each playbook is its own card: separate intents read as separate objects. The open one floats higher.
    return (
        <Box
            sx={{
                ...cardSx(theme, { level: expanded ? 2 : 1, hover: !expanded }),
                borderColor: expanded ? alpha(theme.palette.primary.main, 0.35) : theme.palette.alpha.border,
                overflow: 'hidden',
                transition: 'box-shadow 160ms ease-out, border-color 160ms ease-out'
            }}
        >
            {/* Whole row is a mouse target; keyboard users toggle with the chevron button (no nested interactive roles). */}
            <Stack
                direction='row'
                alignItems='center'
                spacing={1.5}
                onClick={onToggle}
                sx={{
                    pl: 2,
                    pr: 1,
                    py: 1,
                    minHeight: 56,
                    cursor: 'pointer',
                    transition: 'background-color 120ms ease-out',
                    borderBottom: expanded ? `1px solid ${theme.palette.alpha.divider}` : 'none',
                    '&:hover': { bgcolor: theme.palette.alpha.hover }
                }}
            >
                <Chip
                    size='small'
                    label={index + 1}
                    sx={{
                        height: 22,
                        minWidth: 22,
                        flexShrink: 0,
                        borderRadius: R_CONTROL,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        fontVariantNumeric: 'tabular-nums',
                        bgcolor: alpha(theme.palette.text.primary, 0.06),
                        color: on ? 'text.primary' : 'text.disabled',
                        '& .MuiChip-label': { px: 1 }
                    }}
                />
                <Typography
                    variant='body2'
                    noWrap
                    sx={{ flex: 1, minWidth: 0, fontWeight: 600, color: on ? 'text.primary' : 'text.secondary' }}
                >
                    {title}
                </Typography>
                {steps.length > 0 && (
                    <Typography variant='caption' sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                        {steps.length + 1} bước
                    </Typography>
                )}
                {(tone === 'rose' || tone === 'amber') && <ToneTag tone={tone}>{label}</ToneTag>}
                {!tone && (
                    <Typography variant='caption' sx={{ color: 'text.disabled', flexShrink: 0 }}>
                        {label}
                    </Typography>
                )}
                <Tooltip title={on ? 'Tắt kịch bản' : 'Bật kịch bản'} describeChild>
                    <Switch
                        size='small'
                        checked={on}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onChange({ ...pb, enabled: e.target.checked })}
                        inputProps={{ 'aria-label': `Kích hoạt ${a11yName}` }}
                    />
                </Tooltip>
                <Tooltip title={expanded ? 'Thu gọn' : 'Mở'}>
                    <IconButton
                        ref={chevronRef}
                        size='small'
                        aria-expanded={expanded}
                        aria-controls={`pb-body-${pb.id}`}
                        aria-label={`${expanded ? 'Thu gọn' : 'Mở'} ${a11yName}`}
                        onClick={(e) => {
                            e.stopPropagation()
                            onToggle()
                        }}
                        sx={{ width: 32, height: 32, borderRadius: R_CONTROL, color: 'text.secondary' }}
                    >
                        <Box
                            component={iconComponent('CaretDown')}
                            size={18}
                            stroke={1.75}
                            sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}
                        />
                    </IconButton>
                </Tooltip>
            </Stack>

            <Collapse in={expanded} timeout={200} unmountOnExit>
                <Box
                    id={`pb-body-${pb.id}`}
                    sx={{
                        px: 2,
                        pt: 2,
                        pb: 2,
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 280px' },
                        gap: 3,
                        alignItems: 'start'
                    }}
                >
                    <Stack spacing={3} sx={{ minWidth: 0 }}>
                        <Box>
                            <FieldHead icon={iconComponent('Tag')} label='Tên kịch bản' htmlFor={`pb-name-${pb.id}`} />
                            <TextField
                                id={`pb-name-${pb.id}`}
                                size='small'
                                fullWidth
                                value={pb.name}
                                onChange={(e) => onChange({ ...pb, name: e.target.value })}
                                sx={{ maxWidth: 420, '& .MuiInputBase-input': { fontSize: '0.9375rem', fontWeight: 500 } }}
                            />
                        </Box>
                        <Box>
                            <FieldHead
                                icon={iconComponent('Lightning')}
                                label='Trường hợp kích hoạt'
                                htmlFor={`pb-when-${pb.id}`}
                                onExpand={() => setFocus('when')}
                            />
                            <TextField
                                id={`pb-when-${pb.id}`}
                                fullWidth
                                multiline
                                minRows={2}
                                maxRows={6}
                                value={pb.when}
                                onChange={(e) => onChange({ ...pb, when: e.target.value })}
                                placeholder={WHEN_PLACEHOLDER}
                                sx={{ '& .MuiInputBase-root': { fontSize: '0.875rem', lineHeight: 1.6 } }}
                            />
                        </Box>
                        <Box>
                            <FieldHead icon={iconComponent('Path')} label='Cách xử lý' onExpand={() => setFocus('script')} />
                            <TokenEditor
                                ref={scriptRef}
                                value={pb.script}
                                onChange={(script) => onChange({ ...pb, script })}
                                registry={registry}
                                minRows={6}
                                maxRows={16}
                                palette={false}
                                // eslint-disable-next-line jsx-a11y/no-autofocus -- intentional: focus the first field when the dialog/panel opens
                                autoFocus={!pb.script}
                                ariaLabel={`Cách xử lý của ${a11yName}`}
                                placeholder={SCRIPT_PLACEHOLDER}
                            />
                        </Box>

                        <Readback steps={steps} issues={issues} registry={registry} />

                        <Button
                            size='small'
                            color='error'
                            startIcon={<AppIcon name='Trash' size={16} />}
                            onClick={onDelete}
                            sx={{ alignSelf: 'flex-start' }}
                        >
                            Xoá
                        </Button>
                    </Stack>
                    <VariablePalette registry={registry} value={pb.script} onPick={(n) => scriptRef.current?.insert(n)} maxHeight={560} />
                </Box>
            </Collapse>

            <PlaybookFocus
                open={Boolean(focus)}
                focus={focus}
                pb={pb}
                health={{ steps, issues, tone, label }}
                registry={registry}
                onChange={onChange}
                onClose={() => setFocus(null)}
            />
        </Box>
    )
}
PlaybookItem.propTypes = {
    pb: PropTypes.object.isRequired,
    index: PropTypes.number,
    expanded: PropTypes.bool,
    onToggle: PropTypes.func,
    onChange: PropTypes.func,
    onDelete: PropTypes.func,
    registry: PropTypes.object,
    toolState: PropTypes.object,
    chevronRef: PropTypes.func
}

const PlaybookSheet = ({ open, onClose, toolState, setToolState, registry }) => {
    const theme = useTheme()
    const { drawerProps, headerProps, contentProps, footerProps } = useSheetShell({ width: 'xl' })
    const playbooks = toolState.playbooks
    const guards = toolState.guards
    const [expandedId, setExpandedId] = useState(null)
    const chevronRefs = useRef({})
    const addRef = useRef(null)
    const [focusTarget, setFocusTarget] = useState(null)

    // Opening the sheet starts with the first playbook unfolded so there is always something to edit.
    useEffect(() => {
        if (open) setExpandedId((cur) => (cur && playbooks.some((p) => p.id === cur) ? cur : playbooks[0]?.id || null))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    // After a delete, keep keyboard focus nearby instead of dropping it to the top of the drawer.
    useEffect(() => {
        if (!focusTarget) return
        ;(focusTarget === 'add' ? addRef.current : chevronRefs.current[focusTarget])?.focus()
        setFocusTarget(null)
    }, [focusTarget])

    const updatePlaybooks = (fn) => setToolState((s) => ({ ...s, playbooks: fn(s.playbooks) }))
    const setGuards = (patch) => setToolState((s) => ({ ...s, guards: { ...s.guards, ...patch } }))
    const add = () => {
        const used = new Set(playbooks.map((p) => p.name))
        let n = playbooks.length + 1
        while (used.has(`Kịch bản ${n}`)) n++
        const pb = newPlaybook(n)
        updatePlaybooks((list) => [...list, pb])
        setExpandedId(pb.id)
    }
    const remove = (i) => {
        const neighbour = playbooks[i + 1] || playbooks[i - 1]
        const id = playbooks[i].id
        updatePlaybooks((list) => list.filter((x) => x.id !== id))
        setFocusTarget(neighbour ? neighbour.id : 'add')
    }

    return (
        <Drawer
            {...drawerProps}
            PaperProps={{ ...drawerProps.PaperProps, role: 'dialog', 'aria-modal': true, 'aria-labelledby': 'playbook-sheet-title' }}
            open={open}
            onClose={onClose}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box {...headerProps}>
                    <Stack direction='row' alignItems='baseline' spacing={1} sx={{ minWidth: 0 }}>
                        <Typography id='playbook-sheet-title' noWrap sx={{ fontSize: '1.125rem', fontWeight: 600 }}>
                            Kịch bản
                        </Typography>
                        <Typography variant='caption' sx={{ color: 'text.disabled', fontVariantNumeric: 'tabular-nums' }}>
                            {playbooks.length}
                        </Typography>
                    </Stack>
                    <Tooltip title='Đóng'>
                        <IconButton onClick={onClose} aria-label='Đóng' size='small' sx={closeButtonSx(theme)}>
                            <AppIcon name='X' size={16} />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Box {...contentProps}>
                    {playbooks.length === 0 ? (
                        <Stack alignItems='center' spacing={1.5} sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                            <AppIcon name='Signpost' size={40} style={{ opacity: 0.3 }} />
                            <Typography variant='body2'>
                                Chưa có kịch bản. Thêm kịch bản để chỉ cho agent cách xử lý từng tình huống.
                            </Typography>
                            <Button ref={addRef} startIcon={<AppIcon name='Plus' size={16} />} onClick={add} sx={{ fontWeight: 500 }}>
                                Thêm
                            </Button>
                        </Stack>
                    ) : (
                        <Stack spacing={1.5}>
                            <Stack spacing={1.5}>
                                {playbooks.map((pb, i) => (
                                    <PlaybookItem
                                        key={pb.id}
                                        pb={pb}
                                        index={i}
                                        expanded={expandedId === pb.id}
                                        onToggle={() => setExpandedId((cur) => (cur === pb.id ? null : pb.id))}
                                        registry={registry}
                                        toolState={toolState}
                                        chevronRef={(el) => {
                                            chevronRefs.current[pb.id] = el
                                        }}
                                        onChange={(next) => updatePlaybooks((list) => list.map((x) => (x.id === next.id ? next : x)))}
                                        onDelete={() => remove(i)}
                                    />
                                ))}
                            </Stack>
                            <Button
                                ref={addRef}
                                fullWidth
                                startIcon={<AppIcon name='Plus' size={16} />}
                                onClick={add}
                                sx={{
                                    height: 48,
                                    fontWeight: 600,
                                    borderRadius: R_CARD,
                                    border: `1px dashed ${theme.palette.alpha.borderStrong}`,
                                    color: 'text.secondary',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        color: 'primary.main',
                                        bgcolor: alpha(theme.palette.primary.main, 0.04)
                                    }
                                }}
                            >
                                Thêm
                            </Button>
                        </Stack>
                    )}

                    <Box component='section' sx={{ ...cardSx(theme), px: 2, pt: 1.5, pb: 0.5 }}>
                        <Eyebrow component='h2' sx={{ display: 'block', mb: 1 }}>
                            Quy tắc an toàn
                        </Eyebrow>
                        <Box sx={hairlineListSx(theme)}>
                            <FormControlLabel
                                labelPlacement='start'
                                control={
                                    <Switch
                                        size='small'
                                        checked={guards.fillMissing}
                                        onChange={(e) => setGuards({ fillMissing: e.target.checked })}
                                    />
                                }
                                label='Tự bổ sung dữ liệu còn thiếu trước khi gọi API'
                                sx={ruleRowSx}
                            />
                            <FormControlLabel
                                labelPlacement='start'
                                control={
                                    <Switch
                                        size='small'
                                        checked={guards.skipKnown}
                                        onChange={(e) => setGuards({ skipKnown: e.target.checked })}
                                    />
                                }
                                label='Không hỏi lại thông tin đã có trong hồ sơ khách'
                                sx={ruleRowSx}
                            />
                            <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={2} sx={{ py: 1.5 }}>
                                <Typography id='pb-onerror-label' sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                    Khi API lỗi
                                </Typography>
                                <Select
                                    labelId='pb-onerror-label'
                                    size='small'
                                    value={guards.onError}
                                    onChange={(e) => setGuards({ onError: e.target.value })}
                                    sx={{ minWidth: 200 }}
                                >
                                    {ON_ERROR.map((o) => (
                                        <MenuItem key={o.id} value={o.id}>
                                            {o.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Stack>
                        </Box>
                    </Box>
                </Box>

                <Box {...footerProps}>
                    <Button variant='contained' onClick={onClose}>
                        Xong
                    </Button>
                </Box>
            </Box>
        </Drawer>
    )
}

PlaybookSheet.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    toolState: PropTypes.object.isRequired,
    setToolState: PropTypes.func.isRequired,
    registry: PropTypes.object.isRequired
}

export default PlaybookSheet
