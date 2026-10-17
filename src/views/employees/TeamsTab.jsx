import PropTypes from 'prop-types'

import { alpha, useTheme } from '@mui/material/styles'
import { AvatarGroup, Box, Card, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { AppIcon } from '@/ui-component/icons/AppIcon'

import { useLanguage } from '@/store/context/LanguageContext'
import PersonAvatar from '@/ui-component/avatar/PersonAvatar'

const TEAM_TONE = { primary: 'orange', success: 'emerald', warning: 'amber', secondary: 'teal', error: 'rose' }

const TeamsTab = ({ teams, employees, onCreate, onEdit, onDelete }) => {
    const { t } = useLanguage()
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'

    const alphaBorder = theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08)
    const empById = (id) => employees.find((e) => e.id === id)

    const softChip = (label, tone, icon) => {
        const main = theme.palette.spectrum?.[tone]?.main || theme.palette.text.primary
        return (
            <Box
                component='span'
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    height: 22,
                    px: 1,
                    borderRadius: 1,
                    typography: 'caption',
                    fontWeight: 500,
                    bgcolor: alpha(main, isDark ? 0.2 : 0.1),
                    color: 'text.primary',
                    border: `1px solid ${alpha(main, isDark ? 0.32 : 0.2)}`,
                    fontVariantNumeric: 'tabular-nums'
                }}
            >
                {icon}
                {label}
            </Box>
        )
    }

    return (
        <Box
            sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' }
            }}
        >
            {teams.map((team) => {
                const leader = empById(team.leaderId)
                const members = team.memberIds.map(empById).filter(Boolean)
                const tone = TEAM_TONE[team.color] || 'teal'
                return (
                    <Card key={team.id} sx={{ p: 2, height: '100%', borderColor: alphaBorder }}>
                        <Stack spacing={1.5}>
                            <Stack direction='row' justifyContent='space-between' alignItems='flex-start' spacing={1}>
                                <Stack direction='row' spacing={1} alignItems='center' sx={{ minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', color: 'text.secondary', flexShrink: 0 }}>
                                        <AppIcon name='Users' size={18} />
                                    </Box>
                                    <Typography sx={{ fontWeight: 600 }} noWrap>
                                        {team.name}
                                    </Typography>
                                </Stack>
                                <Stack direction='row' spacing={0.25} sx={{ flexShrink: 0 }}>
                                    <Tooltip title={t('Chỉnh sửa')}>
                                        <IconButton
                                            size='small'
                                            aria-label={t('Chỉnh sửa {name}', { name: team.name })}
                                            onClick={() => onEdit(team)}
                                            sx={{ color: 'text.secondary' }}
                                        >
                                            <AppIcon name='PencilSimpleLine' size={16} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t('Xoá')}>
                                        <IconButton
                                            size='small'
                                            aria-label={t('Xoá {name}', { name: team.name })}
                                            onClick={() => onDelete(team)}
                                            sx={{
                                                color: 'text.secondary',
                                                '&:hover': { color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.08) }
                                            }}
                                        >
                                            <AppIcon name='Trash' size={16} />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Stack>

                            {team.description && (
                                <Typography variant='body2' color='text.secondary'>
                                    {team.description}
                                </Typography>
                            )}

                            <Stack direction='row' alignItems='center' sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                                {softChip(t('{n} thành viên', { n: members.length }), tone)}
                                {leader && softChip(leader.name, tone, <AppIcon name='Crown' size={12} />)}
                            </Stack>

                            <AvatarGroup
                                max={6}
                                sx={{
                                    justifyContent: 'flex-start',
                                    '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.75rem', fontWeight: 600 }
                                }}
                            >
                                {members.map((m) => {
                                    return (
                                        <Tooltip key={m.id} title={m.name}>
                                            <PersonAvatar name={m.name} size={28} />
                                        </Tooltip>
                                    )
                                })}
                            </AvatarGroup>
                        </Stack>
                    </Card>
                )
            })}

            <Card
                component='button'
                type='button'
                aria-label={t('Tạo nhóm')}
                onClick={onCreate}
                sx={{
                    minHeight: 180,
                    width: '100%',
                    borderStyle: 'dashed',
                    borderColor: theme.palette.alpha?.borderStrong || alpha(theme.palette.text.primary, 0.2),
                    background: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    font: 'inherit',
                    color: 'inherit',
                    transition: 'border-color 160ms ease, background-color 160ms ease',
                    '&:hover': { borderColor: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.04) },
                    '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 }
                }}
            >
                <Stack alignItems='center' spacing={1} sx={{ color: 'text.secondary' }}>
                    <AppIcon name='Plus' size={20} />
                    <Typography variant='body2' color='text.secondary'>
                        {t('Tạo nhóm')}
                    </Typography>
                </Stack>
            </Card>
        </Box>
    )
}

TeamsTab.propTypes = {
    teams: PropTypes.array,
    employees: PropTypes.array,
    onCreate: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func
}

export default TeamsTab
