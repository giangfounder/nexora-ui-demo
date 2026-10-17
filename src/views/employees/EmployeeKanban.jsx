import PropTypes from 'prop-types'
import { useMemo, useState } from 'react'

import { alpha, useTheme } from '@mui/material/styles'
import { Avatar, Box, Paper, Stack, Typography } from '@mui/material'
import { IconInbox } from '@tabler/icons-react'

import { useLanguage } from '@/store/context/LanguageContext'
import { StatusDot } from '@/ui-component/table/SharedTable'
import { getAvatarColorKey, getInitials } from '@/views/customers/utils'

const ICON_STROKE = 1.75

const DEPT_TONES = ['teal', 'amber', 'orange', 'emerald', 'rose']
const toneFor = (idx) => DEPT_TONES[idx % DEPT_TONES.length]

const STATUS_TONE = { active: 'emerald', invited: 'amber', disabled: 'rose' }
const STATUS_LABEL = { active: 'Đang hoạt động', invited: 'Đã mời', disabled: 'Vô hiệu' }

const EmployeeKanban = ({ employees, roles, onOpenEmployee, onMoveEmployee }) => {
    const { t } = useLanguage()
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const [draggingId, setDraggingId] = useState(null)
    const [dragOverDept, setDragOverDept] = useState(null)

    const departments = useMemo(() => {
        const set = new Set()
        employees.forEach((e) => set.add(e.department || t('Chưa phân bổ')))
        return Array.from(set)
    }, [employees, t])

    const roleById = (id) => roles.find((r) => r.id === id)
    const alphaBorder = theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08)
    const sunken = theme.palette.surface?.sunken || alpha(theme.palette.text.primary, 0.02)

    if (departments.length === 0) {
        return (
            <Box sx={{ p: 8, textAlign: 'center', color: 'text.secondary' }}>
                <IconInbox size={40} stroke={ICON_STROKE} style={{ opacity: 0.3, marginBottom: 12 }} />
                <Typography>{t('Chưa có nhân viên nào phù hợp')}</Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 2, alignItems: 'stretch' }}>
            {departments.map((dept, deptIndex) => {
                const columnEmployees = employees.filter((e) => (e.department || t('Chưa phân bổ')) === dept)
                const tone = toneFor(deptIndex)
                const toneMain = theme.palette.spectrum?.[tone]?.main || theme.palette.primary.main
                const isDragOver = dragOverDept === dept

                return (
                    <Paper
                        key={dept}
                        variant='outlined'
                        onDragOver={(e) => {
                            e.preventDefault()
                            if (dragOverDept !== dept) setDragOverDept(dept)
                        }}
                        onDragLeave={() => setDragOverDept(null)}
                        onDrop={() => {
                            if (draggingId) onMoveEmployee(draggingId, dept)
                            setDraggingId(null)
                            setDragOverDept(null)
                        }}
                        sx={{
                            width: 300,
                            flexShrink: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            borderColor: isDragOver ? alpha(toneMain, 0.4) : alphaBorder,
                            bgcolor: isDragOver ? alpha(toneMain, isDark ? 0.12 : 0.04) : sunken,
                            transition: 'background-color 120ms ease-out, border-color 120ms ease-out'
                        }}
                    >
                        <Stack
                            direction='row'
                            alignItems='center'
                            spacing={1}
                            sx={{ px: 1.75, height: 44, borderBottom: `1px solid ${alphaBorder}` }}
                        >
                            <StatusDot tone={tone} size={8} />
                            <Typography variant='body2' sx={{ fontWeight: 600, flex: 1, minWidth: 0 }} noWrap>
                                {dept}
                            </Typography>
                            <Typography variant='caption' color='text.secondary' sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                {columnEmployees.length}
                            </Typography>
                        </Stack>

                        <Stack spacing={1} sx={{ flex: 1, p: 1.25, minHeight: 120 }}>
                            {columnEmployees.map((emp) => {
                                const avColor = getAvatarColorKey(emp.name)
                                const role = roleById(emp.roleId)
                                const statusTone = STATUS_TONE[emp.status] || 'teal'
                                return (
                                    <Paper
                                        key={emp.id}
                                        variant='outlined'
                                        draggable
                                        role='button'
                                        tabIndex={0}
                                        aria-label={t('Mở {name}', { name: emp.name })}
                                        onDragStart={() => setDraggingId(emp.id)}
                                        onDragEnd={() => setDraggingId(null)}
                                        onClick={() => onOpenEmployee(emp.id)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault()
                                                onOpenEmployee(emp.id)
                                            }
                                        }}
                                        sx={{
                                            p: 1.5,
                                            borderColor: alphaBorder,
                                            bgcolor: theme.palette.background.paper,
                                            cursor: 'grab',
                                            opacity: draggingId === emp.id ? 0.5 : 1,
                                            transition: 'border-color 120ms ease-out',
                                            '&:hover': {
                                                borderColor: theme.palette.alpha?.borderStrong || alpha(theme.palette.text.primary, 0.2)
                                            },
                                            '&:active': { cursor: 'grabbing' },
                                            '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 1 }
                                        }}
                                    >
                                        <Stack direction='row' spacing={1.25} alignItems='center' sx={{ mb: 1 }}>
                                            <Avatar
                                                sx={{
                                                    width: 28,
                                                    height: 28,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    bgcolor: alpha(theme.palette[avColor].main, isDark ? 0.24 : 0.15),
                                                    color: isDark ? theme.palette[avColor].light : theme.palette[avColor].dark
                                                }}
                                            >
                                                {getInitials(emp.name)}
                                            </Avatar>
                                            <Stack sx={{ minWidth: 0, flex: 1 }}>
                                                <Typography variant='body2' sx={{ fontWeight: 600 }} noWrap>
                                                    {emp.name}
                                                </Typography>
                                                <Typography variant='caption' color='text.secondary' noWrap>
                                                    {emp.jobTitle}
                                                </Typography>
                                            </Stack>
                                        </Stack>

                                        <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={1}>
                                            <Typography variant='caption' color='text.secondary' noWrap sx={{ minWidth: 0 }}>
                                                {role?.name || '—'}
                                            </Typography>
                                            <Stack direction='row' spacing={0.75} alignItems='center' sx={{ flexShrink: 0 }}>
                                                <StatusDot tone={statusTone} size={7} />
                                                <Typography variant='caption'>{t(STATUS_LABEL[emp.status] || emp.status)}</Typography>
                                            </Stack>
                                        </Stack>
                                    </Paper>
                                )
                            })}

                            {columnEmployees.length === 0 && (
                                <Stack alignItems='center' spacing={0.5} sx={{ py: 4, color: 'text.disabled' }}>
                                    <IconInbox size={20} stroke={ICON_STROKE} />
                                    <Typography variant='caption'>{t('Kéo nhân viên vào đây')}</Typography>
                                </Stack>
                            )}
                        </Stack>
                    </Paper>
                )
            })}
        </Box>
    )
}

EmployeeKanban.propTypes = {
    employees: PropTypes.array,
    roles: PropTypes.array,
    onOpenEmployee: PropTypes.func,
    onMoveEmployee: PropTypes.func
}

export default EmployeeKanban
