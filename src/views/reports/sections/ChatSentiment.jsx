import { useMemo } from 'react'
import { useTheme } from '@mui/material/styles'
import { Box } from '@mui/material'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useLanguage } from '@/store/context/LanguageContext'
import SectionShell from './SectionShell'
import ChartFrame from './ChartFrame'
import { ChartTooltip, useChartPalette } from '../chartTheme'
import { sentimentByChannel, sentimentByDay, sentimentTotals } from '../mockReports'

const pct = (v) => `${Math.round(v * 100)}%`

const ChatSentiment = () => {
    const { t } = useLanguage()
    const theme = useTheme()
    const c = useChartPalette()
    const totals = useMemo(() => sentimentTotals.map((s) => ({ ...s, name: t(s.name) })), [t])

    const bars = [
        { key: 'positive', name: t('Tích cực'), fill: c.positive },
        { key: 'neutral', name: t('Trung lập'), fill: c.neutral },
        { key: 'negative', name: t('Tiêu cực'), fill: c.negative }
    ]

    return (
        <SectionShell title={t('Cảm xúc khách hàng')}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
                <ChartFrame title={t('Cảm xúc theo ngày')}>
                    <ResponsiveContainer width='100%' height='100%' minWidth={240}>
                        <BarChart data={sentimentByDay} stackOffset='expand' margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
                            <CartesianGrid strokeDasharray='2 4' stroke={c.grid} vertical={false} />
                            <XAxis dataKey='day' tick={c.tick} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={pct} tick={c.tick} axisLine={false} tickLine={false} width={44} />
                            <Tooltip cursor={c.cursor} content={<ChartTooltip />} />
                            <Legend wrapperStyle={c.legend} />
                            {bars.map((b) => (
                                <Bar key={b.key} isAnimationActive={false} dataKey={b.key} name={b.name} stackId='s' fill={b.fill} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </ChartFrame>

                <ChartFrame title={t('Cấu phần')}>
                    <ResponsiveContainer width='100%' height='100%' minWidth={240}>
                        <PieChart>
                            <Pie
                                isAnimationActive={false}
                                data={totals}
                                dataKey='value'
                                nameKey='name'
                                innerRadius={50}
                                outerRadius={90}
                                paddingAngle={2}
                            >
                                {totals.map((s) => (
                                    <Cell key={s.name} fill={c.tone(s.tone)} stroke={theme.palette.background.paper} strokeWidth={2} />
                                ))}
                            </Pie>
                            <Tooltip content={<ChartTooltip />} />
                            <Legend wrapperStyle={c.legend} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartFrame>
            </Box>

            <ChartFrame title={t('Heatmap theo kênh')} height={360}>
                <ResponsiveContainer width='100%' height='100%' minWidth={240}>
                    <BarChart
                        data={sentimentByChannel}
                        layout='vertical'
                        stackOffset='expand'
                        margin={{ top: 8, right: 12, bottom: 0, left: 12 }}
                    >
                        <CartesianGrid strokeDasharray='2 4' stroke={c.grid} horizontal={false} />
                        <XAxis type='number' tickFormatter={pct} tick={c.tick} axisLine={false} tickLine={false} />
                        <YAxis type='category' dataKey='channel' tick={c.tick} axisLine={false} tickLine={false} width={160} />
                        <Tooltip cursor={c.cursor} content={<ChartTooltip />} />
                        <Legend wrapperStyle={c.legend} />
                        {bars.map((b) => (
                            <Bar key={b.key} isAnimationActive={false} dataKey={b.key} name={b.name} stackId='s' fill={b.fill} />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </ChartFrame>
        </SectionShell>
    )
}

export default ChatSentiment
