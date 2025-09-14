"use client"

import type React from "react"
import { Modal, StyleSheet } from "react-native"
import Animated, { SlideInDown, SlideOutDown, FadeIn, FadeOut } from "react-native-reanimated"

interface AnimatedModalProps {
  visible: boolean
  onRequestClose: () => void
  children: React.ReactNode
  animationType?: "slide" | "fade"
}

const AnimatedModal: React.FC<AnimatedModalProps> = ({
  visible,
  onRequestClose,
  children,
  animationType = "slide",
}) => {
  return (
    <Modal transparent={true} visible={visible} onRequestClose={onRequestClose} statusBarTranslucent>
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.overlay}>
        <Animated.View
          entering={animationType === "slide" ? SlideInDown.duration(300).springify() : FadeIn.duration(300)}
          exiting={animationType === "slide" ? SlideOutDown.duration(200) : FadeOut.duration(200)}
          style={styles.content}
        >
          {children}
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
})

export default AnimatedModal
