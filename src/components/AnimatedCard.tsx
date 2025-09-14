"use client"

import type React from "react"
import type { ViewStyle } from "react-native"
import Animated, { FadeIn, FadeInDown, FadeInUp, SlideInRight, SlideInLeft } from "react-native-reanimated"

interface AnimatedCardProps {
  children: React.ReactNode
  style?: ViewStyle
  delay?: number
  animation?: "fadeIn" | "slideInRight" | "slideInLeft" | "fadeInUp" | "fadeInDown"
  duration?: number
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  style,
  delay = 0,
  animation = "fadeInUp",
  duration = 300,
}) => {
  const getEnteringAnimation = () => {
    switch (animation) {
      case "fadeIn":
        return FadeIn.delay(delay).duration(duration)
      case "slideInRight":
        return SlideInRight.delay(delay).duration(duration)
      case "slideInLeft":
        return SlideInLeft.delay(delay).duration(duration)
      case "fadeInUp":
        return FadeInUp.delay(delay).duration(duration)
      case "fadeInDown":
        return FadeInDown.delay(delay).duration(duration)
      default:
        return FadeInUp.delay(delay).duration(duration)
    }
  }

  return (
    <Animated.View entering={getEnteringAnimation()} style={style}>
      {children}
    </Animated.View>
  )
}

export default AnimatedCard
