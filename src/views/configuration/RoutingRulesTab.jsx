import PropTypes from 'prop-types'
import { useState } from 'react'
import { createPortal } from 'react-dom'

import { alpha, useTheme } from '@mui/material/styles'
import {
    AvatarGroup,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    Paper,
    Stack,
    Switch,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography
} from '@mui/material'
import { AppIcon } from '@/ui-component/icons/AppIcon'

import { useLanguage } from '@/store/context/LanguageContext'
import useDialogShell, { FormField } from '@/hooks/useDialogShell'
import { mockEmployees, mockTeams } from '@/views/employees/mockEmployees'
import { CHANNELS, CHANNEL_ORDER } from '@/views/omnichannel/mockConversations'
import { mockRoutingRules, ROUTING_STRATEGIES } from './mockSettings'
import PersonAvatar from '@/ui-component/avatar/PersonAvatar'

const emptyRule = {
    id: '',
    name: '',
    enabled: true,
    priority: 10,
    conditions: { tag: '', channels: [] },
    assignType: 'team',
    assignTo: '',
    teamId: '',
    strategy: 'round_robin_team'
}

const TAG_OPTIONS = ['VIP', 'Khiếu nại', 'Đại lý', 'Đơn lớn', 'Mới']

const RoutingRulesTab = () => {
    const { t } = useLanguage()
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const { dialogProps, titleProps, contentProps, actionsProps } = useDialogShell({ size: 'md' })
    const [rules, setRules] = useState(mockRoutingRules)
    const [editingId, setEditingId] = useState(null)
    const [draft, setDraft] = useState(null)

    const alphaBorder = theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08)
    const empById = (id) => mockEmployees.find((e) => e.id === id)
    const teamById = (id) => mockTeams.find((tm) => tm.id === id)
    const strategyLabel = (val) => t(ROUTING_STRATEGIES.find((s) => s.value === val)?.label || val)

    const startEdit = (rule) => {
        setEditingId(rule.id)
        setDraft({ ...emptyRule, ...rule, conditions: { ...emptyRule.conditions, ...rule.conditions } })
    }

    const startNew = () => {
        const nextId = `rule-${Date.now()}`
        const newRule = {
            ...emptyRule,
            id: nextId,
            name: t('Luật mới'),
            priority: (rules.at(-1)?.priority || 0) + 1
        }
        setRules([...rules, newRule])
        startEdit(newRule)
    }

    const saveEdit = () => {
        setRules((prev) => prev.map((r) => (r.id === editingId ? { ...draft } : r)))
        setEditingId(null)
        setDraft(null)
    }

    const cancelEdit = () => {
        setRules((prev) => prev.filter((r) => !(r.id === editingId && !r.name.trim())))
        setEditingId(null)
        setDraft(null)
    }

    const deleteRule = (id) => setRules((prev) => prev.filter((r) => r.id !== id))
    const toggleEnabled = (id) => setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)))

    const updateAssignType = (val) => {
        if (!val) return
        setDraft((prev) => ({
            ...prev,
            assignType: val,
            strategy: val === 'user' ? 'direct' : 'round_robin_team',
            assignTo: val === 'user' ? prev.assignTo : '',
            teamId: val === 'team' ? prev.teamId : ''
        }))
    }

    const UserBadge = ({ id }) => {
        const emp = empById(id)
        if (!emp) return null
        return (
            <Stack direction='row' spacing={0.75} alignItems='center'>
                <PersonAvatar name={emp.name} size={22} />
                <Typography variant='caption' sx={{ fontWeight: 500 }}>
                    {emp.name}
                </Typography>
            </Stack>
        )
    }
    UserBadge.propTypes = { id: PropTypes.string }

    const TeamBadge = ({ team }) => {
        const palette = theme.palette[team?.color] || theme.palette.primary
        const members = team.memberIds.map(empById).filter(Boolean)
        return (
            <Stack direction='row' spacing={1} alignItems='center'>
                <Box sx={{ display: 'flex', color: isDark ? palette.light : palette.dark }}>
                    <AppIcon name='Users' size={14} />
                </Box>
                <Typography variant='caption' sx={{ fontWeight: 500 }}>
                    {team.name}
                </Typography>
                <AvatarGroup
                    max={3}
                    sx={{
                        '& .MuiAvatar-root': {
                            width: 20,
                            height: 20,
                            typography: 'caption',
                            fontWeight: 600,
                            border: `1.5px solid ${theme.palette.background.paper}`
                        }
                    }}
                >
                    {members.map((m) => {
                        return <PersonAvatar key={m.id} name={m.name} size={28} />
                    })}
                </AvatarGroup>
            </Stack>
        )
    }
    TeamBadge.propTypes = {
        team: PropTypes.shape({ color: PropTypes.string, name: PropTypes.string, memberIds: PropTypes.arrayOf(PropTypes.string) })
    }

    return (
        <Stack spacing={2}>
            <Stack direction='row' justifyContent='flex-end' alignItems='center'>
                <Button variant='contained' size='small' startIcon={<AppIcon name='Plus' size={16} />} onClick={startNew}>
                    {t('Thêm luật')}
                </Button>
            </Stack>

            <Stack spacing={1.25}>
                {rules.map((rule) => {
                    const conds = []
                    if (rule.conditions.tag) conds.push({ k: 'tag', label: t('Nhãn: {tag}', { tag: rule.conditions.tag }) })
                    if (rule.conditions.channels?.length) {
                        rule.conditions.channels.forEach((c) => conds.push({ k: `ch-${c}`, label: CHANNELS[c]?.label || c }))
                    }
                    if (conds.length === 0) conds.push({ k: 'any', label: t('Mọi hội thoại') })

                    const isTeam = rule.assignType === 'team'
                    const target = isTeam ? teamById(rule.teamId) : null

                    return (
                        <Paper
                            key={rule.id}
                            elevation={0}
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'auto 44px auto 1fr auto auto',
                                alignItems: 'center',
                                gap: 2,
                                px: 2,
                                py: 1.5,
                                boxShadow: 'none',
                                border: `1px solid ${alphaBorder}`,
                                bgcolor: rule.enabled ? 'background.paper' : alpha(theme.palette.text.primary, 0.02),
                                opacity: rule.enabled ? 1 : 0.7,
                                transition: 'border-color 120ms ease-out',
                                '&:hover': { borderColor: alpha(theme.palette.text.primary, 0.24) }
                            }}
                        >
                            <AppIcon name='DotsSixVertical' size={16} style={{ opacity: 0.35, cursor: 'grab' }} />

                            <Stack alignItems='center' spacing={0.25}>
                                <Typography variant='body2' sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                                    {rule.priority}
                                </Typography>
                                <Typography
                                    variant='caption'
                                    sx={{ fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'text.disabled' }}
                                >
                                    {t('Ưu tiên')}
                                </Typography>
                            </Stack>

                            <Switch
                                size='small'
                                checked={rule.enabled}
                                onChange={() => toggleEnabled(rule.id)}
                                inputProps={{ 'aria-label': t('Bật/tắt {name}', { name: rule.name }) }}
                            />

                            <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                                <Typography variant='body2' sx={{ fontWeight: 600 }} noWrap>
                                    {rule.name}
                                </Typography>
                                <Stack direction='row' spacing={0.75} alignItems='center' sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                                    {conds.map((c) => (
                                        <Chip
                                            key={c.k}
                                            size='small'
                                            label={c.label}
                                            variant='outlined'
                                            sx={{ color: 'text.secondary', borderColor: alphaBorder }}
                                        />
                                    ))}
                                    <Typography variant='caption' color='text.disabled' sx={{ px: 0.75 }}>
                                        {t('giao cho')}
                                    </Typography>
                                    {isTeam && target ? <TeamBadge team={target} /> : <UserBadge id={rule.assignTo} />}
                                    <Chip
                                        size='small'
                                        label={strategyLabel(rule.strategy)}
                                        variant='outlined'
                                        sx={{ color: 'text.secondary', borderColor: alphaBorder }}
                                    />
                                </Stack>
                            </Stack>

                            <Stack direction='row' spacing={0.25}>
                                <Tooltip title={t('Chỉnh sửa')}>
                                    <IconButton
                                        size='small'
                                        aria-label={t('Chỉnh sửa {name}', { name: rule.name })}
                                        onClick={() => startEdit(rule)}
                                    >
                                        <AppIcon name='PencilSimpleLine' size={16} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={t('Xoá')}>
                                    <IconButton
                                        size='small'
                                        color='error'
                                        aria-label={t('Xoá {name}', { name: rule.name })}
                                        onClick={() => deleteRule(rule.id)}
                                    >
                                        <AppIcon name='Trash' size={16} />
                                    </IconButton>
                                </Tooltip>
                            </Stack>

                            <span />
                        </Paper>
                    )
                })}
            </Stack>

            {createPortal(
                <Dialog {...dialogProps} open={Boolean(editingId && draft)} onClose={cancelEdit}>
                    <DialogTitle {...titleProps}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                            <span>{t('Chỉnh sửa luật')}</span>
                            <IconButton
                                onClick={cancelEdit}
                                aria-label={t('Đóng')}
                                size='small'
                                sx={{
                                    width: 32,
                                    height: 32,
                                    color: 'text.secondary',
                                    '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.06), color: 'text.primary' }
                                }}
                            >
                                <AppIcon name='X' size={16} />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent {...contentProps} sx={{ ...contentProps.sx, gap: 0 }}>
                        {draft && (
                            <Stack spacing={2.5}>
                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                    <FormField label={t('Tên luật')} htmlFor='rule-name' required sx={{ flex: 1 }}>
                                        <TextField
                                            id='rule-name'
                                            fullWidth
                                            size='small'
                                            value={draft.name}
                                            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                                            // eslint-disable-next-line jsx-a11y/no-autofocus -- intentional: focus the first field when the dialog/panel opens
                                            autoFocus
                                        />
                                    </FormField>
                                    <FormField
                                        label={t('Ưu tiên')}
                                        htmlFor='rule-priority'
                                        hint={t('Số nhỏ được xét trước.')}
                                        sx={{ width: { xs: '100%', md: 140 } }}
                                    >
                                        <TextField
                                            id='rule-priority'
                                            size='small'
                                            type='number'
                                            value={draft.priority}
                                            onChange={(e) => setDraft({ ...draft, priority: parseInt(e.target.value, 10) || 0 })}
                                        />
                                    </FormField>
                                </Stack>

                                <Stack spacing={1.5}>
                                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                                        {t('Điều kiện')}
                                    </Typography>
                                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                        <FormField label={t('Nhãn khách')} sx={{ flex: 1 }}>
                                            <TextField
                                                select
                                                fullWidth
                                                size='small'
                                                inputProps={{ 'aria-label': t('Nhãn khách') }}
                                                SelectProps={{ displayEmpty: true }}
                                                value={draft.conditions.tag || ''}
                                                onChange={(e) =>
                                                    setDraft({ ...draft, conditions: { ...draft.conditions, tag: e.target.value } })
                                                }
                                            >
                                                <MenuItem value=''>{t('Không xét nhãn')}</MenuItem>
                                                {TAG_OPTIONS.map((tag) => (
                                                    <MenuItem key={tag} value={tag}>
                                                        {tag}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </FormField>
                                        <FormField label={t('Kênh liên hệ')} sx={{ flex: 1 }}>
                                            <TextField
                                                select
                                                fullWidth
                                                size='small'
                                                inputProps={{ 'aria-label': t('Kênh liên hệ') }}
                                                SelectProps={{
                                                    multiple: true,
                                                    displayEmpty: true,
                                                    renderValue: (sel) =>
                                                        sel.length === 0
                                                            ? t('Không xét kênh')
                                                            : sel.map((s) => CHANNELS[s]?.label || s).join(', ')
                                                }}
                                                value={draft.conditions.channels || []}
                                                onChange={(e) =>
                                                    setDraft({
                                                        ...draft,
                                                        conditions: {
                                                            ...draft.conditions,
                                                            channels:
                                                                typeof e.target.value === 'string'
                                                                    ? e.target.value.split(',')
                                                                    : e.target.value
                                                        }
                                                    })
                                                }
                                            >
                                                {CHANNEL_ORDER.map((chId) => (
                                                    <MenuItem key={chId} value={chId}>
                                                        {CHANNELS[chId].label}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </FormField>
                                    </Stack>
                                </Stack>

                                <Stack spacing={1.5}>
                                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                                        {t('Giao cho')}
                                    </Typography>
                                    <ToggleButtonGroup
                                        exclusive
                                        size='small'
                                        value={draft.assignType}
                                        onChange={(_, v) => updateAssignType(v)}
                                        aria-label={t('Giao cho')}
                                    >
                                        <ToggleButton value='user' sx={{ px: 2, gap: 0.75 }}>
                                            <AppIcon name='User' size={14} /> {t('Cá nhân')}
                                        </ToggleButton>
                                        <ToggleButton value='team' sx={{ px: 2, gap: 0.75 }}>
                                            <AppIcon name='Users' size={14} /> {t('Nhóm nhân viên')}
                                        </ToggleButton>
                                    </ToggleButtonGroup>

                                    {draft.assignType === 'user' ? (
                                        <FormField label={t('Nhân viên nhận')} required>
                                            <TextField
                                                select
                                                fullWidth
                                                size='small'
                                                inputProps={{ 'aria-label': t('Nhân viên nhận') }}
                                                value={draft.assignTo || ''}
                                                onChange={(e) => setDraft({ ...draft, assignTo: e.target.value })}
                                            >
                                                {mockEmployees.map((emp) => (
                                                    <MenuItem key={emp.id} value={emp.id}>
                                                        {emp.name} · {emp.jobTitle}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </FormField>
                                    ) : (
                                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                            <FormField label={t('Nhóm nhận')} required sx={{ flex: 1 }}>
                                                <TextField
                                                    select
                                                    fullWidth
                                                    size='small'
                                                    inputProps={{ 'aria-label': t('Nhóm nhận') }}
                                                    value={draft.teamId || ''}
                                                    onChange={(e) => setDraft({ ...draft, teamId: e.target.value })}
                                                >
                                                    {mockTeams.map((tm) => (
                                                        <MenuItem key={tm.id} value={tm.id}>
                                                            <Stack direction='row' spacing={1} alignItems='center'>
                                                                <AppIcon
                                                                    name='UsersThree'
                                                                    size={16}
                                                                    color={(theme.palette[tm.color] || theme.palette.primary).main}
                                                                />
                                                                <span>
                                                                    {tm.name} · {t('{n} thành viên', { n: tm.memberIds.length })}
                                                                </span>
                                                            </Stack>
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </FormField>
                                            <FormField
                                                label={t('Cách chia')}
                                                hint={t('Cách chọn người nhận trong nhóm khi có hội thoại mới.')}
                                                sx={{ flex: 1 }}
                                            >
                                                <TextField
                                                    select
                                                    fullWidth
                                                    size='small'
                                                    inputProps={{ 'aria-label': t('Cách chia') }}
                                                    value={draft.strategy}
                                                    onChange={(e) => setDraft({ ...draft, strategy: e.target.value })}
                                                >
                                                    {ROUTING_STRATEGIES.filter((s) => s.requires === 'team').map((s) => (
                                                        <MenuItem key={s.value} value={s.value}>
                                                            {t(s.label)}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </FormField>
                                        </Stack>
                                    )}

                                    {draft.assignType === 'team' && draft.teamId && (
                                        <Paper elevation={0} sx={{ p: 1.5, border: `1px solid ${alphaBorder}`, boxShadow: 'none' }}>
                                            <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                                                {t('Thành viên nhóm')}
                                            </Typography>
                                            <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap', gap: 0.75, mt: 0.75 }}>
                                                {(teamById(draft.teamId)?.memberIds || []).map((mid) => {
                                                    const emp = empById(mid)
                                                    if (!emp) return null
                                                    const isLead = teamById(draft.teamId)?.leaderId === mid
                                                    return (
                                                        <Chip
                                                            key={mid}
                                                            size='small'
                                                            icon={isLead ? <AppIcon name='Crown' size={12} /> : undefined}
                                                            label={emp.name}
                                                            variant='outlined'
                                                            sx={{
                                                                color: isLead ? 'text.primary' : 'text.secondary',
                                                                borderColor: alphaBorder
                                                            }}
                                                        />
                                                    )
                                                })}
                                            </Stack>
                                        </Paper>
                                    )}
                                </Stack>
                            </Stack>
                        )}
                    </DialogContent>
                    <DialogActions {...actionsProps}>
                        <Button onClick={cancelEdit} color='inherit' sx={{ fontWeight: 500 }}>
                            {t('Huỷ')}
                        </Button>
                        <Button
                            variant='contained'
                            onClick={saveEdit}
                            disabled={
                                !draft ||
                                !draft.name.trim() ||
                                (draft.assignType === 'user' && !draft.assignTo) ||
                                (draft.assignType === 'team' && !draft.teamId)
                            }
                        >
                            {t('Lưu')}
                        </Button>
                    </DialogActions>
                </Dialog>,
                document.getElementById('portal') || document.body
            )}
        </Stack>
    )
}

export default RoutingRulesTab
