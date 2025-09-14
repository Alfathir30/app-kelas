"use client"

import type React from "react"
import { TouchableOpacity, type ViewStyle, type TextStyle } from "react-native"
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from "react-native-reanimated"

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

interface AnimatedButtonProps {
  onPress: () => void
  children: React.ReactNode
  style?: ViewStyle
  textStyle?: TextStyle
  disabled?: boolean
  hapticFeedback?: boolean
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onPress,
  children,
  style,
  textStyle,
  disabled = false,
  hapticFeedback = true,
}) => {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }
  })

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 })
    opacity.value = withTiming(0.8, { duration: 100 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 })
    opacity.value = withTiming(1, { duration: 100 })
  }

  const handlePress = () => {
    if (!disabled) {
      // Add a slight bounce effect on press
      scale.value = withSpring(0.98, { damping: 15, stiffness: 300 }, () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 })
      })

      runOnJS(onPress)()
    }
  }

  return (
    <AnimatedTouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[style, animatedStyle]}
      activeOpacity={1}
    >
      {children}
    </AnimatedTouchableOpacity>
  )
}

export default AnimatedButton
