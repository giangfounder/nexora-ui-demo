import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import PropTypes from 'prop-types'
import { useTheme } from '@mui/material/styles'
import { useLanguage } from '@/store/context/LanguageContext'

// success, failure, error
const COLORS = ['#2ecc71', '#e74c3c', '#f39c12']
const RADIAN = Math.PI / 180

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.35
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
        <text x={x} y={y} fill='black' textAnchor={x > cx ? 'start' : 'end'} dominantBaseline='central' fontSize='11'>
            {`${(percent * 100).toFixed(2)}%`}
        </text>
    )
}

export const ChartPassPrnt = ({ data }) => {
    const theme = useTheme()
    const { t } = useLanguage()
    // Pie slice names ('Pass' / 'Fail' / 'Error') are UI labels, translate them for the legend
    const translatedData = (data || []).map((d) => ({ ...d, name: t(d.name) }))
    return (
        <ResponsiveContainer width='100%' height={200}>
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                    cx='50%'
                    cy='40%'
                    labelLine={false}
                    outerRadius={65}
                    dataKey='value'
                    data={translatedData}
                    label={renderCustomizedLabel}
                >
                    <Cell key={`cell-${0}`} fill={COLORS[0]} />
                    <Cell key={`cell-${1}`} fill={COLORS[1]} />
                    <Cell key={`cell-${2}`} fill={COLORS[2]} />
                </Pie>
                <Legend
                    verticalAlign='bottom'
                    height={36}
                    formatter={(value) => <span style={{ color: theme.palette.text.primary }}>{value}</span>}
                />
            </PieChart>
        </ResponsiveContainer>
    )
}

ChartPassPrnt.propTypes = {
    data: PropTypes.array
}
