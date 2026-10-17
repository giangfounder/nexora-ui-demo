// material-ui
import { Stack, Tab, Tabs } from '@mui/material'
import { IconAdjustments, IconChartHistogram } from '@tabler/icons-react'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import { useLanguage } from '@/store/context/LanguageContext'
import useUrlTabState from '@/hooks/useUrlTabState'
import ScoresTab from './ScoresTab'
import CriteriaTab from './CriteriaTab'

const Prism = () => {
    const { t } = useLanguage()
    const [tab, setTab] = useUrlTabState('tab', ['scores', 'criteria'])

    return (
        <MainCard>
            <Stack spacing={2}>
                <ViewHeader title={t('Prism')} />

                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        minHeight: 44,
                        '& .MuiTab-root': {
                            minHeight: 44,
                            textTransform: 'none',
                            fontWeight: 500,
                            color: 'text.secondary',
                            px: 2,
                            '&.Mui-selected': { fontWeight: 600, color: 'text.primary' }
                        },
                        '& .MuiTabs-indicator': { height: 2 }
                    }}
                >
                    <Tab icon={<IconChartHistogram size={16} stroke={1.75} />} iconPosition='start' label={t('Bảng điểm')} />
                    <Tab icon={<IconAdjustments size={16} stroke={1.75} />} iconPosition='start' label={t('Tiêu chí chấm điểm')} />
                </Tabs>

                {tab === 0 && <ScoresTab />}
                {tab === 1 && <CriteriaTab />}
            </Stack>
        </MainCard>
    )
}

export default Prism
