import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

import { Box } from '@mui/material'

const BLUE = '#2563EB'
const BLUE_DARK = '#1D4ED8'
const INK = '#1F2937'
const CYAN = '#22D3EE'

const MiraMascot = ({ size = 64, running = false, cheerful = false, interactive = false }) => {
    const svgRef = useRef(null)
    const pupilsRef = useRef(null)
    const heartId = useRef(0)
    const [blink, setBlink] = useState(false)
    const [hovered, setHovered] = useState(false)
    const [hop, setHop] = useState(0)
    const [hearts, setHearts] = useState([])
    const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

    // Click: hop and pop a heart; every click restarts the hop.
    const onPoke = () => {
        setHop((n) => n + 1)
        const id = ++heartId.current
        const drift = Math.round((Math.random() - 0.5) * 40)
        setHearts((prev) => [...prev.slice(-4), { id, drift }])
        window.setTimeout(() => setHearts((prev) => prev.filter((h) => h.id !== id)), 950)
    }
    const happy = interactive && hovered

    useEffect(() => {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        let blinkTimer
        let openTimer

        const scheduleBlink = () => {
            blinkTimer = window.setTimeout(() => {
                setBlink(true)
                openTimer = window.setTimeout(() => {
                    setBlink(false)
                    scheduleBlink()
                }, 130)
            }, 2400 + Math.random() * 2600)
        }

        if (!reducedMotion) scheduleBlink()

        const onPointerMove = (event) => {
            if (!svgRef.current || !pupilsRef.current) return
            const bounds = svgRef.current.getBoundingClientRect()
            const centerX = bounds.left + bounds.width / 2
            const centerY = bounds.top + bounds.height * 0.46
            const dx = event.clientX - centerX
            const dy = event.clientY - centerY
            const distance = Math.hypot(dx, dy) || 1
            const travel = Math.min(3.4, distance / 70)
            pupilsRef.current.setAttribute('transform', `translate(${(dx / distance) * travel} ${(dy / distance) * travel})`)
        }

        window.addEventListener('pointermove', onPointerMove, { passive: true })
        return () => {
            window.clearTimeout(blinkTimer)
            window.clearTimeout(openTimer)
            window.removeEventListener('pointermove', onPointerMove)
        }
    }, [])

    return (
        <Box
            aria-hidden
            {...(interactive && {
                onPointerEnter: () => setHovered(true),
                onPointerLeave: () => setHovered(false),
                onClick: onPoke
            })}
            sx={{
                position: 'relative',
                width: size,
                height: size,
                lineHeight: 0,
                ...(interactive && { cursor: 'pointer', pointerEvents: 'auto', WebkitTapHighlightColor: 'transparent' }),
                transformOrigin: '50% 92%',
                '@keyframes miraToddle': {
                    '0%, 100%': { transform: 'translateY(0) rotate(-4deg) scale(1.03, 0.97)' },
                    '25%': { transform: 'translateY(-5px) rotate(0deg) scale(0.98, 1.02)' },
                    '50%': { transform: 'translateY(0) rotate(4deg) scale(1.03, 0.97)' },
                    '75%': { transform: 'translateY(-5px) rotate(0deg) scale(0.98, 1.02)' }
                },
                animation: running ? 'miraToddle 460ms ease-in-out infinite' : 'none',
                // Cheerful idle: right hand pops up past the shoulder and waves hello, left hand bobs,
                // feet kick out of step. Each limb pivots on its own base (fill-box).
                '& .mm-limb': { transformBox: 'fill-box', transformOrigin: '50% 100%' },
                '@keyframes mmWave': {
                    '0%, 100%': { transform: 'translate(0px, 0px) rotate(0deg)' },
                    '14%': { transform: 'translate(16.8px, -11.1px) rotate(-35deg)' },
                    '28%': { transform: 'translate(16.8px, -11.1px) rotate(10deg)' },
                    '42%': { transform: 'translate(16.8px, -11.1px) rotate(-35deg)' },
                    '56%': { transform: 'translate(16.8px, -11.1px) rotate(10deg)' },
                    '70%': { transform: 'translate(16.8px, -11.1px) rotate(-35deg)' },
                    '86%': { transform: 'translate(0px, 0px) rotate(0deg)' }
                },
                '@keyframes mmBob': {
                    '0%, 100%': { transform: 'translate(0px, 0px) rotate(0deg)' },
                    '50%': { transform: 'translate(-2px, -6px) rotate(24deg)' }
                },
                '@keyframes mmKick': {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(-3px) rotate(-14deg)' }
                },
                ...(cheerful && {
                    '& .mm-arm-r': { animation: 'mmWave 1.8s ease-in-out infinite' },
                    '& .mm-arm-l': { animation: 'mmBob 0.9s ease-in-out infinite' },
                    '& .mm-leg-l': { animation: 'mmKick 0.9s ease-in-out infinite' },
                    '& .mm-leg-r': { animation: 'mmKick 0.9s ease-in-out 0.45s infinite' }
                }),
                '@keyframes mmHop': {
                    '0%': { transform: 'translateY(0) scale(1, 1)' },
                    '18%': { transform: 'translateY(0) scale(1.1, 0.88)' },
                    '45%': { transform: 'translateY(-26%) scale(0.94, 1.08) rotate(-6deg)' },
                    '72%': { transform: 'translateY(0) scale(1.1, 0.9)' },
                    '86%': { transform: 'translateY(-5%) scale(0.98, 1.02)' },
                    '100%': { transform: 'translateY(0) scale(1, 1)' }
                },
                '@keyframes mmHeart': {
                    '0%': { opacity: 0, transform: 'translate(-50%, 0) scale(0.4)' },
                    '20%': { opacity: 1, transform: 'translate(-50%, -20%) scale(1.1)' },
                    '100%': { opacity: 0, transform: 'translate(calc(-50% + var(--drift)), -170%) scale(0.9)' }
                },
                '& .mm-hop': { width: '100%', height: '100%', transformOrigin: '50% 90%' },
                // Idle breathing: the mochi gently puffs up and settles
                '@keyframes mmBreathe': {
                    '0%, 100%': { transform: 'scale(1, 1)' },
                    '50%': { transform: 'scale(1.025, 0.975)' }
                },
                '& .mm-breathe': { transformOrigin: '50% 95%', animation: 'mmBreathe 3.2s ease-in-out infinite' },
                '& .mm-hop.is-hopping': { animation: 'mmHop 560ms cubic-bezier(0.3, 0.7, 0.4, 1)' },
                '& .mm-heart': {
                    position: 'absolute',
                    left: '50%',
                    top: '-4%',
                    width: '30%',
                    height: 'auto',
                    zIndex: 1,
                    pointerEvents: 'none',
                    animation: 'mmHeart 950ms ease-out forwards'
                },
                '@media (prefers-reduced-motion: reduce)': {
                    animation: 'none',
                    '& .mm-hop, & .mm-heart, & .mm-breathe': { animation: 'none' },
                    '& .mm-limb': { animation: 'none' }
                }
            }}
        >
            {hearts.map((h) => (
                <svg key={h.id} className='mm-heart' viewBox='0 0 24 22' style={{ '--drift': `${h.drift}px` }}>
                    <path d='M12 21s-9-5.6-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.4-9 12-9 12z' fill='#FB7185' />
                </svg>
            ))}
            <div key={hop} className={`mm-hop${hop ? ' is-hopping' : ''}`}>
                <svg ref={svgRef} className='mm-breathe' viewBox='0 0 100 100' width='100%' height='100%' style={{ overflow: 'visible' }}>
                    {/* Orbit halo — the NEXORA "Orbital X" arcs, with a moon circling it */}
                    <ellipse cx='50' cy='10.4' rx='21.2' ry='5.5' fill='none' stroke={CYAN} strokeWidth='2.3' />
                    {reducedMotion ? (
                        <circle cx='69.3' cy='8.1' r='2.8' fill={CYAN} />
                    ) : (
                        <circle cx='0' cy='0' r='2.8' fill={CYAN}>
                            <animateMotion
                                dur='5s'
                                repeatCount='indefinite'
                                path='M71.2 10.4 a21.2 5.5 0 1 1 -42.4 0 a21.2 5.5 0 1 1 42.4 0'
                            />
                        </circle>
                    )}

                    <ellipse cx='50' cy='96' rx='24.8' ry='3.2' fill={BLUE} opacity='0.14' />
                    <ellipse className='mm-limb mm-leg-l' cx='37.1' cy='89.6' rx='7.8' ry='5.5' fill={BLUE_DARK} />
                    <ellipse className='mm-limb mm-leg-r' cx='62.9' cy='89.6' rx='7.8' ry='5.5' fill={BLUE_DARK} />

                    {/* Mochi body */}
                    <path
                        d='M50 16 C77.6 16 88.6 38 88.6 58.3 C88.6 80.4 72.1 91.4 50 91.4 C27.9 91.4 11.4 80.4 11.4 58.3 C11.4 38 22.4 16 50 16 Z'
                        fill={BLUE}
                    />
                    <g transform='rotate(20 16 66.6)'>
                        <ellipse className='mm-limb mm-arm-l' cx='16' cy='66.6' rx='6' ry='7.8' fill={BLUE_DARK} />
                    </g>
                    <g transform='rotate(-30 84 62.9)'>
                        <ellipse className='mm-limb mm-arm-r' cx='84' cy='62.9' rx='6' ry='7.8' fill={BLUE_DARK} />
                    </g>
                    <ellipse cx='31.4' cy='30.7' rx='10.1' ry='4.6' fill='#fff' opacity='0.3' transform='rotate(-24 31.4 30.7)' />

                    {/* Face */}
                    <path
                        d='M50 32.5 C70.2 32.5 78.5 41.7 78.5 53.7 C78.5 66.6 67.5 73.9 50 73.9 C32.5 73.9 21.5 66.6 21.5 53.7 C21.5 41.7 29.8 32.5 50 32.5 Z'
                        fill='#FFFFFF'
                    />

                    {happy ? (
                        // Hovered: squinting ^^ eyes and a big open smile
                        <g stroke={INK} strokeWidth='2.8' strokeLinecap='round' fill='none'>
                            <path d='M33 54.5 q6 -7.5 12 0' />
                            <path d='M55 54.5 q6 -7.5 12 0' />
                        </g>
                    ) : (
                        <g
                            style={{
                                transformBox: 'fill-box',
                                transformOrigin: 'center',
                                transform: blink ? 'scaleY(0.08)' : 'scaleY(1)',
                                transition: 'transform 70ms ease-out'
                            }}
                        >
                            <g ref={pupilsRef}>
                                <ellipse cx='39' cy='52.8' rx='6.4' ry='7.8' fill={INK} />
                                <ellipse cx='61' cy='52.8' rx='6.4' ry='7.8' fill={INK} />
                                {/* two sparkles per eye */}
                                <circle cx='41.3' cy='49.5' r='2.5' fill='#fff' />
                                <circle cx='63.3' cy='49.5' r='2.5' fill='#fff' />
                                <circle cx='37.2' cy='56.4' r='1.15' fill='#fff' />
                                <circle cx='59.2' cy='56.4' r='1.15' fill='#fff' />
                            </g>
                        </g>
                    )}

                    <ellipse
                        cx='28.8'
                        cy='63.8'
                        rx={happy ? 5.4 : 4.6}
                        ry={happy ? 3.3 : 2.8}
                        fill='#FB7185'
                        opacity={happy ? 0.85 : 0.6}
                    />
                    <ellipse
                        cx='71.2'
                        cy='63.8'
                        rx={happy ? 5.4 : 4.6}
                        ry={happy ? 3.3 : 2.8}
                        fill='#FB7185'
                        opacity={happy ? 0.85 : 0.6}
                    />
                    {happy ? (
                        <g>
                            <path d='M45.2 62 Q50 69.5 54.8 62 Z' fill={INK} strokeLinejoin='round' stroke={INK} strokeWidth='1.1' />
                            <path d='M47.3 65.8 Q50 64 52.7 65.8 Q50 67.6 47.3 65.8 Z' fill='#FB7185' />
                        </g>
                    ) : (
                        // ω mouth
                        <path
                            d='M46.3 63.2 q1.85 2.4 3.7 0 q1.85 2.4 3.7 0'
                            stroke={INK}
                            strokeWidth='1.7'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            fill='none'
                        />
                    )}
                </svg>
            </div>
        </Box>
    )
}

MiraMascot.propTypes = {
    size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    running: PropTypes.bool,
    cheerful: PropTypes.bool,
    interactive: PropTypes.bool
}

export default MiraMascot
