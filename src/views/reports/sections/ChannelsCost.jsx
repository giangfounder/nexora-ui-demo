import { Box, Stack, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useLanguage } from '@/store/context/LanguageContext'
import SectionShell from './SectionShell'
import ChartFrame from './ChartFrame'
import TableCard from './TableCard'
import ChannelName from './ChannelName'
import Tag from './Tag'
import { ChartTooltip, useChartPalette } from '../chartTheme'
import { channelCostRoi, channelRoiTrend } from '../mockReports'

const ROI_LINES = [
    { key: 'facebook', name: 'Facebook' },
    { key: 'zalo', name: 'Zalo' },
    { key: 'website', name: 'Website' },
    { key: 'shopee', name: 'Shopee' }
]

const ChannelsCost = () => {
    const { t } = useLanguage()
    const c = useChartPalette()

    return (
        <SectionShell title={t('Chi phí và ROI')}>
            <Stack spacing={2}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, '& > *': { mb: 0 } }}>
                    <ChartFrame title={t('Chi phí / khách')} height={260}>
                        <ResponsiveContainer width='100%' height='100%' minWidth={240}>
                            <BarChart data={channelCostRoi} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
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
                                <YAxis tick={c.tick} axisLine={false} tickLine={false} width={40} />
                                <Tooltip cursor={c.cursor} content={<ChartTooltip />} />
                                <Bar isAnimationActive={false} dataKey='cpa' name={t('CPA (k)')} radius={[4, 4, 0, 0]}>
                                    {channelCostRoi.map((r) => (
                                        <Cell key={r.channelId} fill={c.channel(r.channelId)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartFrame>

                    <ChartFrame title={t('ROI')} height={260}>
                        <ResponsiveContainer width='100%' height='100%' minWidth={240}>
                            <LineChart data={channelRoiTrend} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
                                <CartesianGrid strokeDasharray='2 4' stroke={c.grid} vertical={false} />
                                <XAxis dataKey='day' tick={c.tick} axisLine={false} tickLine={false} minTickGap={30} />
                                <YAxis tick={c.tick} axisLine={false} tickLine={false} width={40} />
                                <Tooltip content={<ChartTooltip />} />
                                <Legend wrapperStyle={c.legend} />
                                {ROI_LINES.map((l) => (
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
                </Box>

                <TableCard title={t('Bảng chi phí và ROI')}>
                    <Table size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell>{t('Kênh')}</TableCell>
                                <TableCell align='right'>{t('Chi tiêu (k)')}</TableCell>
                                <TableCell align='right'>{t('Doanh thu (k)')}</TableCell>
                                <TableCell align='right'>{t('CPA')}</TableCell>
                                <TableCell align='right'>{t('ROI')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {channelCostRoi.map((r) => (
                                <TableRow key={r.channelId} hover>
                                    <TableCell>
                                        <ChannelName label={r.channel} color={c.channel(r.channelId)} />
                                    </TableCell>
                                    <TableCell align='right' sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                        {r.spend}
                                    </TableCell>
                                    <TableCell align='right' sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                        {r.revenue}
                                    </TableCell>
                                    <TableCell align='right' sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                        {r.cpa}
                                    </TableCell>
                                    <TableCell align='right'>
                                        <Tag label={`${r.roi}x`} tone={c.positive} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableCard>
            </Stack>
        </SectionShell>
    )
}

export default ChannelsCost
