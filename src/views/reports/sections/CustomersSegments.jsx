import { useMemo } from 'react'
import { useTheme } from '@mui/material/styles'
import { Box, Stack, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useLanguage } from '@/store/context/LanguageContext'
import SectionShell from './SectionShell'
import ChartFrame from './ChartFrame'
import TableCard from './TableCard'
import { ChartTooltip, useChartPalette } from '../chartTheme'
import { segmentsBreakdown, segmentsByStage, segmentsByType } from '../mockReports'

const CustomersSegments = () => {
    const { t } = useLanguage()
    const theme = useTheme()
    const c = useChartPalette()
    const byType = useMemo(() => segmentsByType.map((s) => ({ ...s, key: s.name, name: t(s.name) })), [t])
    const byStage = useMemo(() => segmentsByStage.map((s) => ({ ...s, stage: t(s.stage) })), [t])

    return (
        <SectionShell title={t('Phân khúc khách hàng')}>
            <Stack spacing={2}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, '& > *': { mb: 0 } }}>
                    <ChartFrame title={t('Theo loại')} height={280}>
                        <ResponsiveContainer width='100%' height='100%' minWidth={240}>
                            <PieChart>
                                <Pie
                                    isAnimationActive={false}
                                    data={byType}
                                    dataKey='value'
                                    nameKey='name'
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={2}
                                >
                                    {byType.map((s) => (
                                        <Cell key={s.key} fill={c.tone(s.tone)} stroke={theme.palette.background.paper} strokeWidth={2} />
                                    ))}
                                </Pie>
                                <Tooltip content={<ChartTooltip />} />
                                <Legend wrapperStyle={c.legend} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartFrame>

                    <ChartFrame title={t('Theo giai đoạn')} height={280}>
                        <ResponsiveContainer width='100%' height='100%' minWidth={240}>
                            <BarChart data={byStage} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
                                <CartesianGrid strokeDasharray='2 4' stroke={c.grid} vertical={false} />
                                <XAxis dataKey='stage' tick={c.tick} axisLine={false} tickLine={false} />
                                <YAxis tick={c.tick} axisLine={false} tickLine={false} width={40} />
                                <Tooltip cursor={c.cursor} content={<ChartTooltip />} />
                                <Bar isAnimationActive={false} dataKey='count' name={t('Khách')} fill={c.primary} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartFrame>
                </Box>

                <TableCard title={t('Chi tiết phân khúc')}>
                    <Table size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell>{t('Phân khúc')}</TableCell>
                                <TableCell align='right'>{t('Số khách')}</TableCell>
                                <TableCell align='right'>{t('Tỉ trọng')}</TableCell>
                                <TableCell align='right'>{t('LTV TB')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {segmentsBreakdown.map((r) => (
                                <TableRow key={r.segment} hover>
                                    <TableCell sx={{ fontWeight: 500 }}>{t(r.segment)}</TableCell>
                                    <TableCell align='right' sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                        {r.count}
                                    </TableCell>
                                    <TableCell align='right' sx={{ color: 'text.secondary' }}>
                                        {r.share}
                                    </TableCell>
                                    <TableCell align='right' sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                                        {r.ltv}
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

export default CustomersSegments
