import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow'
import 'reactflow/dist/style.css'
import '@/views/agentflowsv2/index.css'
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    IconButton,
    InputBase,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    Menu,
    MenuItem,
    Paper,
    Stack,
    Tab,
    Tabs,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import {
    IconAdjustmentsHorizontal,
    IconAlertTriangleFilled,
    IconArrowLeft,
    IconArrowsMaximize,
    IconArrowsMinimize,
    IconDeviceFloppy,
    IconFocus2,
    IconLayoutDistributeHorizontal,
    IconPlayerPlayFilled,
    IconPlus,
    IconX
} from '@tabler/icons-react'

import assistantsApi from '@/api/assistants'
import documentStoreApi from '@/api/documentstore'
import { flowContext } from '@/store/context/ReactFlowContext'
import { StatusPill } from '@/ui-component/table/SharedTable'
import { MetaPill, toneOf } from '@/views/assistants/custom/workspace/primitives'
import { buildRegistry } from '@/views/assistants/custom/workspace/tokens'

import { AgentNode, InfoNode, LabelNode, ToolNode } from './StudioNodes'
import StudioEdge from './StudioEdge'
import StudioChat from './StudioChat'
import { AgentForm, InfoForm, ResourcesForm, ToolForm } from './StudioInspector'
import { FIXED, TOOL_KINDS, makeSop, makeTool } from './nodeCatalog'
import { buildGraph, W } from './layout'
import { getDoc, saveDoc } from './store'
import { validateAgent } from './validate'
import { StudioContext } from './context'

const nodeTypes = { agent: AgentNode, tool: ToolNode, info: InfoNode, label: LabelNode }
const edgeTypes = { studio: StudioEdge }

const parseModel = (m) => {
    const paren = m.label.match(/\(([^)]+)\)/)?.[1]
    const head = m.label.replace(/\s*\([^)]*\)/, '').trim()
    return {
        ...m,
        short: paren && !/^(local|vietnamese)$/i.test(paren) ? paren : head,
        provider: m.description?.split('provider: ')[1] || head.split(' ')[0]
    }
}

const ADD_GROUPS = [
    { id: 'knowledge', label: 'Kiến thức', items: [{ kind: 'kb' }] },
    {
        id: 'tools',
        label: 'Công cụ',
        items: [{ kind: 'api' }, { kind: 'deepResearch' }, { kind: 'webBrowser' }, { kind: 'calculator' }, { kind: 'customTool' }]
    },
    { id: 'guide', label: 'Chỉ dẫn', items: [{ kind: 'sop' }] },
    {
        id: 'advanced',
        label: 'Nâng cao · Agentflow',
        items: [
            { kind: 'retrieverAgentflow' },
            { kind: 'httpAgentflow' },
            { kind: 'customFunctionAgentflow' },
            { kind: 'llmAgentflow' },
            { kind: 'executeFlowAgentflow' }
        ]
    }
]

const StudioPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()
    const { setReactFlowInstance } = useContext(flowContext)
    const wrapRef = useRef(null)
    const [rf, setRf] = useState(null)

    const [doc, setDoc] = useState(() => getDoc(id))
    const [stores, setStores] = useState([])
    const [models, setModels] = useState([])
    const [selectedId, setSelectedId] = useState(null)
    const [panel, setPanel] = useState({ open: false, tab: 'config', wide: false })
    const [addMenu, setAddMenu] = useState(null) // { anchor, column }
    const [run, setRun] = useState({ active: null, used: [] })
    const [dragPos, setDragPos] = useState({})
    const [baseline, setBaseline] = useState(null)

    useEffect(() => {
        documentStoreApi.getAllDocumentStores({ page: 1, limit: 50 }).then((r) => setStores(r.data?.data || []))
        assistantsApi.getChatModels().then((r) => setModels((r.data || []).map(parseModel)))
    }, [])

    const toolState = useMemo(
        () =>
            doc && {
                enabled: { collectInfo: true, apiCaller: true },
                collectInfo: { variables: doc.variables },
                apiCaller: { apis: doc.apis },
                guards: doc.settings.guards
            },
        [doc]
    )
    const registry = useMemo(
        () => (doc ? buildRegistry({ toolState, stores, selectedStoreIds: stores.map((s) => s.id) }) : null),
        [doc, toolState, stores]
    )
    const issues = useMemo(() => (doc && registry ? validateAgent({ doc, registry }) : { byNode: {}, list: [] }), [doc, registry])

    const snapshot = useMemo(() => JSON.stringify(doc), [doc])
    useEffect(() => {
        if (doc && baseline === null) setBaseline(snapshot)
    }, [doc, baseline, snapshot])
    const dirty = baseline !== null && snapshot !== baseline

    const graph = useMemo(() => (doc ? buildGraph(doc) : { nodes: [], edges: [] }), [doc])
    const nodes = useMemo(
        () => graph.nodes.map((n) => ({ ...n, position: dragPos[n.id] || n.position, selected: n.id === selectedId })),
        [graph, dragPos, selectedId]
    )
    const edges = useMemo(() => {
        const lit = new Set([...(run.used || []), run.active].filter(Boolean))
        return graph.edges.map((e) => {
            const other = e.source === 'agent' ? e.target : e.source
            return { ...e, data: { ...e.data, active: lit.has(other) && (lit.has('agent') || run.active === other) } }
        })
    }, [graph, run])

    // Live drag positions stay local; on drop the position is written into the doc once.
    const dragRef = useRef({})
    const onNodesChange = useCallback((changes) => {
        changes.forEach((c) => {
            if (c.type !== 'position') return
            if (c.position) {
                dragRef.current[c.id] = c.position
                setDragPos({ ...dragRef.current })
            }
            if (c.dragging === false) {
                const pos = dragRef.current[c.id]
                delete dragRef.current[c.id]
                setDragPos({ ...dragRef.current })
                if (pos)
                    setDoc((d) => ({ ...d, positions: { ...(d.positions || {}), [c.id]: { x: Math.round(pos.x), y: Math.round(pos.y) } } }))
            }
        })
    }, [])

    const focusNode = useCallback(
        (nodeId, keepTab = false) => {
            const nd = graph.nodes.find((x) => x.id === nodeId)
            if (!nd) return
            setSelectedId(nodeId)
            if (!keepTab) setPanel((p) => ({ ...p, open: true, tab: 'config' }))
            const w = nodeId === 'agent' ? W.agent : W.side
            rf?.setCenter(nd.position.x + w / 2 + 200, nd.position.y + 60, { zoom: Math.max(rf.getZoom(), 0.85), duration: 400 })
        },
        [graph, rf]
    )

    const addItem = (kind) => {
        setAddMenu(null)
        if (kind === 'sop') {
            const s = makeSop(doc.sops.length + 1)
            setDoc((d) => ({ ...d, sops: [...d.sops, s] }))
            setSelectedId(`sop:${s.id}`)
        } else {
            const t = makeTool(kind)
            setDoc((d) => ({ ...d, tools: [...d.tools, t] }))
            setSelectedId(`tool:${t.id}`)
        }
        setPanel((p) => ({ ...p, open: true, tab: 'config' }))
    }

    const removeSelected = useCallback(() => {
        if (!selectedId) return
        if (selectedId.startsWith('tool:')) setDoc((d) => ({ ...d, tools: d.tools.filter((t) => `tool:${t.id}` !== selectedId) }))
        if (selectedId.startsWith('sop:')) setDoc((d) => ({ ...d, sops: d.sops.filter((s) => `sop:${s.id}` !== selectedId) }))
        setSelectedId(null)
    }, [selectedId])

    const save = useCallback(() => {
        if (!doc) return
        saveDoc(doc)
        setBaseline(snapshot)
        enqueueSnackbar('Đã lưu trợ lý', { variant: 'success' })
    }, [doc, snapshot, enqueueSnackbar])

    useEffect(() => {
        const onKey = (e) => {
            const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault()
                save()
            } else if (!typing && (e.key === 'Delete' || e.key === 'Backspace') && /^(tool|sop):/.test(selectedId || '')) {
                e.preventDefault()
                removeSelected()
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [save, removeSelected, selectedId])

    const openPanel = (tab) => setPanel((p) => ({ ...p, open: true, tab }))
    const ctx = useMemo(
        () => ({
            doc,
            models,
            registry,
            stores,
            issues: issues.byNode,
            run,
            onAddColumn: (column, anchor) => setAddMenu({ anchor, column })
        }),
        [doc, models, registry, stores, issues, run]
    )

    if (!doc)
        return (
            <Stack alignItems='center' justifyContent='center' spacing={2} sx={{ height: '100vh', bgcolor: 'background.default' }}>
                <Typography variant='h3'>Không tìm thấy trợ lý</Typography>
                <Button variant='contained' onClick={() => navigate('/assistants')}>
                    Về danh sách
                </Button>
            </Stack>
        )

    const nameOf = (nodeId) => {
        if (nodeId === 'agent') return doc.name
        if (FIXED[nodeId]) return FIXED[nodeId].label
        if (nodeId.startsWith('tool:')) return doc.tools.find((t) => `tool:${t.id}` === nodeId)?.name
        if (nodeId.startsWith('sop:')) return doc.sops.find((s) => `sop:${s.id}` === nodeId)?.name
        return nodeId
    }

    const selTool = selectedId?.startsWith('tool:') ? doc.tools.find((t) => `tool:${t.id}` === selectedId) : null
    const selSop = selectedId?.startsWith('sop:') ? selectedId.slice(4) : null
    const panelW = panel.wide ? 720 : 440
    const floatSx = {
        borderRadius: '10px',
        border: `1px solid ${theme.palette.alpha.border}`,
        boxShadow: theme.customShadows?.sm,
        bgcolor: 'background.paper'
    }
    const singleExists = (kind) => TOOL_KINDS[kind]?.single && doc.tools.some((t) => t.kind === kind)
    const menuGroups = ADD_GROUPS.filter(
        (g) => !addMenu?.column || g.id === addMenu.column || (addMenu.column === 'tools' && g.id === 'advanced')
    )
    const noTools = doc.tools.length === 0

    return (
        <StudioContext.Provider value={ctx}>
            <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
                {/* ---------------- header ---------------- */}
                <Stack
                    direction='row'
                    alignItems='center'
                    spacing={1.5}
                    sx={{
                        height: 56,
                        px: 2,
                        flexShrink: 0,
                        borderBottom: `1px solid ${theme.palette.alpha.border}`,
                        bgcolor: 'background.paper'
                    }}
                >
                    <Tooltip title='Về danh sách trợ lý'>
                        <IconButton
                            aria-label='Về danh sách trợ lý'
                            onClick={() => navigate('/assistants')}
                            sx={{ width: 32, height: 32, borderRadius: '6px' }}
                        >
                            <IconArrowLeft size={18} stroke={1.75} />
                        </IconButton>
                    </Tooltip>
                    <Typography variant='body2' color='text.secondary' sx={{ display: { xs: 'none', md: 'block' } }}>
                        Trợ lý /
                    </Typography>
                    <InputBase
                        value={doc.name}
                        onChange={(e) => setDoc((d) => ({ ...d, name: e.target.value }))}
                        inputProps={{ 'aria-label': 'Tên trợ lý', size: Math.max(8, doc.name.length) }}
                        sx={{
                            fontSize: '0.9375rem',
                            fontWeight: 600,
                            px: 0.75,
                            borderRadius: '6px',
                            '&:hover, &.Mui-focused': { bgcolor: theme.palette.alpha.hover },
                            '& input': { p: '4px 0' }
                        }}
                    />
                    {dirty ? (
                        <StatusPill tone='amber' label='Chưa lưu' />
                    ) : doc.status === 'active' ? (
                        <StatusPill tone='emerald' label='Đang hoạt động' />
                    ) : (
                        <StatusPill tone='teal' label='Bản nháp' />
                    )}
                    <Box sx={{ flex: 1 }} />
                    {issues.list.length > 0 ? (
                        <Button
                            size='small'
                            onClick={() => {
                                setSelectedId(null)
                                openPanel('config')
                            }}
                            startIcon={<IconAlertTriangleFilled size={16} />}
                            sx={{ color: theme.palette.mode === 'dark' ? theme.palette.warning.light : theme.palette.warning.dark }}
                        >
                            {issues.list.length} cần xử lý
                        </Button>
                    ) : (
                        <MetaPill tone='emerald'>Sẵn sàng chạy</MetaPill>
                    )}
                    <Divider orientation='vertical' flexItem sx={{ my: 1.5 }} />
                    <Button
                        variant='outlined'
                        startIcon={<IconAdjustmentsHorizontal size={16} stroke={1.75} />}
                        onClick={() => {
                            setSelectedId(null)
                            openPanel('config')
                        }}
                    >
                        Cài đặt
                    </Button>
                    <Button variant='outlined' startIcon={<IconPlayerPlayFilled size={14} />} onClick={() => openPanel('chat')}>
                        Thử
                    </Button>
                    <Button variant='contained' startIcon={<IconDeviceFloppy size={16} stroke={1.75} />} onClick={save} disabled={!dirty}>
                        Lưu
                    </Button>
                </Stack>

                {/* ---------------- canvas ---------------- */}
                <Box ref={wrapRef} sx={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        onInit={(inst) => {
                            setRf(inst)
                            setReactFlowInstance(inst)
                        }}
                        onNodeClick={(_, nd) => {
                            if (nd.type === 'label') return
                            setSelectedId(nd.id)
                            openPanel('config')
                        }}
                        onPaneClick={() => setSelectedId(null)}
                        nodesConnectable={false}
                        fitView
                        fitViewOptions={{ padding: 0.18, maxZoom: 1 }}
                        minZoom={0.3}
                        maxZoom={1.4}
                        deleteKeyCode={null}
                        proOptions={{ hideAttribution: true }}
                    >
                        <Background
                            variant='dots'
                            gap={24}
                            size={1.2}
                            color={alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.12 : 0.16)}
                        />
                        <Controls
                            position='bottom-left'
                            showInteractive={false}
                            className={theme.palette.mode === 'dark' ? 'dark-mode-controls' : ''}
                        />
                        <MiniMap
                            pannable
                            zoomable
                            position='bottom-right'
                            style={{
                                right: panel.open ? panelW + 16 : 16,
                                transition: 'right 240ms ease-out',
                                background: theme.palette.background.paper,
                                border: `1px solid ${theme.palette.alpha.border}`,
                                borderRadius: 10,
                                height: 110,
                                width: 170
                            }}
                            maskColor={alpha(theme.palette.background.default, 0.7)}
                            nodeColor={(nd) => {
                                if (nd.type === 'agent') return theme.palette.primary.main
                                if (nd.type === 'label') return 'transparent'
                                const tool = nd.type === 'tool' ? doc.tools.find((t) => `tool:${t.id}` === nd.id) : null
                                const tone = tool ? TOOL_KINDS[tool.kind]?.tone : FIXED[nd.data?.kind]?.tone
                                return tone ? toneOf(theme, tone).main : alpha(theme.palette.text.primary, 0.35)
                            }}
                            nodeBorderRadius={4}
                        />
                    </ReactFlow>

                    {/* floating toolbar */}
                    <Stack direction='row' spacing={1} sx={{ position: 'absolute', top: 16, left: 16, zIndex: 6 }}>
                        <Button
                            variant='contained'
                            startIcon={<IconPlus size={16} />}
                            onClick={(e) => setAddMenu({ anchor: e.currentTarget, column: null })}
                        >
                            Thêm
                        </Button>
                        <Stack direction='row' sx={{ ...floatSx, p: 0.5 }}>
                            <Tooltip title='Sắp xếp lại'>
                                <IconButton
                                    size='small'
                                    aria-label='Sắp xếp lại'
                                    onClick={() => {
                                        setDoc((d) => ({ ...d, positions: {} }))
                                        setTimeout(() => rf?.fitView({ padding: 0.18, maxZoom: 1, duration: 400 }), 60)
                                    }}
                                >
                                    <IconLayoutDistributeHorizontal size={18} stroke={1.75} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title='Vừa khung nhìn'>
                                <IconButton
                                    size='small'
                                    aria-label='Vừa khung nhìn'
                                    onClick={() => rf?.fitView({ padding: 0.18, maxZoom: 1, duration: 400 })}
                                >
                                    <IconFocus2 size={18} stroke={1.75} />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Stack>

                    <Menu
                        anchorEl={addMenu?.anchor}
                        open={Boolean(addMenu)}
                        onClose={() => setAddMenu(null)}
                        PaperProps={{ sx: { minWidth: 240, maxHeight: '70vh' } }}
                        MenuListProps={{ dense: true }}
                    >
                        {menuGroups.flatMap((g) => [
                            <ListSubheader
                                key={`h-${g.id}`}
                                sx={{
                                    lineHeight: '32px',
                                    fontSize: '0.6875rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                    color: 'text.disabled'
                                }}
                            >
                                {g.label}
                            </ListSubheader>,
                            ...g.items.map(({ kind }) => {
                                const def = kind === 'sop' ? FIXED.sop : TOOL_KINDS[kind]
                                const spec = def.tone ? toneOf(theme, def.tone) : null
                                return (
                                    <MenuItem key={kind} onClick={() => addItem(kind)} disabled={singleExists(kind)}>
                                        <ListItemIcon
                                            sx={{
                                                color: spec ? (theme.palette.mode === 'dark' ? spec.light : spec.dark) : 'text.secondary',
                                                minWidth: '32px !important'
                                            }}
                                        >
                                            <def.Icon size={17} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={def.label}
                                            secondary={singleExists(kind) ? 'Đã thêm' : undefined}
                                            primaryTypographyProps={{ fontSize: '0.875rem' }}
                                        />
                                    </MenuItem>
                                )
                            })
                        ])}
                    </Menu>

                    {noTools && (
                        <Paper
                            elevation={0}
                            sx={{
                                ...floatSx,
                                position: 'absolute',
                                top: 72,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                px: 2.5,
                                py: 1.5,
                                maxWidth: 440,
                                zIndex: 4
                            }}
                        >
                            <Typography variant='body2'>
                                Agent chưa có công cụ nào. Thêm <b>kho tài liệu</b> để agent tự trả lời câu hỏi chung, thêm <b>API</b> để
                                tra dữ liệu thật.
                            </Typography>
                        </Paper>
                    )}

                    {/* sliding panel */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: panelW,
                            maxWidth: '100%',
                            transform: panel.open ? 'none' : 'translateX(100%)',
                            visibility: panel.open ? 'visible' : 'hidden',
                            transition: 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1), width 240ms ease-out, visibility 240ms',
                            bgcolor: 'background.paper',
                            borderLeft: `1px solid ${theme.palette.alpha.border}`,
                            boxShadow: panel.open ? '-12px 0 32px rgba(0,0,0,0.08)' : 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 7
                        }}
                    >
                        <Stack
                            direction='row'
                            alignItems='center'
                            sx={{ pl: 1.5, pr: 1, borderBottom: `1px solid ${theme.palette.alpha.border}`, flexShrink: 0 }}
                        >
                            <Tabs
                                value={panel.tab}
                                onChange={(_, v) => setPanel((p) => ({ ...p, tab: v }))}
                                sx={{
                                    minHeight: 44,
                                    '& .MuiTab-root': {
                                        minHeight: 44,
                                        textTransform: 'none',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: 'text.secondary',
                                        px: 1.5,
                                        '&.Mui-selected': { fontWeight: 600, color: 'text.primary' }
                                    },
                                    '& .MuiTabs-indicator': { height: 2, borderRadius: '2px 2px 0 0', bgcolor: 'primary.main' }
                                }}
                            >
                                <Tab value='config' label={selectedId ? 'Cấu hình' : 'Cài đặt'} />
                                <Tab value='chat' label='Chat thử' />
                            </Tabs>
                            <Box sx={{ flex: 1 }} />
                            <Tooltip title={panel.wide ? 'Thu hẹp' : 'Mở rộng'}>
                                <IconButton
                                    size='small'
                                    aria-label={panel.wide ? 'Thu hẹp panel' : 'Mở rộng panel'}
                                    onClick={() => setPanel((p) => ({ ...p, wide: !p.wide }))}
                                >
                                    {panel.wide ? (
                                        <IconArrowsMinimize size={16} stroke={1.75} />
                                    ) : (
                                        <IconArrowsMaximize size={16} stroke={1.75} />
                                    )}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title='Đóng'>
                                <IconButton size='small' aria-label='Đóng panel' onClick={() => setPanel((p) => ({ ...p, open: false }))}>
                                    <IconX size={18} stroke={1.75} />
                                </IconButton>
                            </Tooltip>
                        </Stack>

                        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', display: panel.tab === 'config' ? 'block' : 'none' }}>
                            {selectedId === 'agent' ? (
                                <AgentForm doc={doc} setDoc={setDoc} models={models} registry={registry} issues={issues.byNode.agent} />
                            ) : selTool ? (
                                <ToolForm
                                    key={selTool.id}
                                    tool={selTool}
                                    doc={doc}
                                    setDoc={setDoc}
                                    stores={stores}
                                    onRemove={removeSelected}
                                    issues={issues.byNode[selectedId]}
                                />
                            ) : selSop || ['channels', 'profile', 'guard', 'handoff'].includes(selectedId) ? (
                                <InfoForm
                                    key={selectedId}
                                    kind={selSop ? 'sop' : selectedId}
                                    refId={selSop}
                                    doc={doc}
                                    setDoc={setDoc}
                                    registry={registry}
                                    issues={issues.byNode[selectedId]}
                                    onRemove={removeSelected}
                                />
                            ) : (
                                <ResourcesForm doc={doc} setDoc={setDoc} issueList={issues.list} onSelectNode={focusNode} nameOf={nameOf} />
                            )}
                        </Box>
                        <Box sx={{ flex: 1, minHeight: 0, display: panel.tab === 'chat' ? 'flex' : 'none', flexDirection: 'column' }}>
                            {stores.length ? (
                                <StudioChat doc={doc} stores={stores} onRun={setRun} onSelectNode={(nid) => focusNode(nid, true)} />
                            ) : (
                                <Stack alignItems='center' justifyContent='center' sx={{ flex: 1 }}>
                                    <CircularProgress size={24} />
                                </Stack>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </StudioContext.Provider>
    )
}

export default StudioPage
