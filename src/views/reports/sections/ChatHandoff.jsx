import { useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useLanguage } from '@/store/context/LanguageContext'
import SectionShell from './SectionShell'
import ChartFrame from './ChartFrame'
import TableCard from './TableCard'
import Tag from './Tag'
import { ChartTooltip, useChartPalette } from '../chartTheme'
import { handoffByTag } from '../mockReports'

const ChatHandoff = () => {
    const { t } = useLanguage()
    const c = useChartPalette()
    const data = useMemo(() => handoffByTag.map((r) => ({ ...r, label: t(r.label) })), [t])

    return (
        <SectionShell title={t('Bàn giao xử lý')}>
            <ChartFrame height={280}>
                <ResponsiveContainer width='100%' height='100%' minWidth={240}>
                    <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
                        <CartesianGrid strokeDasharray='2 4' stroke={c.grid} vertical={false} />
                        <XAxis dataKey='label' tick={c.tick} axisLine={false} tickLine={false} />
                        <YAxis tick={c.tick} axisLine={false} tickLine={false} width={44} />
                        <Tooltip cursor={c.cursor} content={<ChartTooltip />} />
                        <Bar isAnimationActive={false} dataKey='count' name={t('Số vụ')} radius={[4, 4, 0, 0]}>
                            {data.map((r) => (
                                <Cell key={r.id} fill={c.tone(r.tone)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ChartFrame>

            <TableCard title={t('Chi tiết loại việc')}>
                <Table size='small'>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('Loại việc')}</TableCell>
                            <TableCell align='right'>{t('Số vụ')}</TableCell>
                            <TableCell align='right'>{t('Thời gian TB')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((r) => (
                            <TableRow key={r.id} hover>
                                <TableCell>
                                    <Tag label={r.label} tone={c.tone(r.tone)} />
                                </TableCell>
                                <TableCell align='right' sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                                    {r.count}
                                </TableCell>
                                <TableCell align='right' sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                                    {r.avgResolveHours} {t('giờ')}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableCard>
        </SectionShell>
    )
}

export default ChatHandoff
