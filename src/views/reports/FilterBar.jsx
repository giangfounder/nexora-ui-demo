import PropTypes from 'prop-types'
import { useState } from 'react'
import { alpha, useTheme } from '@mui/material/styles'
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    ListItemText,
    Menu,
    MenuItem,
    Select,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from '@mui/material'
import { AppIcon } from '@/ui-component/icons/AppIcon'
import { useLanguage } from '@/store/context/LanguageContext'
import useSavedViews from '@/hooks/useSavedViews'
import { CHANNELS, CHANNEL_ORDER } from '@/views/omnichannel/mockConversations'
import { RANGE_OPTIONS } from './mockReports'

export const TEAM_OPTIONS = [
    { id: 'all', label: 'Tất cả nhóm' },
    { id: 'sales', label: 'Kinh doanh' },
    { id: 'support', label: 'Chăm sóc khách hàng' },
    { id: 'marketing', label: 'Marketing' }
]

const FilterBar = ({ range, onRangeChange, channel, onChannelChange, team, onTeamChange }) => {
    const theme = useTheme()
    const { t } = useLanguage()
    const alphaBorder = theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08)
    const { views, saveView, deleteView } = useSavedViews('reports.savedViews', [])
    const [anchor, setAnchor] = useState(null)
    const [saveOpen, setSaveOpen] = useState(false)
    const [name, setName] = useState('')

    const applyView = (v) => {
        if (v.payload?.range) onRangeChange(v.payload.range)
        if (v.payload?.channel) onChannelChange(v.payload.channel)
        if (v.payload?.team) onTeamChange(v.payload.team)
        setAnchor(null)
    }

    const handleSave = () => {
        if (!name.trim()) return
        saveView(name.trim(), { range, channel, team })
        setName('')
        setSaveOpen(false)
    }

    return (
        <Box
            sx={{
                pb: 2,
                mb: 3,
                borderBottom: `1px solid ${alphaBorder}`
            }}
        >
            <Stack direction='row' alignItems='center' spacing={1.5} flexWrap='wrap' useFlexGap>
                <ToggleButtonGroup
                    exclusive
                    size='small'
                    value={range}
                    onChange={(_, v) => v && onRangeChange(v)}
                    sx={{
                        '& .MuiToggleButton-root': {
                            px: 1.5,
                            py: 0.5,
                            fontWeight: 500,
                            textTransform: 'none',
                            borderColor: alphaBorder,
                            color: 'text.secondary',
                            '&.Mui-selected': {
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: 'text.primary',
                                borderColor: alpha(theme.palette.primary.main, 0.3),
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.14) }
                            }
                        }
                    }}
                >
                    {RANGE_OPTIONS.map((r) => (
                        <ToggleButton key={r.id} value={r.id}>
                            {t(r.label)}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>

                <Select size='small' value={channel} onChange={(e) => onChannelChange(e.target.value)} sx={{ minWidth: 180 }}>
                    <MenuItem value='all'>{t('Tất cả kênh')}</MenuItem>
                    {CHANNEL_ORDER.map((key) => (
                        <MenuItem key={key} value={key}>
                            {CHANNELS[key].label}
                        </MenuItem>
                    ))}
                </Select>

                <Select size='small' value={team} onChange={(e) => onTeamChange(e.target.value)} sx={{ minWidth: 180 }}>
                    {TEAM_OPTIONS.map((t2) => (
                        <MenuItem key={t2.id} value={t2.id}>
                            {t(t2.label)}
                        </MenuItem>
                    ))}
                </Select>

                <Box sx={{ flex: 1 }} />

                <Button
                    size='small'
                    variant='outlined'
                    startIcon={<AppIcon name='BookmarkSimple' size={14} />}
                    onClick={(e) => setAnchor(e.currentTarget)}
                    sx={{
                        textTransform: 'none',
                        borderColor: alphaBorder,
                        color: 'text.secondary',
                        '&:hover': { borderColor: 'text.primary', bgcolor: alpha(theme.palette.text.primary, 0.04) }
                    }}
                >
                    {t('Bộ lọc đã lưu')}
                    {views.length > 0 && (
                        <Box
                            component='span'
                            sx={{
                                ml: 0.75,
                                px: 0.5,
                                borderRadius: 1,
                                bgcolor: alpha(theme.palette.text.primary, 0.06),
                                color: 'text.primary'
                            }}
                        >
                            {views.length}
                        </Box>
                    )}
                </Button>

                <Button size='small' variant='contained' onClick={() => setSaveOpen(true)} sx={{ textTransform: 'none' }}>
                    {t('Lưu bộ lọc')}
                </Button>
            </Stack>

            <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
                {views.length === 0 && <MenuItem disabled>{t('Chưa có bộ lọc nào')}</MenuItem>}
                {views.map((v) => (
                    <MenuItem key={v.name} onClick={() => applyView(v)} sx={{ minWidth: 220 }}>
                        <ListItemText
                            primary={v.name}
                            secondary={`${t(RANGE_OPTIONS.find((r) => r.id === v.payload?.range)?.label || v.payload?.range || '-')} · ${
                                !v.payload?.channel || v.payload.channel === 'all'
                                    ? t('Tất cả kênh')
                                    : CHANNELS[v.payload.channel]?.label || v.payload.channel
                            }`}
                            primaryTypographyProps={{ variant: 'body2', sx: { fontWeight: 500 } }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                        />
                        <IconButton
                            size='small'
                            aria-label={t('Xoá bộ lọc')}
                            onClick={(e) => {
                                e.stopPropagation()
                                deleteView(v.name)
                            }}
                            sx={{ ml: 1 }}
                        >
                            <AppIcon name='Trash' size={14} />
                        </IconButton>
                    </MenuItem>
                ))}
            </Menu>

            <Dialog open={saveOpen} onClose={() => setSaveOpen(false)} maxWidth='xs' fullWidth>
                <DialogTitle variant='h4'>{t('Lưu bộ lọc hiện tại')}</DialogTitle>
                <DialogContent>
                    <Typography variant='body2' sx={{ color: 'text.secondary', mb: 1.5 }}>
                        {t('Đặt tên để dùng lại bộ lọc theo khoảng thời gian, kênh và nhóm.')}
                    </Typography>
                    <TextField
                        // eslint-disable-next-line jsx-a11y/no-autofocus -- intentional: focus the first field when the dialog/panel opens
                        autoFocus
                        fullWidth
                        size='small'
                        placeholder={t('VD: Facebook 30 ngày')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSaveOpen(false)} sx={{ textTransform: 'none' }}>
                        {t('Huỷ')}
                    </Button>
                    <Button variant='contained' onClick={handleSave} sx={{ textTransform: 'none' }}>
                        {t('Lưu')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

FilterBar.propTypes = {
    range: PropTypes.string.isRequired,
    onRangeChange: PropTypes.func.isRequired,
    channel: PropTypes.string.isRequired,
    onChannelChange: PropTypes.func.isRequired,
    team: PropTypes.string.isRequired,
    onTeamChange: PropTypes.func.isRequired
}

export default FilterBar
