import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useUrlTabState from '@/hooks/useUrlTabState'

// material-ui
import { alpha, useTheme } from '@mui/material/styles'
import {
    Avatar,
    Box,
    Button,
    Chip,
    Divider,
    IconButton,
    InputAdornment,
    Menu,
    MenuItem,
    OutlinedInput,
    Select,
    Stack,
    Tab,
    Table,
    TableBody,
    TableHead,
    TableRow,
    Tabs,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography
} from '@mui/material'
import {
    IconAddressBook,
    IconBookmark,
    IconChevronDown,
    IconEdit,
    IconFilterOff,
    IconLayoutKanban,
    IconPlus,
    IconSearch,
    IconSettings,
    IconChartDots,
    IconTable,
    IconTrash,
    IconUsersGroup,
    IconX
} from '@tabler/icons-react'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'
import TablePagination, { DEFAULT_ITEMS_PER_PAGE } from '@/ui-component/pagination/TablePagination'
import { SharedTableCell, SharedTableRow, SharedTableContainer, StatusDot } from '@/ui-component/table/SharedTable'
import { useLanguage } from '@/store/context/LanguageContext'
import useConfirm from '@/hooks/useConfirm'
import useSavedViews from '@/hooks/useSavedViews'
import CustomerFormDialog from './CustomerFormDialog'
import SettingsDialog from './SettingsDialog'
import PipelineBoard from './PipelineBoard'
import AtlasInsightTab from './AtlasInsightTab'
import { getAvatarColorKey, getInitials, tintBg, tintText } from './utils'
import { mockAttributeDefs, mockCustomerTypes, mockCustomers } from './mockCustomers'

const ICON_STROKE = 1.75

const STAGE_TONES = ['teal', 'amber', 'orange', 'emerald', 'rose']
const stageTone = (idx, total) => (total > 0 ? STAGE_TONES[Math.min(idx, STAGE_TONES.length - 1)] : 'teal')

