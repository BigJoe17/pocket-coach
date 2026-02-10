import { useState, useRef, useEffect } from 'react'
import {
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/ctx/AuthContext'
import { useSubscription } from '@/ctx/SubscriptionContext'
import { IS_EXPO_GO } from '@/lib/env'
import * as Speech from 'expo-speech'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getCoaches, Coach, DEFAULT_COACHES } from '@/lib/coaches'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThinkingIndicator } from '@/components/ui/ThinkingIndicator'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { SuggestionChips } from '@/components/chat/SuggestionChips'
import { ChatInput } from '@/components/chat/ChatInput'
import { StatusBar } from 'expo-status-bar'
import { CallModal } from '@/components/voice/CallModal'
import { useVoiceCall } from '@/hooks/voice/useVoiceCall'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function CoachChatScreen() {
  const { coach: coachId } = useLocalSearchParams<{ coach: string }>()
  const router = useRouter()
  const { user } = useAuth()

  const scrollViewRef = useRef<ScrollView>(null)

  const [currentCoach, setCurrentCoach] = useState<Coach | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [callOpen, setCallOpen] = useState(false)
  const [lastVoiceRecordingUri, setLastVoiceRecordingUri] = useState<string | null>(null)

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Friend'
  const coachForCall = currentCoach || DEFAULT_COACHES[0]
  const { state: callState, startCall, endCall } = useVoiceCall({
    coach: coachForCall,
    userName,
    userId: user?.id,
    onError: message => Alert.alert('Call error', message),
  })

  useEffect(() => {
    async function init() {
      const coaches = await getCoaches()
      const found = coaches.find(c => c.id === coachId)
      if (found) {
        setCurrentCoach(found)

        // Load history
        const json = await AsyncStorage.getItem(`chat_history_${coachId}`)
        if (json) {
          setMessages(JSON.parse(json))
        } else {
          // New Session: Add greeting
          const greeting = {
            role: 'assistant',
            content: `Welcome, ${user?.user_metadata?.full_name?.split(' ')[0] || 'Joshua'}. I'm here to listen. What's currently on your mind?`
          } as Message
          setMessages([greeting])
          await AsyncStorage.setItem(`chat_history_${coachId}`, JSON.stringify([greeting]))
        }
      }

      const v = await AsyncStorage.getItem('voice_enabled')
      setVoiceEnabled(v === 'true')
    }

    init()
    return () => {
      Speech.stop()
    }
  }, [coachId, user])

  const speak = (text: string) => {
    if (!voiceEnabled) return
    Speech.stop()
    Speech.speak(text, { rate: 0.95 })
  }

  const handleLogout = () => {
    Alert.alert('End Session', 'Save progress and exit?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Session',
        style: 'default',
        onPress: () => router.back()
      }
    ]);
  }

  const { isPro } = useSubscription()

  const handleStartCall = async () => {
    if (IS_EXPO_GO) {
      Alert.alert('Not Supported', 'Voice calls are not supported in Expo Go. Please use a development build.');
      return;
    }
    if (!isPro) {
      router.push('/paywall')
      return
    }
    setCallOpen(true)
    await startCall()
  }

  const handleEndCall = () => {
    endCall()
    setCallOpen(false)
  }

  const handleVoiceRecording = (uri: string) => {
    if (IS_EXPO_GO) return; // Should be handled by UI disabling
    if (!isPro) {
      router.push('/paywall')
      return
    }
    setLastVoiceRecordingUri(uri)
    setInputText('Voice note recorded. Tap to edit.')
  }

  async function sendMessage(text: string = inputText) {
    if (!text.trim()) return
    if (!currentCoach) return

    const userMsg: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    await AsyncStorage.setItem(`chat_history_${coachId}`, JSON.stringify(newMessages))

    setInputText('')
    setLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('coach', {
        body: {
          messages: newMessages,
          coachId: currentCoach.id,
          systemPrompt: currentCoach.systemPrompt
        },
      })

      if (error || data?.error) {
        throw new Error(error?.message || data?.error || 'Failed to get response')
      }

      const aiMsg: Message = { role: 'assistant', content: data.reply }
      const finalMessages = [...newMessages, aiMsg]
      setMessages(finalMessages)
      await AsyncStorage.setItem(`chat_history_${coachId}`, JSON.stringify(finalMessages))

      speak(data.reply)
    } catch (err: any) {
      const fallbackReply = "I'm listening. Tell me more."
      const fallbackMessages = [...newMessages, { role: 'assistant', content: fallbackReply } as Message]
      setMessages(fallbackMessages)
      await AsyncStorage.setItem(`chat_history_${coachId}`, JSON.stringify(fallbackMessages))
    } finally {
      setLoading(false)
    }
  }

  if (!currentCoach) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-950">
        <ActivityIndicator color="#000" />
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-zinc-950">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ChatHeader coach={currentCoach} logout={handleLogout} onCallPress={handleStartCall} />

        <View className="flex-1 relative">
          <ScrollView
            ref={scrollViewRef}
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 140 }}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg, i) => (
              <View
                key={i}
                className={`mb-8 max-w-[90%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}
              >
                <View
                  className={`px-6 py-4 rounded-[28px] ${msg.role === 'user'
                    ? 'bg-zinc-900 border border-zinc-900 dark:bg-zinc-100 rounded-tr-none shadow-lg shadow-zinc-200'
                    : 'bg-white border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 rounded-tl-none shadow-sm'
                    }`}
                >
                  <Text className={`text-[17px] leading-[26px] font-normal tracking-[-0.01em] ${msg.role === 'user'
                    ? 'text-white dark:text-zinc-900'
                    : 'text-zinc-800 dark:text-zinc-100'
                    }`}>
                    {msg.content}
                  </Text>
                </View>
                {/* Semantic label for accessibility/clarity */}
                <Text className={`text-[10px] mt-2 px-2 font-bold text-zinc-300 uppercase tracking-[0.1em] ${msg.role === 'user' ? 'text-right' : 'text-left'
                  }`}>
                  {msg.role === 'user' ? 'You' : currentCoach.name}
                </Text>
              </View>
            ))}

            {loading && (
              <View className="self-start mb-8 ml-2">
                <ThinkingIndicator />
              </View>
            )}
          </ScrollView>

          {/* Suggestion Chips Overlay (only when minimal history) */}
          {messages.length <= 1 && !loading && (
            <View className="absolute bottom-32 w-full">
              <SuggestionChips onSelect={sendMessage} />
            </View>
          )}

          <ChatInput
            onSend={sendMessage}
            input={inputText}
            setInput={setInputText}
            onVoiceRecording={handleVoiceRecording}
          />
        </View>

      </KeyboardAvoidingView>

      {currentCoach ? (
        <CallModal
          visible={callOpen}
          coach={currentCoach}
          state={callState}
          onEnd={handleEndCall}
        />
      ) : null}
    </SafeAreaView>
  )
}
