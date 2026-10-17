import PropTypes from 'prop-types'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useUrlTabState from '@/hooks/useUrlTabState'

import { alpha, useTheme } from '@mui/material/styles'
import {
    Box,
    Button,
    Card,
    Divider,
    Grid,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    Tab,
    Table,
    TableBody,
    TableHead,
    TableRow,
    Tabs,
    Tooltip,
    Typography
} from '@mui/material'
import { AppIcon, iconComponent } from '@/ui-component/icons/AppIcon'

import { TabPanel } from '@/ui-component/tabs/TabPanel'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'
import { SharedTableCell, SharedTableContainer, SharedTableRow, StatusPill } from '@/ui-component/table/SharedTable'
import { useLanguage } from '@/store/context/LanguageContext'
import useConfirm from '@/hooks/useConfirm'
import { mockCustomers } from '@/views/customers/mockCustomers'
import { mockInteractionLog } from '@/views/customers/mockAtlas'
import EmployeeFormDialog from './EmployeeFormDialog'
import { mockEmployees, mockRoles, mockTeams, PERMISSION_ACTIONS, PERMISSION_MODULES } from './mockEmployees'
import PersonAvatar from '@/ui-component/avatar/PersonAvatar'

const STATUS_TONE = { active: 'emerald', invited: 'amber', disabled: 'rose' }
const STATUS_LABEL = { active: 'Đang hoạt động', invited: 'Đã mời', disabled: 'Vô hiệu' }
const ACTION_LABEL = { view: 'Xem', create: 'Tạo', edit: 'Sửa', delete: 'Xoá' }

const feedIconFor = (kind) => {
    if (kind === 'chat' || kind === 'reply') return iconComponent('Chats')
    if (kind === 'note') return iconComponent('Note')
    if (kind === 'file') return iconComponent('File')
    if (kind === 'stage') return iconComponent('ArrowsLeftRight')
    if (kind === 'created') return iconComponent('UserPlus')
    return iconComponent('ClockCounterClockwise')
}

const Field = ({ label, value }) => (
    <Stack spacing={0.5}>
        <Typography variant='caption' color='text.secondary'>
            {label}
        </Typography>
        <Typography variant='subtitle1' sx={{ wordBreak: 'break-word' }}>
            {value || '—'}
        </Typography>
    </Stack>
)

const SectionCard = ({ title, action, children, noPadding }) => (
    <Card sx={{ p: noPadding ? 0 : 3, overflow: 'hidden' }}>
        {(title || action) && (
            <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'
                sx={{ mb: 2, ...(noPadding && { px: 3, pt: 3, mb: 2 }) }}
            >
                {title && <Typography variant='h6'>{title}</Typography>}
                {action}
            </Stack>
        )}
        {children}
    </Card>
)

const ActivityList = ({ items, dense, alphaDivider, t }) => {
    if (items.length === 0) {
        return (
            <Typography variant='body2' color='text.secondary'>
                {t('Chưa có hoạt động nào.')}
            </Typography>
        )
    }
    return (
        <Stack spacing={0}>
            {items.map((it, i) => {
                const Icon = feedIconFor(it.action)
                const isLast = i === items.length - 1
                return (
                    <Stack key={it.id} direction='row' spacing={1.5} alignItems='flex-start' sx={{ pb: isLast ? 0 : dense ? 2 : 2.5 }}>
                        <Box sx={{ position: 'relative', width: 24, flexShrink: 0 }}>
                            <Box
                                sx={(theme) => ({
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    bgcolor: alpha(theme.palette.text.primary, 0.05),
                                    color: 'text.secondary',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                })}
                            >
                                <Icon size={13} />
                            </Box>
                            {!isLast && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 28,
                                        bottom: dense ? -12 : -16,
                                        left: '50%',
                                        width: '1px',
                                        bgcolor: alphaDivider,
                                        transform: 'translateX(-50%)'
                                    }}
                                />
                            )}
                        </Box>
                        <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant='body2'>{it.summary}</Typography>
                            <Typography variant='caption' color='text.secondary'>
                                {it.at}
                                {it.customerName && ` · ${it.customerName}`}
                            </Typography>
                        </Stack>
                    </Stack>
                )
            })}
        </Stack>
    )
}

