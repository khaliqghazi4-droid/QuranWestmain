import Image from 'next/image'
import React from 'react'

const Goldenlines = () => {
    return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div className="!absolute !left-0 !top-0 !h-full !w-1/2 scale-x-[-1] filter sepia-[1] saturate-[3.5] hue-rotate-[10deg] brightness-110 contrast-[1.05]">
                <Image
                    src="/assets/images/hero-banner/bg-lines.png"
                    alt="Golden Lines"
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'right top' }}
                />
            </div>
            <div className="!absolute !right-0 !top-0 !h-full !w-1/2 filter sepia-[1] saturate-[3.5] hue-rotate-[10deg] brightness-110 contrast-[1.05]">
                <Image
                    src="/assets/images/hero-banner/bg-lines.png"
                    alt="Golden Lines"
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'right top' }}
                />
            </div>
        </div>
    )
}

export default Goldenlines