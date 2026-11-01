// material-ui
import { styled } from '@mui/material/styles'

// project imports
import MainCard from './MainCard'

const NodeCardWrapper = styled(MainCard)(({ theme }) => ({
    background: theme.palette.card.main,
    color: theme.darkTextPrimary,
    border: `1px solid ${theme.customization?.isDarkMode ? theme.palette.grey[900] + 25 : theme.palette.primary[200] + 75}`,
    width: '300px',
    height: 'auto',
    padding: '10px',
    boxShadow: theme.customShadows.card,
    transition: 'box-shadow 150ms ease-out, border-color 150ms ease-out',
    '&:hover': {
        borderColor: theme.palette.primary.main,
        boxShadow: theme.customShadows.cardHover
    }
}))

export default NodeCardWrapper
