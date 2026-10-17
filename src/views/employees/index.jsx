import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useUrlTabState from '@/hooks/useUrlTabState'
import useSavedViews from '@/hooks/useSavedViews'

import { alpha, useTheme } from '@mui/material/styles'
import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
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
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography
} from '@mui/material'
import {
    IconBookmark,
    IconChevronDown,
    IconEdit,
    IconFilterOff,
    IconLayoutKanban,
    IconLock,
    IconPlus,
    IconSearch,
    IconSettings,
    IconShieldLock,
    IconTable,
    IconTrash,
    IconUserPlus,
    IconUsers,
    IconUsersGroup,
    IconX
} from '@tabler/icons-react'

import MainCard from '@/ui-component/cards/MainCard'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'
import TablePagination, { DEFAULT_ITEMS_PER_PAGE } from '@/ui-component/pagination/TablePagination'
import { SharedTableCell, SharedTableContainer, SharedTableRow, StatusDot } from '@/ui-component/table/SharedTable'
import { useLanguage } from '@/store/context/LanguageContext'
import useConfirm from '@/hooks/useConfirm'
import { getAvatarColorKey, getInitials } from '@/views/customers/utils'
import EmployeeFormDialog from './EmployeeFormDialog'
import EmployeeKanban from './EmployeeKanban'
import EmployeeSettingsDialog from './EmployeeSettingsDialog'
import RoleBuilderDialog from './RoleBuilderDialog'
import TeamFormDialog from './TeamFormDialog'
import TeamsTab from './TeamsTab'
import { mockEmployees, mockRoles, mockTeams } from './mockEmployees'

const ICON_STROKE = 1.75

const STATUS_TONE = { active: 'emerald', invited: 'amber', disabled: 'rose' }
const STATUS_LABEL = { active: 'Đang hoạt động', invited: 'Đã mời', disabled: 'Vô hiệu' }

