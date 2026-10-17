import { CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Bar, BarChart } from 'recharts'
import PropTypes from 'prop-types'
import { useTheme } from '@mui/material/styles'
import { useLanguage } from '@/store/context/LanguageContext'

export const ChartTokens = ({ data, flowNames }) => {
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
            <BarChart
                width={500}
                height={200}
                data={data}
                margin={{
                    top: 5,
                    right: 10,
                    left: 20,
                    bottom: 20
                }}
                barCategoryGap='30%'
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
                        value: t('Tokens'),
                        fill: axisColor,
                        angle: -90,
                        position: 'insideLeft',
                        offset: 10,
                        style: {
                            textAnchor: 'middle'
                        }
                    }}
                />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: theme.palette.text.primary }} />
                {flowNames.map((name, index) => (
                    <>
                        <Bar dataKey={name + ' Prompt'} name={t('{flow} Prompt', { flow: name })} stackId={`${index}_a`} fill='#2233FF' />
                        <Bar
                            dataKey={name + ' Completion'}
                            name={t('{flow} Completion', { flow: name })}
                            stackId={`${index}_a`}
                            fill='#82CA9D'
                        />
                    </>
                ))}
            </BarChart>
        </ResponsiveContainer>
    )
}

ChartTokens.propTypes = {
    data: PropTypes.array,
    flowNames: PropTypes.array
}
