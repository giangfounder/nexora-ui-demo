import { Stack, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useLanguage } from '@/store/context/LanguageContext'
import SectionShell from './SectionShell'
import ChartFrame from './ChartFrame'
import TableCard from './TableCard'
import KPIRow from '../KPIRow'
import { ChartTooltip, useChartPalette } from '../chartTheme'
import { customersGrowth90d, customersKpi, topSpendCustomers } from '../mockReports'

const CustomersOverview = () => {
    const { t, locale } = useLanguage()
    const c = useChartPalette()

    const metrics = ['total', 'new', 'churn', 'ltv'].map((k) => ({ ...customersKpi[k], label: t(customersKpi[k].label) }))

    return (
        <SectionShell title={t('Tổng quan khách hàng')}>
            <Stack spacing={2}>
                <KPIRow metrics={metrics} />

                <ChartFrame title={t('Khách hàng')}>
                    <ResponsiveContainer width='100%' height='100%' minWidth={240}>
                        <AreaChart data={customersGrowth90d} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
                            <CartesianGrid strokeDasharray='2 4' stroke={c.grid} vertical={false} />
                            <XAxis dataKey='day' tick={c.tick} axisLine={false} tickLine={false} minTickGap={40} />
                            <YAxis tick={c.tick} axisLine={false} tickLine={false} width={44} />
                            <Tooltip content={<ChartTooltip />} />
                            <Legend wrapperStyle={c.legend} />
                            <Area
                                isAnimationActive={false}
                                type='monotone'
                                dataKey='total'
                                name={t('Tổng')}
                                stroke={c.primary}
                                fill={c.primary}
                                fillOpacity={0.08}
                                strokeWidth={2}
                            />
                            <Area
                                isAnimationActive={false}
                                type='monotone'
                                dataKey='active'
                                name={t('Đang hoạt động')}
                                stroke={c.secondary}
                                fill={c.secondary}
                                fillOpacity={0.08}
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartFrame>

                <TableCard title={t('Khách hàng chi tiêu cao nhất')}>
                    <Table size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell>{t('Khách hàng')}</TableCell>
                                <TableCell align='right'>{t('Đơn')}</TableCell>
                                <TableCell align='right'>{t('Doanh số')}</TableCell>
                                <TableCell align='right'>{t('Mua gần nhất')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {topSpendCustomers.map((r) => (
                                <TableRow key={r.id} hover>
                                    <TableCell sx={{ fontWeight: 500 }}>{r.name}</TableCell>
                                    <TableCell align='right' sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                        {r.orders}
                                    </TableCell>
                                    <TableCell align='right' sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                                        {r.spend}
                                    </TableCell>
                                    <TableCell align='right' sx={{ color: 'text.secondary' }}>
                                        {new Date(`${r.lastAt}T00:00:00`).toLocaleDateString(locale)}
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

export default CustomersOverview
