import PropTypes from 'prop-types'
import { useState } from 'react'
import {
    Autocomplete,
    Box,
    Button,
    Checkbox,
    Chip,
    Dialog,
    Divider,
    FormControlLabel,
    IconButton,
    InputBase,
    MenuItem,
    Select,
    Slider,
    Stack,
    Switch,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { AppIcon } from '@/ui-component/icons/AppIcon'

import { FormField } from '@/hooks/useDialogShell'
import { R_CARD, monoSx, toneOf } from '@/views/assistants/custom/workspace/primitives'
import { ON_ERROR, newApi } from '@/views/assistants/custom/workspace/catalog'
import { CUSTOMER_ATTRS } from '@/views/assistants/custom/workspace/tokens'
import { apiInputs } from '@/views/assistants/custom/workspace/planner'
import TokenEditor from '@/views/assistants/custom/workspace/TokenEditor'
import { ApiDetail, ApiListBody, CollectInfoBody, DeepResearchBody } from '@/views/assistants/custom/workspace/ToolSheet'
import { CHANNELS, FIXED, TOOL_KINDS } from './nodeCatalog'

const TEAMS = ['CSKH', 'Bán hàng', 'Kỹ thuật', 'Kế toán']
const labelSx = { '& .MuiFormControlLabel-label': { fontSize: '0.8125rem' } }

export const Section = ({ title, action, children }) => (
    <Box sx={{ px: 2.5, py: 2.5 }}>
        {(title || action) && (
            <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 1.5, minHeight: 28 }}>
                {title && <Typography variant='h5'>{title}</Typography>}
                {action}
            </Stack>
        )}
        <Stack spacing={2}>{children}</Stack>
    </Box>
)
Section.propTypes = { title: PropTypes.node, action: PropTypes.node, children: PropTypes.node }

const toolStateOf = (doc) => ({
    enabled: { collectInfo: true, apiCaller: true },
    collectInfo: { variables: doc.variables },
    apiCaller: { apis: doc.apis },
    guards: doc.settings.guards
})

const Head = ({ Icon, tone, title, onTitle, caption, right }) => {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const spec = tone ? toneOf(theme, tone) : null
    return (
        <Stack direction='row' spacing={1.5} alignItems='center' sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
            <Box
                sx={{
                    width: 34,
                    height: 34,
                    flexShrink: 0,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: spec ? alpha(spec.main, isDark ? 0.2 : 0.12) : alpha(theme.palette.text.primary, 0.08),
                    color: spec ? (isDark ? spec.light : spec.dark) : 'text.primary'
                }}
            >
                <Icon size={18} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                {onTitle ? (
                    <InputBase
                        fullWidth
                        value={title}
                        onChange={(e) => onTitle(e.target.value)}
                        inputProps={{ 'aria-label': 'Tên' }}
                        sx={{ fontSize: '1rem', fontWeight: 600, '& input': { p: 0 } }}
                    />
                ) : (
                    <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>{title}</Typography>
                )}
                {caption && (
                    <Typography variant='caption' color='text.secondary'>
                        {caption}
                    </Typography>
                )}
            </Box>
            {right}
        </Stack>
    )
}
Head.propTypes = {
    Icon: PropTypes.elementType,
    tone: PropTypes.string,
    title: PropTypes.string,
    onTitle: PropTypes.func,
    caption: PropTypes.node,
    right: PropTypes.node
}

const Issues = ({ issues }) => {
    const theme = useTheme()
    if (!issues?.length) return null
    return (
        <Stack spacing={0.5} sx={{ px: 2.5, pb: 1.5 }}>
            {issues.map((it, i) => {
                const s = toneOf(theme, it.tone)
                return (
                    <Typography key={i} variant='caption' sx={{ color: theme.palette.mode === 'dark' ? s.light : s.dark }}>
                        {it.text}
                    </Typography>
                )
            })}
        </Stack>
    )
}
Issues.propTypes = { issues: PropTypes.array }

