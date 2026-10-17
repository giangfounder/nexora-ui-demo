import { useNavigate } from 'react-router-dom'

// material-ui
import { Card, CardContent, Chip, Stack, Typography } from '@mui/material'
import { alpha, useTheme, styled } from '@mui/material/styles'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import { useLanguage } from '@/store/context/LanguageContext'

// icons
import { IconBrandOpenai } from '@tabler/icons-react'
import { AppIcon } from '@/ui-component/icons/AppIcon'

const cards = [
    {
        title: 'Custom Assistant',
        description: 'Create custom assistant using your choice of LLMs',
        icon: <AppIcon name='Headset' size={18} />,
        iconText: 'Custom'
    },
    {
        title: 'OpenAI Assistant',
        description:
            'Create assistant using OpenAI Assistant API. This option is being deprecated; consider using Custom Assistant instead.',
        icon: <IconBrandOpenai size={18} stroke={1.75} />,
        iconText: 'OpenAI',
        deprecating: true
    }
]

const StyledCard = styled(Card)(({ theme }) => ({
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    boxShadow: 'none',
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.alpha.border}`,
    borderRadius: 10,
    transition: 'border-color 150ms ease-out, background-color 150ms ease-out',
    '&:hover': {
        borderColor: theme.palette.alpha.borderStrong,
        backgroundColor: theme.palette.alpha.hover
    }
}))

const FeatureIcon = styled('div')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 8px',
    backgroundColor: alpha(theme.palette.text.primary, 0.05),
    color: theme.palette.text.secondary,
    borderRadius: 6,
    marginBottom: 16
}))

const FeatureCards = () => {
    const navigate = useNavigate()
    const theme = useTheme()
    const { t } = useLanguage()

    const onCardClick = (index) => {
        if (index === 0) navigate('/assistants/custom')
        if (index === 1) navigate('/assistants/openai')
    }

    return (
        <Stack
            spacing={3}
            direction='row'
            sx={{
                width: '100%',
                justifyContent: 'space-between'
            }}
        >
            {cards.map((card, index) => (
                <StyledCard
                    key={index}
                    sx={{
                        flex: 1,
                        maxWidth: 'calc((100% - 16px) / 2)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        color: theme.palette.text.primary
                    }}
                    onClick={() => onCardClick(index)}
                >
                    <CardContent className='h-full relative z-10'>
                        <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 1 }}>
                            <FeatureIcon>
                                {card.icon}
                                <Typography variant='caption' sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                                    {card.iconText}
                                </Typography>
                            </FeatureIcon>
                            {card.deprecating && <Chip label={t('Deprecating')} size='small' color='warning' variant='outlined' />}
                        </Stack>
                        <Typography variant='h3' sx={{ mb: 1 }}>
                            {t(card.title)}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                            {t(card.description)}
                        </Typography>
                    </CardContent>
                </StyledCard>
            ))}
        </Stack>
    )
}

// ==============================|| ASSISTANTS ||============================== //

const Assistants = () => {
    return (
        <>
            <MainCard>
                <Stack flexDirection='column' sx={{ gap: 3 }}>
                    <ViewHeader
                        title='Assistants'
                        description='Chat assistants with instructions, tools, and files to respond to user queries'
                    />
                    <FeatureCards />
                </Stack>
            </MainCard>
        </>
    )
}

export default Assistants
