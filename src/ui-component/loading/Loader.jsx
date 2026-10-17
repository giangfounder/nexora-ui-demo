import { useEffect, useState } from 'react'

// material-ui
import LinearProgress from '@mui/material/LinearProgress'
import { styled } from '@mui/material/styles'

// styles
const LoaderWrapper = styled('div')({
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 1301,
    width: '100%'
})

// ==============================|| LOADER ||============================== //
// Appears only if loading takes longer than 200ms, so quick route changes don't flash a progress bar.
const Loader = () => {
    const [visible, setVisible] = useState(false)
    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 200)
        return () => clearTimeout(timer)
    }, [])
    if (!visible) return null
    return (
        <LoaderWrapper>
            <LinearProgress color='primary' />
        </LoaderWrapper>
    )
}

export default Loader
