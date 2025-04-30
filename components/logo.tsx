import Image from "next/image"

interface LogoProps {
  size?: number
  showText?: boolean
  className?: string
}

export default function Logo({ size = 24, showText = true, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative flex items-center justify-center rounded-full bg-primary p-1">
        <Image
          src="/dumbbell-icon.png"
          alt="Dumbbell icon"
          width={size}
          height={size}
          className="text-primary-foreground"
        />
      </div>
      {showText && <span className="ml-2 font-bold tracking-tight">Calistenia</span>}
    </div>
  )
}