const Customers = () => {
    const navigate = useNavigate()
    const { t } = useLanguage()
    const theme = useTheme()
    const { confirm } = useConfirm()

    const [customers, setCustomers] = useState(mockCustomers)
    const [attributeDefs, setAttributeDefs] = useState(mockAttributeDefs)
    const [customerTypes, setCustomerTypes] = useState(mockCustomerTypes)

    const [pageTab, setPageTab] = useUrlTabState('tab', ['list', 'atlas'])
    const [search, setSearch] = useState('')
    const [view, setView] = useState('table')
    const [filters, setFilters] = useState([])
    const [filterAnchor, setFilterAnchor] = useState(null)
    const [savedAnchor, setSavedAnchor] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState(null)
    const [showSettings, setShowSettings] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageLimit, setPageLimit] = useState(DEFAULT_ITEMS_PER_PAGE)

    const { views: savedViews, saveView, deleteView } = useSavedViews('gtech.filters.customers', [])

    const alphaBorder = theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08)
    const alphaHairline = theme.palette.alpha?.divider || alpha(theme.palette.text.primary, 0.06)

    const filterFields = useMemo(
        () => [
            {
                id: '__typeId',
                label: t('Loại KH'),
                kind: 'select',
                options: customerTypes.map((tp) => ({ value: tp.id, label: t(tp.name) }))
            },
            {
                id: '__tag',
                label: t('Nhãn'),
                kind: 'select',
                options: ['VIP', 'Khiếu nại', 'Đại lý', 'Đơn lớn', 'Mới'].map((v) => ({ value: v, label: t(v) }))
            },
            ...attributeDefs.map((attr) => ({
                id: attr.id,
                label: t(attr.label),
                kind: attr.type === 'checkbox' ? 'checkbox' : attr.type === 'select' || attr.type === 'multiselect' ? 'select' : 'text',
                options: (attr.options || []).map((o) => ({ value: o, label: t(o) }))
            }))
        ],
        [customerTypes, attributeDefs, t]
    )

    const matchesFilter = (customer, filter) => {
        if (!filter.fieldId || filter.value === '' || filter.value === undefined) return true
        if (filter.fieldId === '__typeId') return customer.typeId === filter.value
        if (filter.fieldId === '__tag') return (customer.tags || []).includes(filter.value)
        const attr = attributeDefs.find((a) => a.id === filter.fieldId)
        if (!attr) return true
        const value = customer.attributes[filter.fieldId]
        if (attr.type === 'checkbox') return String(!!value) === filter.value
        if (attr.type === 'multiselect') return Array.isArray(value) && value.includes(filter.value)
        if (attr.type === 'select') return value === filter.value
        return String(value || '')
            .toLowerCase()
            .includes(String(filter.value).toLowerCase())
    }

    const filteredCustomers = useMemo(() => {
        const term = search.trim().toLowerCase()
        return customers.filter((c) => {
            if (term && !c.name.toLowerCase().includes(term) && !c.email.toLowerCase().includes(term)) return false
            return filters.every((f) => matchesFilter(c, f))
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customers, search, filters])

    const pagedCustomers = useMemo(
        () => filteredCustomers.slice((currentPage - 1) * pageLimit, currentPage * pageLimit),
        [filteredCustomers, currentPage, pageLimit]
    )

    const typeById = (id) => customerTypes.find((tp) => tp.id === id)
    const stageInfo = (customer) => {
        const type = typeById(customer.typeId)
        const stageIndex = type?.stages.findIndex((s) => s.id === customer.stageId) ?? -1
        return {
            label: t(type?.stages[stageIndex]?.label) || '—',
            tone: stageTone(stageIndex, type?.stages.length || 0)
        }
    }

    const addFilter = (fieldId) => {
        setFilters((prev) => [...prev, { fieldId, value: '' }])
        setFilterAnchor(null)
    }
    const updateFilterValue = (index, value) => setFilters((prev) => prev.map((f, i) => (i === index ? { ...f, value } : f)))
    const removeFilter = (index) => setFilters((prev) => prev.filter((_, i) => i !== index))

    const handleSaveCustomer = (form) => {
        if (editingCustomer) {
            setCustomers((prev) => prev.map((c) => (c.id === editingCustomer.id ? { ...form, id: c.id } : c)))
        } else {
            setCustomers((prev) => [
                ...prev,
                { ...form, id: `c-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10), lastContactAt: '—' }
            ])
        }
        setShowForm(false)
        setEditingCustomer(null)
    }

    const handleDeleteCustomer = async (customer) => {
        const isConfirmed = await confirm({
            title: t('Xoá khách hàng'),
            description: t('Xoá {name}?', { name: customer.name }),
            confirmButtonName: t('Xoá'),
            cancelButtonName: t('Huỷ')
        })
        if (isConfirmed) setCustomers((prev) => prev.filter((c) => c.id !== customer.id))
    }

    const handleSaveCurrentView = () => {
        const name = window.prompt(t('Tên bộ lọc'))
        if (name && name.trim()) saveView(name.trim(), { filters, search })
    }

    const handleApplySavedView = (v) => {
        setFilters(v.payload?.filters || [])
        setSearch(v.payload?.search || '')
        setSavedAnchor(null)
        setCurrentPage(1)
    }

    const renderTable = () => (
        <SharedTableContainer>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <SharedTableCell>{t('Khách hàng')}</SharedTableCell>
                        <SharedTableCell>{t('Loại')}</SharedTableCell>
                        <SharedTableCell>{t('Giai đoạn')}</SharedTableCell>
                        <SharedTableCell>{t('Liên hệ')}</SharedTableCell>
                        <SharedTableCell>{t('Nhãn')}</SharedTableCell>
                        <SharedTableCell align='right'>{t('Hành động')}</SharedTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {pagedCustomers.map((c) => {
                        const stage = stageInfo(c)
                        const colorKey = getAvatarColorKey(c.name)
                        return (
                            <SharedTableRow
                                key={c.id}
                                interactive
                                hover
                                onClick={() => navigate(`/customers/${c.id}`)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') navigate(`/customers/${c.id}`)
                                }}
                                tabIndex={0}
                            >
                                <SharedTableCell>
                                    <Stack direction='row' spacing={1.25} alignItems='center'>
                                        <Avatar
                                            sx={{
                                                width: 28,
                                                height: 28,
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                bgcolor: tintBg(theme, theme.palette[colorKey].main, 0.15, 0.24),
                                                color: tintText(theme, theme.palette[colorKey])
                                            }}
                                        >
                                            {getInitials(c.name)}
                                        </Avatar>
                                        <Typography variant='body2' sx={{ fontWeight: 500 }}>
                                            {c.name}
                                        </Typography>
                                    </Stack>
                                </SharedTableCell>
                                <SharedTableCell>
                                    <Typography variant='body2' color='text.secondary'>
                                        {t(typeById(c.typeId)?.name)}
                                    </Typography>
                                </SharedTableCell>
                                <SharedTableCell>
                                    <Stack direction='row' spacing={0.75} alignItems='center'>
                                        <StatusDot tone={stage.tone} size={7} />
                                        <Typography variant='body2'>{stage.label}</Typography>
                                    </Stack>
                                </SharedTableCell>
                                <SharedTableCell>
                                    <Stack spacing={0.25}>
                                        <Typography variant='body2'>{c.email}</Typography>
                                        <Typography variant='caption' color='text.secondary'>
                                            {c.phone}
                                        </Typography>
                                    </Stack>
                                </SharedTableCell>
                                <SharedTableCell>
                                    <Stack direction='row' spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                                        {c.tags.map((tag) => (
                                            <Chip key={tag} size='small' variant='outlined' label={t(tag)} sx={{ height: 20 }} />
                                        ))}
                                    </Stack>
                                </SharedTableCell>
                                <SharedTableCell align='right' onClick={(e) => e.stopPropagation()}>
                                    <Tooltip title={t('Chỉnh sửa')}>
                                        <IconButton
                                            size='small'
                                            aria-label={t('Chỉnh sửa {name}', { name: c.name })}
                                            onClick={() => {
                                                setEditingCustomer(c)
                                                setShowForm(true)
                                            }}
                                        >
                                            <IconEdit size={16} stroke={ICON_STROKE} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t('Xoá')}>
                                        <IconButton
                                            size='small'
                                            aria-label={t('Xoá {name}', { name: c.name })}
                                            onClick={() => handleDeleteCustomer(c)}
                                            sx={{
                                                color: 'text.secondary',
                                                '&:hover': {
                                                    color: 'error.main',
                                                    bgcolor: tintBg(theme, theme.palette.error.main, 0.08, 0.16)
                                                }
                                            }}
                                        >
                                            <IconTrash size={16} stroke={ICON_STROKE} />
                                        </IconButton>
                                    </Tooltip>
                                </SharedTableCell>
                            </SharedTableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </SharedTableContainer>
    )

    const renderFilterBar = () => {
        const activeFieldIds = filters.map((f) => f.fieldId)
        const available = filterFields.filter((f) => !activeFieldIds.includes(f.id))
        return (
            <Stack direction='row' alignItems='center' spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {filters.map((filter, index) => {
                    const field = filterFields.find((f) => f.id === filter.fieldId)
                    if (!field) return null
                    return (
                        <Box
                            key={`${filter.fieldId}-${index}`}
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'stretch',
                                height: 30,
                                borderRadius: '6px',
                                border: `1px solid ${alphaBorder}`,
                                bgcolor: theme.palette.background.paper,
                                overflow: 'hidden'
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    px: 1.25,
                                    fontWeight: 600,
                                    color: 'text.secondary',
                                    bgcolor: alpha(theme.palette.text.primary, 0.03),
                                    fontSize: 12
                                }}
                            >
                                {field.label}
                            </Box>
                            {field.kind === 'select' && (
                                <Select
                                    value={filter.value}
                                    onChange={(e) => updateFilterValue(index, e.target.value)}
                                    displayEmpty
                                    variant='standard'
                                    disableUnderline
                                    aria-label={field.label}
                                    IconComponent={IconChevronDown}
                                    sx={{
                                        minWidth: 110,
                                        '& .MuiSelect-select': {
                                            py: 0.5,
                                            pl: 1,
                                            pr: '24px !important',
                                            color: filter.value ? 'text.primary' : 'text.disabled'
                                        },
                                        '& .MuiSelect-icon': {
                                            right: 4,
                                            color: 'text.disabled',
                                            width: 16,
                                            height: 16,
                                            top: 'calc(50% - 8px)'
                                        }
                                    }}
                                >
                                    <MenuItem value='' sx={{ color: 'text.disabled' }}>
                                        {t('Chọn giá trị')}
                                    </MenuItem>
                                    {field.options.map((o) => (
                                        <MenuItem key={o.value} value={o.value}>
                                            {o.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                            {field.kind === 'checkbox' && (
                                <Select
                                    value={filter.value}
                                    onChange={(e) => updateFilterValue(index, e.target.value)}
                                    displayEmpty
                                    variant='standard'
                                    disableUnderline
                                    aria-label={field.label}
                                    IconComponent={IconChevronDown}
                                    sx={{
                                        minWidth: 90,
                                        '& .MuiSelect-select': {
                                            py: 0.5,
                                            pl: 1,
                                            pr: '24px !important',
                                            color: filter.value ? 'text.primary' : 'text.disabled'
                                        },
                                        '& .MuiSelect-icon': {
                                            right: 4,
                                            color: 'text.disabled',
                                            width: 16,
                                            height: 16,
                                            top: 'calc(50% - 8px)'
                                        }
                                    }}
                                >
                                    <MenuItem value='' sx={{ color: 'text.disabled' }}>
                                        —
                                    </MenuItem>
                                    <MenuItem value='true'>{t('Có')}</MenuItem>
                                    <MenuItem value='false'>{t('Không')}</MenuItem>
                                </Select>
                            )}
                            {field.kind === 'text' && (
                                <Box
                                    component='input'
                                    value={filter.value}
                                    onChange={(e) => updateFilterValue(index, e.target.value)}
                                    placeholder={t('Nhập...')}
                                    aria-label={field.label}
                                    sx={{
                                        border: 0,
                                        background: 'transparent',
                                        px: 1,
                                        py: 0.5,
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        width: 140,
                                        color: 'text.primary',
                                        '&::placeholder': { color: 'text.disabled' }
                                    }}
                                />
                            )}
                            <IconButton
                                size='small'
                                onClick={() => removeFilter(index)}
                                aria-label={t('Bỏ lọc')}
                                sx={{ borderRadius: 0, borderLeft: `1px solid ${alphaBorder}`, px: 0.75 }}
                            >
                                <IconX size={13} stroke={ICON_STROKE} />
                            </IconButton>
                        </Box>
                    )
                })}

                <Button
                    size='small'
                    startIcon={<IconPlus size={14} stroke={ICON_STROKE} />}
                    onClick={(e) => setFilterAnchor(e.currentTarget)}
                    sx={{
                        height: 30,
                        color: 'text.secondary',
                        borderRadius: '6px',
                        border: `1px dashed ${theme.palette.alpha?.borderStrong || alpha(theme.palette.text.primary, 0.2)}`,
                        px: 1.25,
                        fontWeight: 500,
                        '&:hover': {
                            borderColor: theme.palette.primary.main,
                            color: 'primary.main',
                            bgcolor: alpha(theme.palette.primary.main, 0.04)
                        }
                    }}
                >
                    {t('Thêm điều kiện')}
                </Button>

                <Menu
                    anchorEl={filterAnchor}
                    open={Boolean(filterAnchor)}
                    onClose={() => setFilterAnchor(null)}
                    PaperProps={{ sx: { minWidth: 220, borderRadius: '10px' } }}
                >
                    {available.length === 0 ? (
                        <MenuItem disabled>{t('Đã hết thuộc tính')}</MenuItem>
                    ) : (
                        available.map((f) => (
                            <MenuItem key={f.id} onClick={() => addFilter(f.id)}>
                                {f.label}
                            </MenuItem>
                        ))
                    )}
                </Menu>

                {filters.length > 0 && (
                    <Button
                        size='small'
                        startIcon={<IconFilterOff size={13} stroke={ICON_STROKE} />}
                        onClick={() => setFilters([])}
                        sx={{ color: 'text.secondary' }}
                    >
                        {t('Xoá lọc')}
                    </Button>
                )}

                <Box sx={{ flex: 1 }} />

                <Button
                    size='small'
                    startIcon={<IconBookmark size={14} stroke={ICON_STROKE} />}
                    onClick={(e) => setSavedAnchor(e.currentTarget)}
                    sx={{ color: 'text.secondary' }}
                >
                    {t('Bộ lọc đã lưu')}
                    {savedViews.length > 0 && ` (${savedViews.length})`}
                </Button>

                <Menu
                    anchorEl={savedAnchor}
                    open={Boolean(savedAnchor)}
                    onClose={() => setSavedAnchor(null)}
                    PaperProps={{ sx: { minWidth: 240, borderRadius: '10px' } }}
                >
                    <MenuItem
                        onClick={() => {
                            setSavedAnchor(null)
                            handleSaveCurrentView()
                        }}
                        disabled={filters.length === 0 && !search}
                    >
                        <IconPlus size={14} stroke={ICON_STROKE} style={{ marginRight: 8 }} />
                        {t('Lưu bộ lọc hiện tại')}
                    </MenuItem>
                    {savedViews.length > 0 && <Divider />}
                    {savedViews.map((v) => (
                        <MenuItem
                            key={v.name}
                            onClick={() => handleApplySavedView(v)}
                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                            <Box sx={{ flex: 1 }}>{v.name}</Box>
                            <IconButton
                                size='small'
                                onClick={(e) => {
                                    e.stopPropagation()
                                    deleteView(v.name)
                                }}
                                aria-label={t('Xoá')}
                                sx={{ p: 0.5 }}
                            >
                                <IconTrash size={13} stroke={ICON_STROKE} />
                            </IconButton>
                        </MenuItem>
                    ))}
                </Menu>
            </Stack>
        )
    }

    return (
        <MainCard border={false} sx={{ background: 'transparent' }} contentSX={{ p: 0, '&:last-child': { pb: 0 } }}>
            <Tabs
                value={pageTab}
                onChange={(_, v) => setPageTab(v)}
                sx={{
                    borderBottom: `1px solid ${alphaHairline}`,
                    minHeight: 44,
                    mb: 3,
                    '& .MuiTab-root': {
                        minHeight: 44,
                        textTransform: 'none',
                        fontWeight: 500,
                        color: 'text.secondary',
                        px: 2,
                        '&.Mui-selected': { fontWeight: 600, color: 'primary.main' }
                    },
                    '& .MuiTabs-indicator': { height: 2, borderRadius: '2px 2px 0 0' }
                }}
            >
                <Tab icon={<IconAddressBook size={16} stroke={ICON_STROKE} />} iconPosition='start' label={t('Danh sách khách hàng')} />
                <Tab icon={<IconChartDots size={16} stroke={ICON_STROKE} />} iconPosition='start' label={t('Phân tích')} />
            </Tabs>

            {pageTab === 1 && <AtlasInsightTab />}

            {pageTab === 0 && (
                <Stack spacing={2}>
                    <ViewHeader
                        title='Khách hàng'
                        count={
                            filteredCustomers.length !== customers.length
                                ? `${filteredCustomers.length} / ${customers.length}`
                                : filteredCustomers.length
                        }
                    >
                        <Stack direction='row' spacing={1} alignItems='center'>
                            <OutlinedInput
                                size='small'
                                placeholder={t('Tìm theo tên hoặc email...')}
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value)
                                    setCurrentPage(1)
                                }}
                                startAdornment={
                                    <InputAdornment position='start' sx={{ color: 'text.secondary' }}>
                                        <IconSearch size={16} stroke={ICON_STROKE} />
                                    </InputAdornment>
                                }
                                sx={{ width: 280, height: 36 }}
                            />
                            <Tooltip title={t('Cấu hình khách hàng')}>
                                <IconButton
                                    onClick={() => setShowSettings(true)}
                                    aria-label={t('Cấu hình')}
                                    sx={{ width: 36, height: 36, borderRadius: '6px', border: `1px solid ${alphaBorder}` }}
                                >
                                    <IconSettings size={17} stroke={ICON_STROKE} />
                                </IconButton>
                            </Tooltip>
                            <Button
                                variant='contained'
                                startIcon={<IconPlus size={16} stroke={ICON_STROKE} />}
                                onClick={() => {
                                    setEditingCustomer(null)
                                    setShowForm(true)
                                }}
                            >
                                {t('Thêm khách hàng')}
                            </Button>
                        </Stack>
                    </ViewHeader>

                    <Box
                        sx={{
                            position: 'sticky',
                            top: 0,
                            zIndex: 3,
                            py: 1.25,
                            bgcolor: theme.palette.background.default,
                            borderBottom: `1px solid ${alphaHairline}`
                        }}
                    >
                        <Stack direction='row' alignItems='center' spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
                            <ToggleButtonGroup
                                size='small'
                                value={view}
                                exclusive
                                onChange={(_, v) => v && setView(v)}
                                sx={{
                                    height: 30,
                                    '& .MuiToggleButton-root': {
                                        px: 1.25,
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        gap: 0.5,
                                        borderRadius: '6px'
                                    }
                                }}
                            >
                                <ToggleButton value='table'>
                                    <IconTable size={14} stroke={ICON_STROKE} /> {t('Bảng')}
                                </ToggleButton>
                                <ToggleButton value='kanban'>
                                    <IconLayoutKanban size={14} stroke={ICON_STROKE} /> {t('Kanban')}
                                </ToggleButton>
                            </ToggleButtonGroup>
                            <Divider orientation='vertical' flexItem sx={{ height: 22, alignSelf: 'center' }} />
                            <Box sx={{ flex: 1, minWidth: 0 }}>{renderFilterBar()}</Box>
                        </Stack>
                    </Box>

                    {view === 'table' &&
                        (filteredCustomers.length === 0 ? (
                            <Box sx={{ p: 8, textAlign: 'center', color: 'text.secondary' }}>
                                <IconUsersGroup size={40} stroke={ICON_STROKE} style={{ opacity: 0.3, marginBottom: 12 }} />
                                <Typography>{t('Không tìm thấy khách hàng phù hợp')}</Typography>
                            </Box>
                        ) : (
                            <>
                                {renderTable()}
                                <TablePagination
                                    currentPage={currentPage}
                                    limit={pageLimit}
                                    total={filteredCustomers.length}
                                    onChange={(page, limit) => {
                                        setCurrentPage(page)
                                        setPageLimit(limit)
                                    }}
                                />
                            </>
                        ))}

                    {view === 'kanban' && (
                        <PipelineBoard
                            customers={filteredCustomers}
                            customerTypes={customerTypes}
                            onOpenCustomer={(id) => navigate(`/customers/${id}`)}
                            onMoveCustomer={(id, stageId) => setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, stageId } : c)))}
                        />
                    )}
                </Stack>
            )}

            <CustomerFormDialog
                show={showForm}
                customer={editingCustomer}
                customerTypes={customerTypes}
                attributeDefs={attributeDefs}
                onCancel={() => {
                    setShowForm(false)
                    setEditingCustomer(null)
                }}
                onSave={handleSaveCustomer}
            />

            <SettingsDialog
                show={showSettings}
                attributeDefs={attributeDefs}
                customerTypes={customerTypes}
                onCancel={() => setShowSettings(false)}
                onSave={({ attributeDefs: newAttrs, customerTypes: newTypes }) => {
                    setAttributeDefs(newAttrs)
                    setCustomerTypes(newTypes)
                    setShowSettings(false)
                }}
            />

            <ConfirmDialog />
        </MainCard>
    )
}

export default Customers
