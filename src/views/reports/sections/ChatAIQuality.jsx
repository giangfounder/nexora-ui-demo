import { Stack } from '@mui/material'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useLanguage } from '@/store/context/LanguageContext'
import SectionShell from './SectionShell'
import ChartFrame from './ChartFrame'
import KPIRow from '../KPIRow'
import { ChartTooltip, useChartPalette } from '../chartTheme'
import { aiQualityByDay, aiQualityKpi } from '../mockReports'

const ChatAIQuality = () => {
    const { t } = useLanguage()
    const c = useChartPalette()

    const metrics = ['rating', 'thumbsUp', 'handoff', 'firstResponse'].map((k) => ({ ...aiQualityKpi[k], label: t(aiQualityKpi[k].label) }))

    return (
        <SectionShell title={t('Chất lượng phản hồi tự động')}>
            <Stack spacing={2}>
                <KPIRow metrics={metrics} />

                <ChartFrame title={t('Đánh giá trung bình')}>
                    <ResponsiveContainer width='100%' height='100%' minWidth={240}>
                        <LineChart data={aiQualityByDay} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
                            <CartesianGrid strokeDasharray='2 4' stroke={c.grid} vertical={false} />
                            <XAxis dataKey='day' tick={c.tick} axisLine={false} tickLine={false} minTickGap={20} />
                            <YAxis yAxisId='rating' domain={[3.5, 5]} tick={c.tick} axisLine={false} tickLine={false} width={40} />
                            <YAxis
                                yAxisId='pct'
                                orientation='right'
                                domain={[0, 100]}
                                tick={c.tick}
                                axisLine={false}
                                tickLine={false}
                                width={40}
                            />
                            <Tooltip content={<ChartTooltip />} />
                            <Legend wrapperStyle={c.legend} />
                            <Line
                                isAnimationActive={false}
                                yAxisId='rating'
                                type='monotone'
                                dataKey='rating'
                                name={t('Rating (0-5)')}
                                stroke={c.positive}
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                isAnimationActive={false}
                                yAxisId='pct'
                                type='monotone'
                                dataKey='thumbsUp'
                                name={t('Tích cực (%)')}
                                stroke={c.secondary}
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartFrame>
            </Stack>
        </SectionShell>
    )
}

export default ChatAIQuality