const Employees = () => {
    const navigate = useNavigate()
    const { t } = useLanguage()
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const { confirm } = useConfirm()

    const [tab, setTab] = useUrlTabState('tab', ['list', 'teams', 'roles'])
    const [employees, setEmployees] = useState(mockEmployees)
    const [roles, setRoles] = useState(mockRoles)
    const [teams, setTeams] = useState(mockTeams)
    const [attributeDefs, setAttributeDefs] = useState([])

    const [search, setSearch] = useState('')
    const [view, setView] = useState('table')
    const [filters, setFilters] = useState([])
    const [filterAnchor, setFilterAnchor] = useState(null)
    const [savedAnchor, setSavedAnchor] = useState(null)
    const [saveDialogOpen, setSaveDialogOpen] = useState(false)
    const [saveName, setSaveName] = useState('')

    const [currentPage, setCurrentPage] = useState(1)
    const [pageLimit, setPageLimit] = useState(DEFAULT_ITEMS_PER_PAGE)

    const [showEmployeeForm, setShowEmployeeForm] = useState(false)
    const [editingEmployee, setEditingEmployee] = useState(null)
    const [showRoleBuilder, setShowRoleBuilder] = useState(false)
    const [editingRole, setEditingRole] = useState(null)
    const [showTeamForm, setShowTeamForm] = useState(false)
    const [editingTeam, setEditingTeam] = useState(null)
    const [showSettings, setShowSettings] = useState(false)

    const { views: savedViews, saveView, deleteView } = useSavedViews('gtech.filters.employees', [])

    const alphaBorder = theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08)
    const alphaHairline = theme.palette.alpha?.divider || alpha(theme.palette.text.primary, 0.06)

    const departments = useMemo(() => Array.from(new Set(employees.map((e) => e.department).filter(Boolean))), [employees])

    const filterFields = useMemo(
        () => [
            { id: '__department', label: t('Phòng ban'), kind: 'select', options: departments.map((d) => ({ value: d, label: d })) },
            { id: '__role', label: t('Vai trò'), kind: 'select', options: roles.map((r) => ({ value: r.id, label: r.name })) },
            {
                id: '__status',
                label: t('Trạng thái'),
                kind: 'select',
                options: [
                    { value: 'active', label: t('Đang hoạt động') },
                    { value: 'invited', label: t('Đã mời') },
                    { value: 'disabled', label: t('Vô hiệu') }
                ]
            },
            { id: '__joinedFrom', label: t('Ngày vào ≥'), kind: 'text' },
            { id: '__joinedTo', label: t('Ngày vào ≤'), kind: 'text' },
            { id: '__team', label: t('Nhóm'), kind: 'select', options: teams.map((tm) => ({ value: tm.id, label: tm.name })) },
            ...attributeDefs.map((attr) => ({
                id: attr.id,
                label: attr.label,
                kind: attr.type === 'checkbox' ? 'checkbox' : attr.type === 'select' || attr.type === 'multiselect' ? 'select' : 'text',
                options: (attr.options || []).map((o) => ({ value: o, label: o }))
            }))
        ],
        [departments, roles, teams, attributeDefs, t]
    )

    const matchesFilter = (employee, filter) => {
        if (!filter.fieldId || filter.value === '' || filter.value === undefined) return true
        switch (filter.fieldId) {
            case '__department':
                return employee.department === filter.value
            case '__role':
                return employee.roleId === filter.value
            case '__status':
                return employee.status === filter.value
            case '__joinedFrom':
                return employee.joinedOn && employee.joinedOn !== '—' && employee.joinedOn >= filter.value
            case '__joinedTo':
                return employee.joinedOn && employee.joinedOn !== '—' && employee.joinedOn <= filter.value
            case '__team': {
                const team = teams.find((tm) => tm.id === filter.value)
                return team ? team.memberIds.includes(employee.id) : true
            }
            default: {
                const attr = attributeDefs.find((a) => a.id === filter.fieldId)
                if (!attr) return true
                const value = employee.attributes?.[filter.fieldId]
                if (attr.type === 'checkbox') return String(!!value) === filter.value
                if (attr.type === 'multiselect') return Array.isArray(value) && value.includes(filter.value)
                if (attr.type === 'select') return value === filter.value
                return String(value || '')
                    .toLowerCase()
                    .includes(String(filter.value).toLowerCase())
            }
        }
    }

    const filteredEmployees = useMemo(() => {
        const term = search.trim().toLowerCase()
        return employees.filter((e) => {
            if (term && !e.name.toLowerCase().includes(term) && !(e.email || '').toLowerCase().includes(term)) return false
            return filters.every((f) => matchesFilter(e, f))
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employees, search, filters])

    const pagedEmployees = useMemo(
        () => filteredEmployees.slice((currentPage - 1) * pageLimit, currentPage * pageLimit),
        [filteredEmployees, currentPage, pageLimit]
    )

    const roleById = (id) => roles.find((r) => r.id === id)
    const teamCountFor = (id) => teams.filter((tm) => tm.memberIds.includes(id)).length
    const deleteButtonSx = {
        color: 'text.secondary',
        '&:hover': { color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.08) }
    }

    const addFilter = (fieldId) => {
        setFilters((prev) => [...prev, { fieldId, value: '' }])
        setFilterAnchor(null)
    }
    const updateFilterValue = (index, value) => setFilters((prev) => prev.map((f, i) => (i === index ? { ...f, value } : f)))
    const removeFilter = (index) => setFilters((prev) => prev.filter((_, i) => i !== index))

    const applySavedView = (v) => {
        setFilters(v.payload?.filters || [])
        setSearch(v.payload?.search || '')
        setView(v.payload?.view || 'table')
        setSavedAnchor(null)
    }

    const commitSaveView = () => {
        const name = saveName.trim()
        if (!name) return
        saveView(name, { filters, search, view })
        setSaveName('')
        setSaveDialogOpen(false)
    }

    const handleSaveEmployee = (form) => {
        if (editingEmployee) {
            setEmployees((prev) => prev.map((e) => (e.id === editingEmployee.id ? { ...form, id: e.id } : e)))
        } else {
            setEmployees((prev) => [
                ...prev,
                { ...form, id: `e-${Date.now()}`, joinedOn: form.status === 'active' ? new Date().toISOString().slice(0, 10) : '—' }
            ])
        }
        setShowEmployeeForm(false)
        setEditingEmployee(null)
    }

    const handleDeleteEmployee = async (employee) => {
        const isConfirmed = await confirm({
            title: t('Xoá nhân viên'),
            description: t('Xoá {name}?', { name: employee.name }),
            confirmButtonName: t('Xoá'),
            cancelButtonName: t('Huỷ')
        })
        if (isConfirmed) setEmployees((prev) => prev.filter((e) => e.id !== employee.id))
    }

    const handleMoveEmployee = (id, department) => {
        setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, department } : e)))
    }

    const handleSaveTeam = (team) => {
        setTeams((prev) => {
            const exists = prev.some((tm) => tm.id === team.id)
            return exists ? prev.map((tm) => (tm.id === team.id ? team : tm)) : [...prev, team]
        })
        setShowTeamForm(false)
        setEditingTeam(null)
    }

    const handleDeleteTeam = async (team) => {
        const isConfirmed = await confirm({
            title: t('Xoá nhóm'),
            description: t('Xoá nhóm {name}?', { name: team.name }),
            confirmButtonName: t('Xoá'),
            cancelButtonName: t('Huỷ')
        })
        if (isConfirmed) setTeams((prev) => prev.filter((tm) => tm.id !== team.id))
    }

    const handleSaveRole = (role) => {
        setRoles((prev) => {
            const exists = prev.some((r) => r.id === role.id)
            return exists ? prev.map((r) => (r.id === role.id ? role : r)) : [...prev, role]
        })
        setShowRoleBuilder(false)
        setEditingRole(null)
    }

    const handleDeleteRole = async (role) => {
        const inUse = employees.some((e) => e.roleId === role.id)
        if (inUse) {
            await confirm({
                title: t('Không thể xoá vai trò'),
                description: t('Vai trò này đang được gán cho nhân viên. Hãy gán lại trước khi xoá.'),
                confirmButtonName: t('OK'),
                cancelButtonName: null
            })
            return
        }
        const isConfirmed = await confirm({
            title: t('Xoá vai trò'),
            description: t('Xoá vai trò {name}?', { name: role.name }),
            confirmButtonName: t('Xoá'),
            cancelButtonName: t('Huỷ')
        })
        if (isConfirmed) setRoles((prev) => prev.filter((r) => r.id !== role.id))
    }

    const renderTable = () => (
        <SharedTableContainer>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <SharedTableCell>{t('Nhân viên')}</SharedTableCell>
                        <SharedTableCell>{t('Email')}</SharedTableCell>
                        <SharedTableCell>{t('Chức vụ')}</SharedTableCell>
                        <SharedTableCell>{t('Phòng ban')}</SharedTableCell>
                        <SharedTableCell>{t('Vai trò')}</SharedTableCell>
                        <SharedTableCell>{t('Trạng thái')}</SharedTableCell>
                        <SharedTableCell numeric>{t('Nhóm')}</SharedTableCell>
                        <SharedTableCell numeric>{t('Ngày vào')}</SharedTableCell>
                        <SharedTableCell align='right'>{t('Thao tác')}</SharedTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {pagedEmployees.map((e) => {
                        const colorKey = getAvatarColorKey(e.name)
                        const role = roleById(e.roleId)
                        const statusTone = STATUS_TONE[e.status] || 'teal'
                        return (
                            <SharedTableRow
                                key={e.id}
                                interactive
                                hover
                                onClick={() => navigate(`/employees/${e.id}`)}
                                onKeyDown={(ev) => {
                                    if (ev.key === 'Enter') navigate(`/employees/${e.id}`)
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
                                                bgcolor: alpha(theme.palette[colorKey].main, isDark ? 0.24 : 0.15),
                                                color: isDark ? theme.palette[colorKey].light : theme.palette[colorKey].dark
                                            }}
                                        >
                                            {getInitials(e.name)}
                                        </Avatar>
                                        <Typography variant='body2' sx={{ fontWeight: 500 }} noWrap>
                                            {e.name}
                                        </Typography>
                                    </Stack>
                                </SharedTableCell>
                                <SharedTableCell>
                                    <Typography variant='body2' color='text.secondary' noWrap>
                                        {e.email}
                                    </Typography>
                                </SharedTableCell>
                                <SharedTableCell>
                                    <Typography variant='body2' noWrap>
                                        {e.jobTitle}
                                    </Typography>
                                </SharedTableCell>
                                <SharedTableCell>
                                    <Typography variant='body2' color='text.secondary' noWrap>
                                        {e.department || '—'}
                                    </Typography>
                                </SharedTableCell>
                                <SharedTableCell>
                                    <Typography variant='body2' color='text.secondary' noWrap>
                                        {role?.name || '—'}
                                    </Typography>
                                </SharedTableCell>
                                <SharedTableCell>
                                    <Stack direction='row' spacing={0.75} alignItems='center'>
                                        <StatusDot tone={statusTone} size={7} />
                                        <Typography variant='body2' noWrap>
                                            {t(STATUS_LABEL[e.status] || e.status)}
                                        </Typography>
                                    </Stack>
                                </SharedTableCell>
                                <SharedTableCell numeric>{teamCountFor(e.id)}</SharedTableCell>
                                <SharedTableCell numeric sx={{ whiteSpace: 'nowrap' }}>
                                    {e.joinedOn}
                                </SharedTableCell>
                                <SharedTableCell align='right' onClick={(ev) => ev.stopPropagation()} sx={{ whiteSpace: 'nowrap' }}>
                                    <Tooltip title={t('Chỉnh sửa')}>
                                        <IconButton
                                            size='small'
                                            aria-label={t('Chỉnh sửa {name}', { name: e.name })}
                                            onClick={() => {
                                                setEditingEmployee(e)
                                                setShowEmployeeForm(true)
                                            }}
                                            sx={{ color: 'text.secondary' }}
                                        >
                                            <IconEdit size={16} stroke={ICON_STROKE} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t('Xoá')}>
                                        <IconButton
                                            size='small'
                                            aria-label={t('Xoá {name}', { name: e.name })}
                                            onClick={() => handleDeleteEmployee(e)}
                                            sx={deleteButtonSx}
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
                                        minWidth: 120,
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
                    PaperProps={{ sx: { minWidth: 220 } }}
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
                    PaperProps={{ sx: { minWidth: 240 } }}
                >
                    <MenuItem
                        onClick={() => {
                            setSavedAnchor(null)
                            setSaveName('')
                            setSaveDialogOpen(true)
                        }}
                        disabled={filters.length === 0 && !search}
                    >
                        <IconPlus size={14} stroke={ICON_STROKE} style={{ marginRight: 8 }} />
                        {t('Lưu bộ lọc hiện tại')}
                    </MenuItem>
                    {savedViews.length > 0 && <Divider />}
                    {savedViews.map((v) => (
                        <MenuItem key={v.name} onClick={() => applySavedView(v)} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ flex: 1 }}>{v.name}</Box>
                            <IconButton
                                size='small'
                                onClick={(ev) => {
                                    ev.stopPropagation()
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

    const renderListTab = () => (
        <Stack spacing={2}>
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
                                gap: 0.5
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
                (filteredEmployees.length === 0 ? (
                    <Box sx={{ p: 8, textAlign: 'center', color: 'text.secondary' }}>
                        <IconUsersGroup size={40} stroke={ICON_STROKE} style={{ opacity: 0.3, marginBottom: 12 }} />
                        <Typography>{t('Chưa có nhân viên nào phù hợp')}</Typography>
                    </Box>
                ) : (
                    <>
                        {renderTable()}
                        <TablePagination
                            currentPage={currentPage}
                            limit={pageLimit}
                            total={filteredEmployees.length}
                            onChange={(page, limit) => {
                                setCurrentPage(page)
                                setPageLimit(limit)
                            }}
                        />
                    </>
                ))}

            {view === 'kanban' && (
                <EmployeeKanban
                    employees={filteredEmployees}
                    roles={roles}
                    onOpenEmployee={(id) => navigate(`/employees/${id}`)}
                    onMoveEmployee={handleMoveEmployee}
                />
            )}
        </Stack>
    )

    const renderRolesTab = () => (
        <SharedTableContainer>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <SharedTableCell>{t('Vai trò')}</SharedTableCell>
                        <SharedTableCell>{t('Mô tả')}</SharedTableCell>
                        <SharedTableCell>{t('Loại')}</SharedTableCell>
                        <SharedTableCell numeric>{t('Thành viên')}</SharedTableCell>
                        <SharedTableCell numeric>{t('Quyền')}</SharedTableCell>
                        <SharedTableCell align='right'>{t('Thao tác')}</SharedTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {roles.map((role) => {
                        const memberCount = employees.filter((e) => e.roleId === role.id).length
                        const enabledCount = Object.values(role.permissions).reduce(
                            (acc, actions) => acc + Object.values(actions).filter(Boolean).length,
                            0
                        )
                        const openRole = () => {
                            setEditingRole(role)
                            setShowRoleBuilder(true)
                        }
                        return (
                            <SharedTableRow
                                key={role.id}
                                interactive
                                hover
                                tabIndex={0}
                                onClick={openRole}
                                onKeyDown={(ev) => {
                                    if (ev.key === 'Enter') openRole()
                                }}
                            >
                                <SharedTableCell>
                                    <Stack direction='row' spacing={1} alignItems='center'>
                                        <Box sx={{ display: 'flex', color: 'text.secondary' }}>
                                            {role.isSystem ? (
                                                <IconLock size={16} stroke={ICON_STROKE} />
                                            ) : (
                                                <IconShieldLock size={16} stroke={ICON_STROKE} />
                                            )}
                                        </Box>
                                        <Typography variant='body2' sx={{ fontWeight: 500 }} noWrap>
                                            {role.name}
                                        </Typography>
                                    </Stack>
                                </SharedTableCell>
                                <SharedTableCell>
                                    <Typography variant='body2' color='text.secondary'>
                                        {role.description || '—'}
                                    </Typography>
                                </SharedTableCell>
                                <SharedTableCell>
                                    <Typography variant='body2' color='text.secondary' noWrap>
                                        {role.isSystem ? t('Hệ thống') : t('Tuỳ chỉnh')}
                                    </Typography>
                                </SharedTableCell>
                                <SharedTableCell numeric>{memberCount}</SharedTableCell>
                                <SharedTableCell numeric>{enabledCount}</SharedTableCell>
                                <SharedTableCell align='right' onClick={(ev) => ev.stopPropagation()} sx={{ whiteSpace: 'nowrap' }}>
                                    <Tooltip title={role.isSystem ? t('Xem') : t('Chỉnh sửa')}>
                                        <IconButton
                                            size='small'
                                            aria-label={t(role.isSystem ? 'Xem {name}' : 'Chỉnh sửa {name}', { name: role.name })}
                                            onClick={openRole}
                                            sx={{ color: 'text.secondary' }}
                                        >
                                            <IconEdit size={16} stroke={ICON_STROKE} />
                                        </IconButton>
                                    </Tooltip>
                                    {!role.isSystem && (
                                        <Tooltip title={t('Xoá')}>
                                            <IconButton
                                                size='small'
                                                aria-label={t('Xoá {name}', { name: role.name })}
                                                onClick={() => handleDeleteRole(role)}
                                                sx={deleteButtonSx}
                                            >
                                                <IconTrash size={16} stroke={ICON_STROKE} />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </SharedTableCell>
                            </SharedTableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </SharedTableContainer>
    )

    const secondaryAction =
        tab === 1
            ? {
                  label: t('Tạo nhóm'),
                  onClick: () => {
                      setEditingTeam(null)
                      setShowTeamForm(true)
                  }
              }
            : tab === 2
            ? {
                  label: t('Tạo vai trò'),
                  onClick: () => {
                      setEditingRole(null)
                      setShowRoleBuilder(true)
                  }
              }
            : null

    return (
        <MainCard border={false} sx={{ background: 'transparent' }} contentSX={{ p: 0, '&:last-child': { pb: 0 } }}>
            <ViewHeader
                title='Nhân sự'
                count={
                    tab !== 0
                        ? undefined
                        : filteredEmployees.length !== employees.length
                        ? `${filteredEmployees.length} / ${employees.length}`
                        : filteredEmployees.length
                }
            >
                <Stack direction='row' spacing={1} alignItems='center'>
                    {tab === 0 && (
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
                    )}
                    <Tooltip title={t('Cấu hình nhân sự')}>
                        <IconButton
                            onClick={() => setShowSettings(true)}
                            aria-label={t('Cấu hình nhân sự')}
                            sx={{ width: 36, height: 36, border: `1px solid ${alphaBorder}`, color: 'text.secondary' }}
                        >
                            <IconSettings size={17} stroke={ICON_STROKE} />
                        </IconButton>
                    </Tooltip>
                    {secondaryAction && (
                        <Button
                            variant='outlined'
                            color='inherit'
                            startIcon={<IconPlus size={16} stroke={ICON_STROKE} />}
                            onClick={secondaryAction.onClick}
                            sx={{ borderColor: alphaBorder }}
                        >
                            {secondaryAction.label}
                        </Button>
                    )}
                    <Button
                        variant='contained'
                        startIcon={<IconUserPlus size={16} stroke={ICON_STROKE} />}
                        onClick={() => {
                            setEditingEmployee(null)
                            setShowEmployeeForm(true)
                        }}
                    >
                        {t('Mời nhân viên')}
                    </Button>
                </Stack>
            </ViewHeader>

            <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{
                    borderBottom: `1px solid ${alphaHairline}`,
                    minHeight: 44,
                    mb: 2,
                    '& .MuiTab-root': {
                        minHeight: 44,
                        textTransform: 'none',
                        fontWeight: 500,
                        color: 'text.secondary',
                        px: 2,
                        '&.Mui-selected': { fontWeight: 600, color: 'text.primary' }
                    },
                    '& .MuiTabs-indicator': { height: 2 }
                }}
            >
                <Tab icon={<IconUsersGroup size={16} stroke={ICON_STROKE} />} iconPosition='start' label={t('Nhân sự')} />
                <Tab icon={<IconUsers size={16} stroke={ICON_STROKE} />} iconPosition='start' label={`${t('Nhóm')} · ${teams.length}`} />
                <Tab
                    icon={<IconShieldLock size={16} stroke={ICON_STROKE} />}
                    iconPosition='start'
                    label={`${t('Vai trò')} · ${roles.length}`}
                />
            </Tabs>

            {tab === 0 && renderListTab()}
            {tab === 1 && (
                <TeamsTab
                    teams={teams}
                    employees={employees}
                    onCreate={() => {
                        setEditingTeam(null)
                        setShowTeamForm(true)
                    }}
                    onEdit={(team) => {
                        setEditingTeam(team)
                        setShowTeamForm(true)
                    }}
                    onDelete={handleDeleteTeam}
                />
            )}
            {tab === 2 && renderRolesTab()}

            <EmployeeFormDialog
                show={showEmployeeForm}
                employee={editingEmployee}
                roles={roles}
                onCancel={() => {
                    setShowEmployeeForm(false)
                    setEditingEmployee(null)
                }}
                onSave={handleSaveEmployee}
            />

            <RoleBuilderDialog
                show={showRoleBuilder}
                role={editingRole}
                onCancel={() => {
                    setShowRoleBuilder(false)
                    setEditingRole(null)
                }}
                onSave={handleSaveRole}
            />

            <TeamFormDialog
                show={showTeamForm}
                team={editingTeam}
                employees={employees}
                onCancel={() => {
                    setShowTeamForm(false)
                    setEditingTeam(null)
                }}
                onSave={handleSaveTeam}
            />

            <EmployeeSettingsDialog
                show={showSettings}
                attributeDefs={attributeDefs}
                onCancel={() => setShowSettings(false)}
                onSave={(next) => {
                    setAttributeDefs(next)
                    setShowSettings(false)
                }}
            />

            <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth='xs' fullWidth>
                <DialogTitle>{t('Lưu bộ lọc hiện tại')}</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        size='small'
                        label={t('Tên bộ lọc')}
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && commitSaveView()}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button color='inherit' onClick={() => setSaveDialogOpen(false)}>
                        {t('Huỷ')}
                    </Button>
                    <Button variant='contained' onClick={commitSaveView} disabled={!saveName.trim()}>
                        {t('Lưu')}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog />
        </MainCard>
    )
}

export default Employees
