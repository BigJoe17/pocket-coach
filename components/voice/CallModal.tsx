import { Modal, Pressable, Text, View, Animated, Easing } from 'react-native'
import { Coach } from '@/lib/coaches'
import { CallState } from '@/lib/voice/types'
import { useEffect, useRef } from 'react'

type Props = {
  visible: boolean
  coach: Coach
  state: CallState
  onEnd: () => void
}

const stateLabel: Record<CallState, string> = {
  idle: 'Ready',
  connecting: 'Connecting',
  listening: 'Listening',
  thinking: 'Thinking',
  speaking: 'Speaking',
  ended: 'Call ended',
  error: 'Something went wrong',
}

export function CallModal({ visible, coach, state, onEnd }: Props) {
  const pulse = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const isActive = state === 'listening' || state === 'speaking'
    if (!isActive) {
      pulse.stopAnimation()
      pulse.setValue(0)
      return
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [pulse, state])

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] })
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.6] })

  return (
    <Modal visible={visible} animationType="fade" presentationStyle="fullScreen">
      <View className="flex-1 bg-slate-950 px-8 pt-16">
        <View className="absolute -top-24 -right-12 h-56 w-56 rounded-full bg-teal-500/10" />
        <View className="absolute top-24 -left-20 h-64 w-64 rounded-full bg-sky-500/10" />
        <View className="absolute -bottom-20 right-8 h-72 w-72 rounded-full bg-amber-400/10" />

        <View className="flex-1 items-center justify-center">
          <View className="items-center justify-center">
            <Animated.View
              style={{
                position: 'absolute',
                height: 168,
                width: 168,
                borderRadius: 84,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.25)',
                transform: [{ scale: ringScale }],
                opacity: ringOpacity,
              }}
            />
            <View className="h-36 w-36 rounded-full bg-white/10 items-center justify-center border border-white/20">
              <Text className="text-5xl">{coach.emoji}</Text>
            </View>
          </View>

          <Text className="text-2xl text-white font-semibold mt-6">
            {coach.name}
          </Text>
          <Text className="text-sm text-white/60 mt-2">
            {stateLabel[state]}
          </Text>
        </View>

        <View className="pb-10">
          <Pressable
            onPress={onEnd}
            className="h-14 rounded-full bg-red-500 items-center justify-center"
          >
            <Text className="text-white font-semibold text-base">End call</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}
