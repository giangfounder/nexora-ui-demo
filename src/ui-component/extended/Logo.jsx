import { useLayoutEffect, useRef, useState } from 'react'
import logo from '@/assets/images/nexora_logo_primary.svg'
import logoDark from '@/assets/images/nexora_logo_white.svg'

import { useSelector } from 'react-redux'

import { clearLogoArrival, readLogoArrival } from '@/ui-component/mira/miraHandoff'

// Right after login the big lockup from the sign-in screen hops up into this spot.
const buildLogoFrames = (from, to) => {
    const dx = from.x + from.width / 2 - (to.left + to.width / 2)
    const dy = from.y + from.height / 2 - (to.top + to.height / 2)
    const s0 = from.width / to.width
    const hop = Math.max(40, Math.abs(dy) * 0.18)
    const frames = [
        { offset: 0, transform: `translate(${dx}px, ${dy}px) scale(${s0})` },
        { offset: 0.12, transform: `translate(${dx}px, ${dy + 6}px) scale(${s0 * 1.02}, ${s0 * 0.96})` }
    ]
    const STEPS = 10
    for (let i = 1; i <= STEPS; i++) {
        const t = i / STEPS
        const eased = 1 - Math.pow(1 - t, 2)
        const s = s0 + (1 - s0) * eased
        frames.push({
            offset: 0.12 + 0.63 * t,
            transform: `translate(${dx * (1 - eased)}px, ${dy * (1 - eased) - hop * Math.sin(Math.PI * t)}px) scale(${s})`
        })
    }
    frames.push(
        { offset: 0.84, transform: 'translate(0px, 2px) scale(1.04, 0.94)' },
        { offset: 0.92, transform: 'translate(0px, -4px) scale(0.99, 1.02)' },
        { offset: 1, transform: 'translate(0px, 0px) scale(1)' }
    )
    return frames
}

// ==============================|| LOGO ||============================== //

const Logo = () => {
    const customization = useSelector((state) => state.customization)
    const imgRef = useRef(null)
    // Pure initializer (StrictMode runs it twice); cleared once the hop starts.
    const [arrival] = useState(readLogoArrival)

    useLayoutEffect(() => {
        const img = imgRef.current
        if (!arrival || !img || !img.animate) return undefined
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            clearLogoArrival()
            return undefined
        }
        let animation = null
        const start = () => {
            const to = img.getBoundingClientRect()
            if (!to.width) return
            animation = img.animate(buildLogoFrames(arrival, to), { duration: 1000, easing: 'linear', fill: 'backwards' })
            clearLogoArrival()
        }
        // Width is `auto` until the SVG has loaded; keep it hidden until the hop can start from the right place.
        const onLoad = () => {
            img.style.opacity = ''
            start()
        }
        if (img.complete && img.naturalWidth) start()
        else {
            img.style.opacity = '0'
            img.addEventListener('load', onLoad, { once: true })
        }
        return () => {
            img.removeEventListener('load', onLoad)
            animation?.cancel()
        }
    }, [arrival])

    return (
        <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'row', marginLeft: '-3px' }}>
            <img
                ref={imgRef}
                style={{ objectFit: 'contain', height: 48, width: 'auto', display: 'block', position: 'relative', zIndex: 2 }}
                src={customization.isDarkMode ? logoDark : logo}
                alt='NEXORA'
                data-handoff='logo'
            />
        </div>
    )
}

export default Logo