const WhenField = ({ value, onChange, label = 'Dùng khi', placeholder }) => (
    <FormField label={label} required hint='Agent đọc mô tả này để tự quyết định có dùng hay không — viết càng cụ thể càng chọn đúng.'>
        <TextField
            size='small'
            multiline
            minRows={2}
            maxRows={5}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'vd: Khi khách hỏi về giá, cấu hình sản phẩm'}
        />
    </FormField>
)
WhenField.propTypes = { value: PropTypes.string, onChange: PropTypes.func, label: PropTypes.string, placeholder: PropTypes.string }

// ------------------------------------------------------------------ Agent
export const AgentForm = ({ doc, setDoc, models, registry, issues }) => {
    const theme = useTheme()
    const [full, setFull] = useState(false)
    const s = doc.settings
    const setS = (patch) => setDoc((d) => ({ ...d, settings: { ...d.settings, ...patch } }))
    const model = models.find((m) => m.name === s.modelName)
    return (
        <>
            <Stack direction='row' spacing={1.5} alignItems='center' sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
                <Box
                    sx={{
                        width: 34,
                        height: 34,
                        borderRadius: '8px',
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.8125rem'
                    }}
                >
                    AI
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <InputBase
                        fullWidth
                        value={doc.name}
                        onChange={(e) => setDoc((d) => ({ ...d, name: e.target.value }))}
                        inputProps={{ 'aria-label': 'Tên trợ lý' }}
                        sx={{ fontSize: '1rem', fontWeight: 600, '& input': { p: 0 } }}
                    />
                    <Typography variant='caption' color='text.secondary'>
                        Agent tự chọn công cụ để trả lời
                    </Typography>
                </Box>
            </Stack>
            <Issues issues={issues} />
            <Divider />
            <Section>
                <FormField label='Mô hình'>
                    <Autocomplete
                        size='small'
                        disableClearable
                        options={models}
                        value={model || null}
                        groupBy={(o) => o.provider}
                        getOptionLabel={(o) => o.short}
                        isOptionEqualToValue={(o, v) => o.name === v.name}
                        onChange={(_, v) => v && setS({ modelName: v.name })}
                        renderInput={(params) => <TextField {...params} placeholder='Chọn mô hình' />}
                    />
                </FormField>
                <FormField
                    label={
                        <Stack direction='row' alignItems='center' justifyContent='space-between' component='span' sx={{ width: '100%' }}>
                            <span>Hướng dẫn</span>
                            <Tooltip title='Mở toàn màn hình'>
                                <IconButton size='small' aria-label='Mở toàn màn hình' onClick={() => setFull(true)} sx={{ mr: -0.5 }}>
                                    <AppIcon name='ArrowsOut' size={15} />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    }
                >
                    <TokenEditor
                        value={s.instruction}
                        onChange={(instruction) => setS({ instruction })}
                        registry={registry}
                        minRows={6}
                        maxRows={14}
                        ariaLabel='Hướng dẫn cho agent'
                        placeholder='Vai trò, giọng điệu, phạm vi trả lời…'
                    />
                </FormField>
                <FormField label='Lời chào'>
                    <TokenEditor
                        value={s.welcome}
                        onChange={(welcome) => setS({ welcome })}
                        registry={registry}
                        minRows={1}
                        maxRows={3}
                        groups={['customer', 'system']}
                        ariaLabel='Lời chào'
                    />
                </FormField>
                <Stack direction='row' spacing={2}>
                    <FormField label='Nhớ hội thoại' sx={{ width: 170 }}>
                        <Select size='small' value={s.memory} onChange={(e) => setS({ memory: e.target.value })}>
                            {[0, 5, 10, 20, 50].map((n) => (
                                <MenuItem key={n} value={n}>
                                    {n === 0 ? 'Không nhớ' : `${n} tin gần nhất`}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormField>
                    <FormField label={`Độ sáng tạo · ${s.temperature.toFixed(1)}`} sx={{ flex: 1 }}>
                        <Slider
                            value={s.temperature}
                            min={0}
                            max={1.5}
                            step={0.1}
                            onChange={(_, v) => setS({ temperature: v })}
                            sx={{ mx: 1 }}
                        />
                    </FormField>
                </Stack>
            </Section>
            <Dialog fullScreen open={full} onClose={() => setFull(false)} PaperProps={{ sx: { bgcolor: 'background.default' } }}>
                <Stack
                    direction='row'
                    alignItems='center'
                    spacing={1.5}
                    sx={{ px: 3, py: 2, borderBottom: `1px solid ${theme.palette.alpha.border}` }}
                >
                    <Typography variant='h4' noWrap sx={{ flex: 1, minWidth: 0 }}>
                        Hướng dẫn · {doc.name}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                        {s.instruction.length} ký tự
                    </Typography>
                    <Tooltip title='Thu nhỏ'>
                        <IconButton aria-label='Thu nhỏ' onClick={() => setFull(false)}>
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
                        minHeight: 0
                    }}
                >
                    <TokenEditor
                        value={s.instruction}
                        onChange={(instruction) => setS({ instruction })}
                        registry={registry}
                        fill
                        // eslint-disable-next-line jsx-a11y/no-autofocus -- intentional: focus the first field when the dialog/panel opens
                        autoFocus
                        ariaLabel='Hướng dẫn toàn màn hình'
                    />
                </Box>
            </Dialog>
        </>
    )
}
AgentForm.propTypes = {
    doc: PropTypes.object,
    setDoc: PropTypes.func,
    models: PropTypes.array,
    registry: PropTypes.object,
    issues: PropTypes.array
}

// ------------------------------------------------------------------ Tools
const ParamRow = ({ v, setVar }) => {
    const theme = useTheme()
    return (
        <Box sx={{ p: 1.5, borderRadius: R_CARD, border: `1px solid ${theme.palette.alpha.border}` }}>
            <Stack direction='row' spacing={1} alignItems='center'>
                <Typography sx={{ ...monoSx, fontWeight: 600, flex: 1, minWidth: 0 }} noWrap>{`{{${v.name}}}`}</Typography>
                <Select
                    size='small'
                    displayEmpty
                    value={v.prefill || ''}
                    onChange={(e) => setVar({ prefill: e.target.value })}
                    sx={{ width: 190, '& .MuiSelect-select': { py: 0.75, fontSize: '0.8125rem' } }}
                >
                    <MenuItem value=''>
                        <em>Luôn hỏi khách</em>
                    </MenuItem>
                    {CUSTOMER_ATTRS.map((a) => (
                        <MenuItem key={a.key} value={a.key} sx={{ fontSize: '0.8125rem' }}>
                            Lấy từ hồ sơ · {a.label}
                        </MenuItem>
                    ))}
                </Select>
            </Stack>
            <TextField
                size='small'
                fullWidth
                value={v.description || ''}
                onChange={(e) => setVar({ description: e.target.value })}
                placeholder='Agent hỏi khách thế nào khi thiếu'
                sx={{ mt: 1 }}
            />
        </Box>
    )
}
ParamRow.propTypes = { v: PropTypes.object, setVar: PropTypes.func }

export const ToolForm = ({ tool, doc, setDoc, stores, onRemove, issues }) => {
    const def = TOOL_KINDS[tool.kind] || { label: tool.kind }
    const patch = (p) => setDoc((d) => ({ ...d, tools: d.tools.map((t) => (t.id === tool.id ? { ...t, ...p } : t)) }))
    const setConfig = (c) => patch({ config: { ...tool.config, ...c } })
    const api = tool.kind === 'api' ? doc.apis.find((a) => a.id === tool.config.apiId) : null
    const setVar = (name) => (p) => setDoc((d) => ({ ...d, variables: d.variables.map((x) => (x.name === name ? { ...x, ...p } : x)) }))

    return (
        <>
            <Head
                Icon={def.Icon}
                tone={def.tone}
                title={tool.name}
                onTitle={(name) => patch({ name })}
                caption={def.group === 'advanced' ? `Agentflow · ${def.label}` : def.label}
                right={
                    <Stack direction='row' alignItems='center'>
                        <Tooltip title={tool.enabled !== false ? 'Tắt công cụ' : 'Bật công cụ'}>
                            <Switch
                                size='small'
                                checked={tool.enabled !== false}
                                onChange={(e) => patch({ enabled: e.target.checked })}
                                inputProps={{ 'aria-label': 'Bật công cụ' }}
                            />
                        </Tooltip>
                        <Tooltip title='Gỡ khỏi agent'>
                            <IconButton aria-label='Gỡ khỏi agent' onClick={onRemove} sx={{ '&:hover': { color: 'error.main' } }}>
                                <AppIcon name='Trash' size={18} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                }
            />
            <Issues issues={issues} />
            <Divider />
            <Section>
                <WhenField value={tool.when} onChange={(when) => patch({ when })} />

                {(tool.kind === 'kb' || tool.kind === 'retrieverAgentflow') && (
                    <>
                        <FormField label='Kho tài liệu' required>
                            <Select
                                size='small'
                                displayEmpty
                                value={tool.config.storeId || ''}
                                onChange={(e) => setConfig({ storeId: e.target.value })}
                            >
                                <MenuItem value='' disabled>
                                    <em>Chọn kho</em>
                                </MenuItem>
                                {stores.map((s) => (
                                    <MenuItem key={s.id} value={s.id}>
                                        {s.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormField>
                        <FormField label={`Số đoạn lấy về · ${tool.config.topK || 4}`}>
                            <Slider
                                value={tool.config.topK || 4}
                                min={1}
                                max={10}
                                step={1}
                                marks
                                onChange={(_, v) => setConfig({ topK: v })}
                                sx={{ mx: 1 }}
                            />
                        </FormField>
                        <FormControlLabel
                            control={
                                <Switch size='small' checked={!!tool.config.cite} onChange={(e) => setConfig({ cite: e.target.checked })} />
                            }
                            label='Kèm nguồn trích dẫn trong câu trả lời'
                            sx={labelSx}
                        />
                    </>
                )}

                {tool.kind === 'api' &&
                    (api ? (
                        <>
                            {apiInputs(api).filter((n) => doc.variables.some((v) => v.name === n)).length > 0 && (
                                <FormField
                                    label='Tham số agent tự lo'
                                    hint='Có trong hồ sơ thì agent tự lấy, không có thì agent hỏi khách.'
                                >
                                    <Stack spacing={1}>
                                        {apiInputs(api)
                                            .map((n) => doc.variables.find((v) => v.name === n))
                                            .filter(Boolean)
                                            .map((v) => (
                                                <ParamRow key={v.id} v={v} setVar={setVar(v.name)} />
                                            ))}
                                    </Stack>
                                </FormField>
                            )}
                            <Divider />
                            <ApiDetail
                                api={api}
                                toolState={toolStateOf(doc)}
                                onBack={() => setConfig({ apiId: '' })}
                                onChange={(next) => setDoc((d) => ({ ...d, apis: d.apis.map((a) => (a.id === next.id ? next : a)) }))}
                                onDelete={() => {
                                    setDoc((d) => ({ ...d, apis: d.apis.filter((a) => a.id !== api.id) }))
                                    setConfig({ apiId: '' })
                                }}
                            />
                        </>
                    ) : (
                        <>
                            <FormField label='API' required>
                                <Select size='small' displayEmpty value='' onChange={(e) => setConfig({ apiId: e.target.value })}>
                                    <MenuItem value='' disabled>
                                        <em>{doc.apis.length ? 'Chọn API đã khai báo' : 'Chưa có API nào'}</em>
                                    </MenuItem>
                                    {doc.apis.map((a) => (
                                        <MenuItem key={a.id} value={a.id}>
                                            {a.method} · {a.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormField>
                            <Box>
                                <Button
                                    variant='outlined'
                                    startIcon={<AppIcon name='Plus' size={16} />}
                                    onClick={() => {
                                        const a = newApi(doc.apis.length + 1)
                                        setDoc((d) => ({ ...d, apis: [...d.apis, a] }))
                                        setConfig({ apiId: a.id })
                                    }}
                                >
                                    Tạo API mới
                                </Button>
                            </Box>
                        </>
                    ))}

                {tool.kind === 'deepResearch' && (
                    <DeepResearchBody
                        value={{ links: [], sources: ['web'], depth: 3, maxResults: 8, ...tool.config }}
                        onChange={(v) => patch({ config: v })}
                    />
                )}

                {(tool.kind === 'customTool' || def.group === 'advanced') && tool.kind !== 'retrieverAgentflow' && (
                    <>
                        <FormField label={tool.kind === 'customTool' ? 'Mã JavaScript' : 'Tham số (JSON)'}>
                            <TextField
                                multiline
                                minRows={6}
                                value={tool.config.code ?? tool.config.params ?? ''}
                                onChange={(e) =>
                                    setConfig(tool.kind === 'customTool' ? { code: e.target.value } : { params: e.target.value })
                                }
                                InputProps={{ sx: monoSx }}
                            />
                        </FormField>
                        {def.group === 'advanced' && (
                            <Typography variant='caption' color='text.secondary'>
                                Node Agentflow gốc — chạy đầy đủ khi kết nối máy chủ; trong chat thử agent bỏ qua công cụ này.
                            </Typography>
                        )}
                    </>
                )}
            </Section>
        </>
    )
}
ToolForm.propTypes = {
    tool: PropTypes.object,
    doc: PropTypes.object,
    setDoc: PropTypes.func,
    stores: PropTypes.array,
    onRemove: PropTypes.func,
    issues: PropTypes.array
}

// ------------------------------------------------------------------ Fixed blocks
export const InfoForm = ({ kind, refId, doc, setDoc, registry, issues, onRemove }) => {
    const def = FIXED[kind]
    const setS = (patch) => setDoc((d) => ({ ...d, settings: { ...d.settings, ...patch } }))

    if (kind === 'channels')
        return (
            <>
                <Head Icon={def.Icon} title='Kênh' caption='Nơi khách nhắn tới agent' />
                <Issues issues={issues} />
                <Divider />
                <Section>
                    <Stack direction='row' sx={{ gap: 1, flexWrap: 'wrap' }}>
                        {CHANNELS.map((ch) => {
                            const on = doc.channels.includes(ch.id)
                            return (
                                <Chip
                                    key={ch.id}
                                    label={ch.label}
                                    variant={on ? 'filled' : 'outlined'}
                                    color={on ? 'primary' : 'default'}
                                    onClick={() =>
                                        setDoc((d) => ({
                                            ...d,
                                            channels: on ? d.channels.filter((x) => x !== ch.id) : [...d.channels, ch.id]
                                        }))
                                    }
                                />
                            )
                        })}
                    </Stack>
                </Section>
            </>
        )

    if (kind === 'profile')
        return (
            <>
                <Head Icon={def.Icon} tone={def.tone} title='Hồ sơ khách hàng' caption='Agent chỉ đọc được thuộc tính được chọn' />
                <Divider />
                <Section>
                    {CUSTOMER_ATTRS.map((a) => {
                        const on = doc.customerAttrs.includes(a.key)
                        return (
                            <Stack key={a.key} direction='row' alignItems='center' spacing={1} sx={{ mt: '0 !important' }}>
                                <Checkbox
                                    size='small'
                                    checked={on}
                                    onChange={() =>
                                        setDoc((d) => ({
                                            ...d,
                                            customerAttrs: on ? d.customerAttrs.filter((x) => x !== a.key) : [...d.customerAttrs, a.key]
                                        }))
                                    }
                                    inputProps={{ 'aria-label': a.label }}
                                />
                                <Typography variant='body2' sx={{ flex: 1 }}>
                                    {a.label}
                                </Typography>
                                <Typography
                                    variant='caption'
                                    sx={{ ...monoSx, fontSize: '0.75rem', color: 'text.secondary' }}
                                >{`{{${a.key}}}`}</Typography>
                            </Stack>
                        )
                    })}
                </Section>
            </>
        )

    if (kind === 'guard') {
        const g = doc.settings.guards
        return (
            <>
                <Head Icon={def.Icon} title='Quy tắc an toàn' caption='Agent đối chiếu trước khi trả lời' />
                <Divider />
                <Section
                    title={`Quy tắc · ${doc.rules.length}`}
                    action={
                        <Button
                            size='small'
                            startIcon={<AppIcon name='Plus' size={14} />}
                            onClick={() => setDoc((d) => ({ ...d, rules: [...d.rules, ''] }))}
                        >
                            Thêm
                        </Button>
                    }
                >
                    {doc.rules.map((r, i) => (
                        <Stack key={i} direction='row' spacing={1} alignItems='center'>
                            <TextField
                                size='small'
                                fullWidth
                                value={r}
                                placeholder='vd: Không hứa giảm giá ngoài chương trình'
                                onChange={(e) => setDoc((d) => ({ ...d, rules: d.rules.map((x, j) => (j === i ? e.target.value : x)) }))}
                            />
                            <IconButton
                                size='small'
                                aria-label='Xoá quy tắc'
                                onClick={() => setDoc((d) => ({ ...d, rules: d.rules.filter((_, j) => j !== i) }))}
                            >
                                <AppIcon name='Trash' size={16} />
                            </IconButton>
                        </Stack>
                    ))}
                </Section>
                <Divider />
                <Section title='Khi thiếu dữ liệu'>
                    <FormControlLabel
                        control={
                            <Switch
                                size='small'
                                checked={g.fillMissing}
                                onChange={(e) => setS({ guards: { ...g, fillMissing: e.target.checked } })}
                            />
                        }
                        label='Tự bổ sung tham số trước khi gọi API'
                        sx={labelSx}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                size='small'
                                checked={g.skipKnown}
                                onChange={(e) => setS({ guards: { ...g, skipKnown: e.target.checked } })}
                            />
                        }
                        label='Không hỏi lại thông tin đã có trong hồ sơ'
                        sx={labelSx}
                    />
                    <FormField label='Khi API lỗi'>
                        <Select size='small' value={g.onError} onChange={(e) => setS({ guards: { ...g, onError: e.target.value } })}>
                            {ON_ERROR.map((o) => (
                                <MenuItem key={o.id} value={o.id}>
                                    {o.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormField>
                </Section>
            </>
        )
    }

    if (kind === 'sop') {
        const s = doc.sops.find((x) => x.id === refId)
        if (!s) return null
        const patch = (p) => setDoc((d) => ({ ...d, sops: d.sops.map((x) => (x.id === refId ? { ...x, ...p } : x)) }))
        return (
            <>
                <Head
                    Icon={def.Icon}
                    tone={def.tone}
                    title={s.name}
                    onTitle={(name) => patch({ name })}
                    caption='Quy trình — agent tham khảo, không phải flow cứng'
                    right={
                        <Stack direction='row' alignItems='center'>
                            <Switch
                                size='small'
                                checked={s.enabled !== false}
                                onChange={(e) => patch({ enabled: e.target.checked })}
                                inputProps={{ 'aria-label': 'Bật quy trình' }}
                            />
                            <Tooltip title='Xoá quy trình'>
                                <IconButton aria-label='Xoá quy trình' onClick={onRemove} sx={{ '&:hover': { color: 'error.main' } }}>
                                    <AppIcon name='Trash' size={18} />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    }
                />
                <Issues issues={issues} />
                <Divider />
                <Section>
                    <WhenField
                        label='Áp dụng khi'
                        value={s.when}
                        onChange={(when) => patch({ when })}
                        placeholder='vd: Khách hỏi tình trạng đơn hàng'
                    />
                    <FormField label='Cách làm' hint='Viết như dặn nhân viên mới. Chèn API, kho tài liệu, biến để agent biết dùng gì.'>
                        <TokenEditor
                            value={s.body}
                            onChange={(body) => patch({ body })}
                            registry={registry}
                            minRows={6}
                            ariaLabel={`Nội dung ${s.name}`}
                        />
                    </FormField>
                </Section>
            </>
        )
    }

    // handoff
    const h = doc.handoff
    const patchH = (p) => setDoc((d) => ({ ...d, handoff: { ...d.handoff, ...p } }))
    return (
        <>
            <Head
                Icon={def.Icon}
                tone={def.tone}
                title='Chuyển nhân viên'
                caption='Agent tự quyết khi nào nhờ người'
                right={
                    <Switch
                        size='small'
                        checked={h.enabled}
                        onChange={(e) => patchH({ enabled: e.target.checked })}
                        inputProps={{ 'aria-label': 'Bật chuyển nhân viên' }}
                    />
                }
            />
            <Issues issues={issues} />
            <Divider />
            <Section>
                <WhenField
                    label='Chuyển khi'
                    value={h.when}
                    onChange={(when) => patchH({ when })}
                    placeholder='vd: Khách muốn gặp người thật, phàn nàn gay gắt'
                />
                <FormField label='Nhóm nhận'>
                    <Select size='small' value={h.team} onChange={(e) => patchH({ team: e.target.value })}>
                        {TEAMS.map((t) => (
                            <MenuItem key={t} value={t}>
                                {t}
                            </MenuItem>
                        ))}
                    </Select>
                </FormField>
                <FormField label='Tin nhắn gửi khách'>
                    <TokenEditor
                        value={h.message}
                        onChange={(message) => patchH({ message })}
                        registry={registry}
                        minRows={2}
                        groups={['customer', 'system']}
                        ariaLabel='Tin nhắn chuyển nhân viên'
                    />
                </FormField>
            </Section>
        </>
    )
}
InfoForm.propTypes = {
    kind: PropTypes.string,
    refId: PropTypes.string,
    doc: PropTypes.object,
    setDoc: PropTypes.func,
    registry: PropTypes.object,
    issues: PropTypes.array,
    onRemove: PropTypes.func
}

// ------------------------------------------------------------------ Assistant-wide resources
export const ResourcesForm = ({ doc, setDoc, issueList, onSelectNode, nameOf }) => {
    const theme = useTheme()
    const toolState = toolStateOf(doc)
    return (
        <>
            {issueList.length > 0 && (
                <>
                    <Section title={`Cần xử lý · ${issueList.length}`}>
                        <Stack spacing={0.5}>
                            {issueList.map((it, i) => {
                                const t = toneOf(theme, it.tone)
                                return (
                                    <Stack
                                        key={i}
                                        direction='row'
                                        spacing={1}
                                        alignItems='baseline'
                                        role='button'
                                        tabIndex={0}
                                        onClick={() => onSelectNode(it.nodeId)}
                                        onKeyDown={(e) => e.key === 'Enter' && onSelectNode(it.nodeId)}
                                        sx={{
                                            px: 1,
                                            py: 0.75,
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: theme.palette.alpha.hover }
                                        }}
                                    >
                                        <AppIcon
                                            name={it.tone === 'rose' ? 'WarningOctagon' : 'WarningCircle'}
                                            size={14}
                                            color={t.main}
                                            style={{ flexShrink: 0, transform: 'translateY(2px)' }}
                                        />
                                        <Typography variant='body2' sx={{ fontSize: '0.8125rem', fontWeight: 600, flexShrink: 0 }}>
                                            {nameOf(it.nodeId)}
                                        </Typography>
                                        <Typography
                                            variant='body2'
                                            color='text.secondary'
                                            sx={{ fontSize: '0.8125rem', minWidth: 0 }}
                                            noWrap
                                        >
                                            {it.text}
                                        </Typography>
                                    </Stack>
                                )
                            })}
                        </Stack>
                    </Section>
                    <Divider />
                </>
            )}
            <Section title='Trạng thái'>
                <ToggleButtonGroup
                    size='small'
                    exclusive
                    value={doc.status}
                    onChange={(_, v) => v && setDoc((d) => ({ ...d, status: v }))}
                    sx={{ '& .MuiToggleButton-root': { px: 2, textTransform: 'none', fontSize: '0.8125rem' } }}
                >
                    <ToggleButton value='active'>Đang hoạt động</ToggleButton>
                    <ToggleButton value='draft'>Bản nháp</ToggleButton>
                </ToggleButtonGroup>
            </Section>
            <Divider />
            <Section>
                <CollectInfoBody
                    value={{ variables: doc.variables }}
                    onChange={(v) => setDoc((d) => ({ ...d, variables: v.variables }))}
                    toolState={toolState}
                />
            </Section>
            <Divider />
            <Section>
                <ApiListBody value={{ apis: doc.apis }} onChange={(v) => setDoc((d) => ({ ...d, apis: v.apis }))} toolState={toolState} />
            </Section>
        </>
    )
}
ResourcesForm.propTypes = {
    doc: PropTypes.object,
    setDoc: PropTypes.func,
    issueList: PropTypes.array,
    onSelectNode: PropTypes.func,
    nameOf: PropTypes.func
}
