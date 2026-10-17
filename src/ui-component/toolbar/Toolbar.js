import * as React from 'react'
import { AppIcon } from '@/ui-component/icons/AppIcon'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { StyledToggleButton } from '../button/StyledButton'

export default function Toolbar() {
    const [view, setView] = React.useState('list')

    const handleChange = (event, nextView) => {
        setView(nextView)
    }

    return (
        <ToggleButtonGroup value={view} exclusive onChange={handleChange}>
            <StyledToggleButton variant='contained' value='list' aria-label='list'>
                <AppIcon name='List' />
            </StyledToggleButton>
            <StyledToggleButton variant='contained' value='module' aria-label='module'>
                <AppIcon name='SquaresFour' />
            </StyledToggleButton>
        </ToggleButtonGroup>
    )
}
