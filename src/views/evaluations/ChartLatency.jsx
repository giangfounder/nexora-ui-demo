import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import PropTypes from 'prop-types'
import { useTheme } from '@mui/material/styles'
import { useLanguage } from '@/store/context/LanguageContext'

const empty = []

const COLORS = ['#00C49F', '#0088FE', '#82ca9d', '#8884d8', '#FF3322']

export const ChartLatency = ({ data, flowNames, onClick }) => {
    const theme = useTheme()
    const { t } = useLanguage()
    const axisColor = theme.palette.text.secondary
    const tooltipStyle = {
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary
    }
    return (
        <ResponsiveContainer width='95%' height={200}>
            <LineChart
                onClick={onClick}
                width={500}
                height={200}
                data={data || empty}
                margin={{
                    top: 5,
                    right: 10,
                    left: 40,
                    bottom: 20
                }}
            >
                <CartesianGrid strokeDasharray='3 3' stroke={theme.palette.divider} />
                <XAxis
                    dataKey='y'
                    stroke={theme.palette.divider}
                    tick={{ fill: axisColor, fontSize: 11 }}
                    label={{
                        value: t('Input'),
                        fill: axisColor,
                        position: 'insideBottom',
                        offset: 0,
                        style: {
                            textAnchor: 'middle'
                        }
                    }}
                />
                <YAxis
                    stroke={theme.palette.divider}
                    tick={{ fill: axisColor, fontSize: 11 }}
                    label={{
                        value: t('Latency (ms)'),
                        fill: axisColor,
                        angle: -90,
                        position: 'insideLeft',
                        offset: 0,
                        style: {
                            textAnchor: 'middle'
                        }
                    }}
                />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: theme.palette.text.primary }} />
                {flowNames.map((key, index) => (
                    <Line key={'line' + index} type='monotone' dataKey={flowNames[index]} stroke={COLORS[index]} activeDot={{ r: 8 }} />
                ))}
            </LineChart>
        </ResponsiveContainer>
    )
}

ChartLatency.propTypes = {
    data: PropTypes.array,
    flowNames: PropTypes.array,
    onClick: PropTypes.func
}
