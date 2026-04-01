import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { text: 'text-lg', sub: 'text-[9px]' },
  md: { text: 'text-xl', sub: 'text-[10px]' },
  lg: { text: 'text-2xl', sub: 'text-xs' },
}

export function Logo({ size = 'md' }: LogoProps) {
  const s = sizes[size]
  return (
    <Link href="/" className="flex flex-col leading-none group">
      <span
        className={`font-display font-bold tracking-tight text-[#FAFAFA] ${s.text} group-hover:text-[#C0C0C0] transition-colors duration-150`}
      >
        VILLA<span className="text-[#C0C0C0]">TECH</span>
      </span>
      <span className={`font-body ${s.sub} text-[#888888] tracking-widest uppercase`}>
        Tecnología que trabaja para ti
      </span>
    </Link>
  )
}
