'use client'
import { useState } from 'react'
import { getNameInitials } from './utils'
import cn from '@/utils/classnames'

type AvatarProps = {
  name: string
  avatar?: string
  size?: number
  className?: string
  textClassName?: string
  showInitials?: boolean
}
const Avatar = ({
  name,
  avatar,
  size = 30,
  className,
  textClassName,
  showInitials,
}: AvatarProps) => {
  let avatarClassName = 'shrink-0 flex items-center rounded-full'
  const style = { width: `${size}px`, height: `${size}px`, fontSize: `${size}px`, lineHeight: `${size}px` }
  const [imgError, setImgError] = useState(false)

  const handleError = () => {
    setImgError(true)
  }

  if (avatar && !imgError) {
    return (
      <img
        className={cn(avatarClassName, className)}
        style={style}
        alt={name}
        src={avatar}
        onError={handleError}
      />
    )
  }

  avatarClassName = `${avatarClassName} bg-primary-600`

  if (showInitials) {
    return (
      <div
        className={cn(avatarClassName, 'justify-center overflow-hidden', className)}
        style={style}
      >
        <div
          className={cn(textClassName, 'text-center text-white scale-[0.4]')}
        >
          {getNameInitials(name)}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(avatarClassName, className)}
      style={style}
    >
      <div
        className={cn(textClassName, 'text-center text-white scale-[0.4]')}
        style={style}
      >
        {name[0].toLocaleUpperCase()}
      </div>
    </div>
  )
}

export default Avatar
