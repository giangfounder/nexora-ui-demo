import { Stack, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useLanguage } from '@/store/context/LanguageContext'
import SectionShell from './SectionShell'
import ChartFrame from './ChartFrame'
import TableCard from './TableCard'
import ChannelName from './ChannelName'
import Tag from './Tag'
import { ChartTooltip, useChartPalette } from '../chartTheme'
import { channelSla, slaTrend } from '../mockReports'

const SLA_LINES = [
    { key: 'facebook', name: 'Facebook' },
    { key: 'zalo', name: 'Zalo' },
    { key: 'website', name: 'Website' },
    { key: 'email', name: 'Email' }
]

const ChannelsSLA = () => {
    const { t } = useLanguage()
    const c = useChartPalette()

    return (
        <SectionShell title={t('SLA từng kênh')}>
            <Stack spacing={2}>
                <TableCard>
                    <Table size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell>{t('Kênh')}</TableCell>
                                <TableCell align='right'>{t('% đạt SLA')}</TableCell>
                                <TableCell align='right'>{t('Phản hồi TB')}</TableCell>
                                <TableCell align='right'>{t('% vượt SLA')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {channelSla.map((r) => (
                                <TableRow key={r.channelId} hover>
                                    <TableCell>
                                        <ChannelName label={r.channel} color={c.channel(r.channelId)} />
                                    </TableCell>
                                    <TableCell align='right'>
                                        <Tag label={`${r.slaMet}%`} tone={r.slaMet >= 90 ? c.positive : c.warning} />
                                    </TableCell>
                                    <TableCell align='right' sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                        {r.avgRespSec}s
                                    </TableCell>
                                    <TableCell align='right' sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                                        {r.breached}%
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableCard>

                <ChartFrame title={t('% đạt SLA')} height={280}>
                    <ResponsiveContainer width='100%' height='100%' minWidth={240}>
                        <LineChart data={slaTrend} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
                            <CartesianGrid strokeDasharray='2 4' stroke={c.grid} vertical={false} />
                            <XAxis dataKey='day' tick={c.tick} axisLine={false} tickLine={false} minTickGap={30} />
                            <YAxis domain={[70, 100]} tick={c.tick} axisLine={false} tickLine={false} width={40} />
                            <Tooltip content={<ChartTooltip />} />
                            <Legend wrapperStyle={c.legend} />
                            {SLA_LINES.map((l) => (
                                <Line
                                    key={l.key}
                                    isAnimationActive={false}
                                    type='monotone'
                                    dataKey={l.key}
                                    name={l.name}
                                    stroke={c.channel(l.key)}
                                    strokeWidth={2}
                                    dot={false}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </ChartFrame>
            </Stack>
        </SectionShell>
    )
}

export default ChannelsSLA
