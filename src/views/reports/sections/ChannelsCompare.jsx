import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useLanguage } from '@/store/context/LanguageContext'
import SectionShell from './SectionShell'
import ChartFrame from './ChartFrame'
import TableCard from './TableCard'
import ChannelName from './ChannelName'
import { ChartTooltip, useChartPalette } from '../chartTheme'
import { channelsMatrix } from '../mockReports'

const ChannelsCompare = () => {
    const { t } = useLanguage()
    const c = useChartPalette()

    return (
        <SectionShell title={t('So sánh kênh')}>
            <ChartFrame height={280}>
                <ResponsiveContainer width='100%' height='100%' minWidth={240}>
                    <BarChart data={channelsMatrix} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
                        <CartesianGrid strokeDasharray='2 4' stroke={c.grid} vertical={false} />
                        <XAxis
                            dataKey='channel'
                            tick={c.tick}
                            axisLine={false}
                            tickLine={false}
                            interval={0}
                            angle={-18}
                            textAnchor='end'
                            height={60}
                        />
                        <YAxis tick={c.tick} axisLine={false} tickLine={false} width={44} />
                        <Tooltip cursor={c.cursor} content={<ChartTooltip />} />
                        <Bar isAnimationActive={false} dataKey='conversations' name={t('Hội thoại')} radius={[4, 4, 0, 0]}>
                            {channelsMatrix.map((r) => (
                                <Cell key={r.channelId} fill={c.channel(r.channelId)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ChartFrame>

            <TableCard title={t('Ma trận kênh')}>
                <Table size='small'>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('Kênh')}</TableCell>
                            <TableCell align='right'>{t('Hội thoại')}</TableCell>
                            <TableCell align='right'>{t('Chuyển đổi')}</TableCell>
                            <TableCell align='right'>{t('Phản hồi TB')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {channelsMatrix.map((r) => (
                            <TableRow key={r.channelId} hover>
                                <TableCell>
                                    <ChannelName label={r.channel} color={c.channel(r.channelId)} />
                                </TableCell>
                                <TableCell align='right' sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                    {r.conversations}
                                </TableCell>
                                <TableCell align='right' sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                    {r.conversion}%
                                </TableCell>
                                <TableCell align='right' sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                                    {r.responseSec}s
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableCard>
        </SectionShell>
    )
}

export default ChannelsCompare
