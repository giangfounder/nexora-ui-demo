import { useState } from 'react'

import { alpha, styled, useTheme } from '@mui/material/styles'
import { tableCellClasses } from '@mui/material/TableCell'
import {
    MenuItem,
    Paper,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material'

import { useLanguage } from '@/store/context/LanguageContext'
import { CHANNELS } from '@/views/omnichannel/mockConversations'
import { getChannelIcon } from '@/views/omnichannel/utils'
import { AVAILABLE_AGENTS, AVAILABLE_SCRIPTS, mockChannelAgentMap } from './mockSettings'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    borderColor: alpha(theme.palette.text.primary, 0.06),
    [`&.${tableCellClasses.head}`]: {
        ...theme.typography.caption,
        color: theme.palette.text.secondary,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        backgroundColor: alpha(theme.palette.text.primary, 0.02)
    }
}))

const ChannelAgentTab = () => {
    const { t } = useLanguage()
    const theme = useTheme()
    const [rows, setRows] = useState(mockChannelAgentMap)

    const update = (channel, patch) => setRows((prev) => prev.map((r) => (r.channel === channel ? { ...r, ...patch } : r)))

    return (
        <Stack spacing={2}>
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{ border: `1px solid ${theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08)}`, boxShadow: 'none' }}
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>{t('Kênh')}</StyledTableCell>
                            <StyledTableCell>{t('Trả lời tự động')}</StyledTableCell>
                            <StyledTableCell>{t('Kịch bản tiếp nhận')}</StyledTableCell>
                            <StyledTableCell align='center'>{t('Tự động trả lời')}</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => {
                            const ChannelIcon = getChannelIcon(row.channel)
                            return (
                                <TableRow key={row.channel} hover>
                                    <StyledTableCell>
                                        <Stack direction='row' spacing={1} alignItems='center'>
                                            <ChannelIcon size={18} />
                                            <Typography variant='body2' sx={{ fontWeight: 500 }}>
                                                {CHANNELS[row.channel].label}
                                            </Typography>
                                        </Stack>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <TextField
                                            select
                                            size='small'
                                            fullWidth
                                            SelectProps={{
                                                inputProps: {
                                                    'aria-label': t('Trả lời tự động — {channel}', { channel: CHANNELS[row.channel].label })
                                                }
                                            }}
                                            value={row.agentId}
                                            onChange={(e) => update(row.channel, { agentId: e.target.value })}
                                        >
                                            {AVAILABLE_AGENTS.map((a) => (
                                                <MenuItem key={a.id} value={a.id}>
                                                    {a.label}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <TextField
                                            select
                                            size='small'
                                            fullWidth
                                            SelectProps={{
                                                inputProps: {
                                                    'aria-label': t('Kịch bản tiếp nhận — {channel}', {
                                                        channel: CHANNELS[row.channel].label
                                                    })
                                                }
                                            }}
                                            value={row.script}
                                            onChange={(e) => update(row.channel, { script: e.target.value })}
                                        >
                                            {AVAILABLE_SCRIPTS.map((s) => (
                                                <MenuItem key={s.id} value={s.id}>
                                                    {t(s.label)}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </StyledTableCell>
                                    <StyledTableCell align='center'>
                                        <Switch
                                            size='small'
                                            inputProps={{
                                                'aria-label': t('Tự động trả lời — {channel}', { channel: CHANNELS[row.channel].label })
                                            }}
                                            checked={row.autoReply}
                                            onChange={() => update(row.channel, { autoReply: !row.autoReply })}
                                        />
                                    </StyledTableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    )
}

export default ChannelAgentTab