const EmployeeDetail = () => {
    const { t } = useLanguage()
    const theme = useTheme()
    const { employeeId } = useParams()
    const navigate = useNavigate()
    const { confirm } = useConfirm()

    const [tab, setTab] = useUrlTabState('tab', ['info', 'permissions', 'activity'])
    const [employees, setEmployees] = useState(mockEmployees)
    const [menuAnchor, setMenuAnchor] = useState(null)
    const [showForm, setShowForm] = useState(false)

    const employee = employees.find((e) => e.id === employeeId)
    const role = mockRoles.find((r) => r.id === employee?.roleId)
    const teams = mockTeams.filter((tm) => tm.memberIds.includes(employeeId))
    const ledTeams = teams.filter((tm) => tm.leaderId === employeeId)

    const alphaBorder = theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08)
    const alphaDivider = theme.palette.alpha?.divider || alpha(theme.palette.text.primary, 0.06)

    const activity = useMemo(() => {
        const items = []
        Object.entries(mockInteractionLog).forEach(([customerId, logs]) => {
            const customer = mockCustomers.find((c) => c.id === customerId)
            logs.forEach((l) => {
                if (l.actorId === employeeId) items.push({ ...l, customerName: customer?.name })
            })
        })
        items.sort((a, b) => (b.at > a.at ? 1 : b.at < a.at ? -1 : 0))
        return items
    }, [employeeId])

    const totalActions = PERMISSION_MODULES.length * PERMISSION_ACTIONS.length
    const grantedActions = PERMISSION_MODULES.reduce(
        (sum, m) => sum + PERMISSION_ACTIONS.filter((a) => role?.permissions?.[m.id]?.[a]).length,
        0
    )

    if (!employee) {
        return (
            <Box sx={{ px: { xs: 2, md: 3 }, py: 2.5 }}>
                <Card sx={{ p: 3 }}>
                    <Typography color='text.secondary'>{t('Không tìm thấy nhân viên.')}</Typography>
                </Card>
            </Box>
        )
    }

    const statusTone = STATUS_TONE[employee.status] || 'teal'

    const closeMenu = () => setMenuAnchor(null)

    const toggleStatus = () => {
        closeMenu()
        setEmployees((prev) =>
            prev.map((e) => (e.id === employee.id ? { ...e, status: e.status === 'disabled' ? 'active' : 'disabled' } : e))
        )
    }

    const handleDelete = async () => {
        closeMenu()
        const isConfirmed = await confirm({
            title: t('Xoá nhân viên'),
            description: t('Xoá {name}?', { name: employee.name }),
            confirmButtonName: t('Xoá'),
            cancelButtonName: t('Huỷ')
        })
        if (isConfirmed) navigate('/employees')
    }

    return (
        <Box sx={{ px: { xs: 2, md: 3 }, py: 2.5 }}>
            <Stack direction='row' spacing={0.75} alignItems='center' sx={{ mb: 1.5, color: 'text.secondary' }}>
                <Box
                    component='button'
                    type='button'
                    onClick={() => navigate('/employees')}
                    sx={{
                        border: 0,
                        background: 'transparent',
                        p: 0,
                        cursor: 'pointer',
                        typography: 'body2',
                        color: 'text.secondary',
                        '&:hover': { color: 'text.primary' }
                    }}
                >
                    {t('Nhân sự')}
                </Box>
                <AppIcon name='CaretRight' size={14} />
                <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 500 }} noWrap>
                    {employee.name}
                </Typography>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} sx={{ mb: 3 }}>
                <PersonAvatar name={employee.name} size={52} />
                <Stack sx={{ flex: 1, minWidth: 0 }} spacing={0.75}>
                    <Typography variant='h1' noWrap>
                        {employee.name}
                    </Typography>
                    <Stack direction='row' spacing={1} alignItems='center' sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                        <StatusPill tone={statusTone} label={t(STATUS_LABEL[employee.status] || employee.status)} />
                        <Typography variant='body2' color='text.secondary'>
                            {employee.jobTitle}
                            {employee.department && ` · ${employee.department}`}
                        </Typography>
                    </Stack>
                </Stack>
                <Stack direction='row' spacing={1} alignItems='center' sx={{ flexShrink: 0 }}>
                    <Button variant='contained' startIcon={<AppIcon name='PencilSimpleLine' size={16} />} onClick={() => setShowForm(true)}>
                        {t('Chỉnh sửa')}
                    </Button>
                    <Tooltip title={t('Hành động khác')}>
                        <IconButton
                            aria-label={t('Hành động khác')}
                            onClick={(e) => setMenuAnchor(e.currentTarget)}
                            sx={{ width: 36, height: 36, border: `1px solid ${alphaBorder}`, color: 'text.secondary' }}
                        >
                            <AppIcon name='DotsThree' size={17} />
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={menuAnchor}
                        open={Boolean(menuAnchor)}
                        onClose={closeMenu}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        PaperProps={{ sx: { minWidth: 200 } }}
                    >
                        {employee.status === 'invited' && <MenuItem onClick={closeMenu}>{t('Gửi lại lời mời')}</MenuItem>}
                        <MenuItem onClick={closeMenu}>{t('Đặt lại mật khẩu')}</MenuItem>
                        <MenuItem onClick={toggleStatus}>{employee.status === 'disabled' ? t('Kích hoạt lại') : t('Vô hiệu hoá')}</MenuItem>
                        <Divider />
                        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                            {t('Xoá nhân viên')}
                        </MenuItem>
                    </Menu>
                </Stack>
            </Stack>

            <Grid container spacing={2.5}>
                <Grid item xs={12} md={7} lg={8}>
                    <Stack spacing={2.5}>
                        <Box sx={{ borderBottom: `1px solid ${alphaBorder}` }}>
                            <Tabs
                                value={tab}
                                onChange={(_, v) => setTab(v)}
                                sx={{
                                    minHeight: 40,
                                    '& .MuiTab-root': {
                                        minHeight: 40,
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        color: 'text.secondary',
                                        px: 1.5,
                                        '&.Mui-selected': { fontWeight: 600, color: 'text.primary' }
                                    },
                                    '& .MuiTabs-indicator': { height: 2 }
                                }}
                            >
                                <Tab label={t('Thông tin')} />
                                <Tab label={t('Phân quyền')} />
                                <Tab label={`${t('Hoạt động')} · ${activity.length}`} />
                            </Tabs>
                        </Box>

                        <TabPanel value={tab} index={0}>
                            <Stack spacing={2.5}>
                                <SectionCard title={t('Thông tin liên hệ')}>
                                    <Grid container spacing={2.5}>
                                        <Grid item xs={12} sm={6}>
                                            <Field label={t('Email')} value={employee.email} />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Field label={t('Số điện thoại')} value={employee.phone} />
                                        </Grid>
                                    </Grid>
                                </SectionCard>
                                <SectionCard title={t('Công việc')}>
                                    <Grid container spacing={2.5}>
                                        <Grid item xs={12} sm={6}>
                                            <Field label={t('Chức danh')} value={employee.jobTitle} />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Field label={t('Phòng ban')} value={employee.department} />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Field label={t('Ngày vào làm')} value={employee.joinedOn} />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Field label={t('Nhóm')} value={teams.map((tm) => tm.name).join(', ')} />
                                        </Grid>
                                    </Grid>
                                </SectionCard>
                            </Stack>
                        </TabPanel>

                        <TabPanel value={tab} index={1}>
                            <Stack spacing={2.5}>
                                <SectionCard title={t('Vai trò')}>
                                    <Grid container spacing={2.5}>
                                        <Grid item xs={12} sm={6}>
                                            <Field label={t('Vai trò')} value={role?.name} />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Field label={t('Quyền được cấp')} value={`${grantedActions} / ${totalActions}`} />
                                        </Grid>
                                        {role?.description && (
                                            <Grid item xs={12}>
                                                <Field label={t('Mô tả')} value={role.description} />
                                            </Grid>
                                        )}
                                    </Grid>
                                </SectionCard>

                                <SectionCard title={t('Quyền hiệu lực')} noPadding>
                                    <SharedTableContainer sx={{ border: 0, borderTop: `1px solid ${alphaBorder}`, borderRadius: 0 }}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <SharedTableCell>{t('Chức năng')}</SharedTableCell>
                                                    {PERMISSION_ACTIONS.map((action) => (
                                                        <SharedTableCell key={action} align='center'>
                                                            {t(ACTION_LABEL[action] || action)}
                                                        </SharedTableCell>
                                                    ))}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {PERMISSION_MODULES.map((m) => (
                                                    <SharedTableRow key={m.id}>
                                                        <SharedTableCell>{t(m.label)}</SharedTableCell>
                                                        {PERMISSION_ACTIONS.map((action) => {
                                                            const granted = role?.permissions?.[m.id]?.[action]
                                                            return (
                                                                <SharedTableCell
                                                                    key={action}
                                                                    align='center'
                                                                    aria-label={t(
                                                                        granted ? '{module} — {action}: Có' : '{module} — {action}: Không',
                                                                        {
                                                                            module: t(m.label),
                                                                            action: t(ACTION_LABEL[action] || action)
                                                                        }
                                                                    )}
                                                                    sx={{ color: granted ? 'success.main' : 'text.disabled' }}
                                                                >
                                                                    {granted ? (
                                                                        <AppIcon name='Check' size={16} />
                                                                    ) : (
                                                                        <AppIcon name='Minus' size={14} />
                                                                    )}
                                                                </SharedTableCell>
                                                            )
                                                        })}
                                                    </SharedTableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </SharedTableContainer>
                                </SectionCard>
                            </Stack>
                        </TabPanel>

                        <TabPanel value={tab} index={2}>
                            <SectionCard title={t('Lịch sử hoạt động')}>
                                <ActivityList items={activity} alphaDivider={alphaDivider} t={t} />
                            </SectionCard>
                        </TabPanel>
                    </Stack>
                </Grid>

                <Grid item xs={12} md={5} lg={4}>
                    <Stack spacing={2}>
                        <SectionCard title={t('Thông tin nhanh')}>
                            <Stack spacing={2}>
                                <Field label={t('Vai trò')} value={role?.name} />
                                <Field label={t('Phòng ban')} value={employee.department} />
                                <Field label={t('Ngày vào làm')} value={employee.joinedOn} />
                                <Stack direction='row' spacing={3}>
                                    <Stack spacing={0.5}>
                                        <Typography variant='caption' color='text.secondary'>
                                            {t('Nhóm')}
                                        </Typography>
                                        <Typography variant='subtitle1' sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                            {teams.length}
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={0.5}>
                                        <Typography variant='caption' color='text.secondary'>
                                            {t('Trưởng nhóm')}
                                        </Typography>
                                        <Typography variant='subtitle1' sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                            {ledTeams.length}
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={0.5}>
                                        <Typography variant='caption' color='text.secondary'>
                                            {t('Quyền')}
                                        </Typography>
                                        <Typography variant='subtitle1' sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                            {grantedActions}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </SectionCard>

                        <SectionCard
                            title={t('Hoạt động gần đây')}
                            action={
                                activity.length > 3 && (
                                    <Button size='small' color='inherit' onClick={() => setTab(2)} sx={{ color: 'text.secondary' }}>
                                        {t('Xem tất cả')}
                                    </Button>
                                )
                            }
                        >
                            <ActivityList items={activity.slice(0, 5)} dense alphaDivider={alphaDivider} t={t} />
                        </SectionCard>
                    </Stack>
                </Grid>
            </Grid>

            <EmployeeFormDialog
                show={showForm}
                employee={employee}
                roles={mockRoles}
                onCancel={() => setShowForm(false)}
                onSave={(form) => {
                    setEmployees((prev) => prev.map((e) => (e.id === employee.id ? { ...form, id: e.id } : e)))
                    setShowForm(false)
                }}
            />

            <ConfirmDialog />
        </Box>
    )
}

Field.propTypes = {
    label: PropTypes.node,
    value: PropTypes.node
}

SectionCard.propTypes = {
    title: PropTypes.node,
    action: PropTypes.node,
    children: PropTypes.node,
    noPadding: PropTypes.bool
}

ActivityList.propTypes = {
    items: PropTypes.array,
    dense: PropTypes.bool,
    alphaDivider: PropTypes.string,
    t: PropTypes.func
}

export default EmployeeDetail
