import { useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useLanguage } from '@/store/context/LanguageContext'
import SectionShell from './SectionShell'
import ChartFrame from './ChartFrame'
import TableCard from './TableCard'
import Tag from './Tag'
import { ChartTooltip, useChartPalette } from '../chartTheme'
import { topTopics } from '../mockReports'

const ChatTopics = () => {
    const { t } = useLanguage()
    const c = useChartPalette()
    const topics = useMemo(() => topTopics.map((r) => ({ ...r, key: r.topic, topic: t(r.topic) })), [t])

    return (
        <SectionShell title={t('Chủ đề thịnh hành')}>
            <ChartFrame height={340}>
                <ResponsiveContainer width='100%' height='100%' minWidth={240}>
                    <BarChart data={topics} layout='vertical' margin={{ top: 8, right: 24, bottom: 0, left: 16 }}>
                        <CartesianGrid strokeDasharray='2 4' stroke={c.grid} horizontal={false} />
                        <XAxis type='number' tick={c.tick} axisLine={false} tickLine={false} />
                        <YAxis type='category' dataKey='topic' tick={c.tick} axisLine={false} tickLine={false} width={200} />
                        <Tooltip cursor={c.cursor} content={<ChartTooltip />} />
                        <Bar isAnimationActive={false} dataKey='count' name={t('Lượt hỏi')} fill={c.primary} radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartFrame>

            <TableCard>
                <Table size='small'>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('Chủ đề')}</TableCell>
                            <TableCell align='right'>{t('Lượt hỏi')}</TableCell>
                            <TableCell align='right'>{t('Biến động')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {topics.map((r) => {
                            const positive = r.trend >= 0
                            const Arrow = positive ? IconArrowUpRight : IconArrowDownRight
                            return (
                                <TableRow key={r.key} hover>
                                    <TableCell sx={{ fontWeight: 500 }}>{r.topic}</TableCell>
                                    <TableCell align='right' sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                        {r.count}
                                    </TableCell>
                                    <TableCell align='right'>
                                        <Tag
                                            tone={positive ? c.positive : c.negative}
                                            icon={<Arrow size={12} stroke={1.75} />}
                                            label={`${positive ? '+' : ''}${r.trend}%`}
                                        />
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableCard>
        </SectionShell>
    )
}

export default ChatTopics
