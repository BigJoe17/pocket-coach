import { ChatHeader } from '@/components/chat/ChatHeader'
import { ChatInput } from '@/components/chat/ChatInput'
import { SuggestionChips } from '@/components/chat/SuggestionChips'
import { ThinkingIndicator } from '@/components/ui/ThinkingIndicator'
import { CallModal } from '@/components/voice/CallModal'
import { useAuth } from '@/ctx/AuthContext'
import { useSubscription } from '@/ctx/SubscriptionContext'
import { useVoiceCall } from '@/hooks/voice/useVoiceCall'
import { Coach, DEFAULT_COACHES, getCoaches } from '@/lib/coaches'
import { IS_EXPO_GO } from '@/lib/env'
import { supabase } from '@/lib/supabase'
import { Feather } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Speech from 'expo-speech'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  useColorScheme,
  View
} from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function CoachChatScreen() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { coach: coachId } = useLocalSearchParams<{ coach: string }>()
  const router = useRouter()
  const { user } = useAuth()

  const scrollViewRef = useRef<ScrollView>(null)

  const [currentCoach, setCurrentCoach] = useState<Coach | null>(null)
  const [conversation, setConversation] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
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
      if (!user) return;

      try {
        // Parallelize initial lookups
        const [coaches, convsResult, voiceEnabledRaw] = await Promise.all([
          getCoaches(coachId),
          supabase
            .from('conversations')
            .select('*')
            .eq('user_id', user.id)
            .eq('coach_id', coachId)
            .order('last_message_at', { ascending: false })
            .limit(1),
          AsyncStorage.getItem('voice_enabled')
        ]);

        const found = coaches.find(c => c.id === coachId);
        if (!found) return;

        setCurrentCoach(found);
        setVoiceEnabled(voiceEnabledRaw === 'true');

        // 1. Fetch or Create Conversation
        let activeConversationId: string | null = null;
        let activeConv: any = null;

        if (convsResult.data && convsResult.data.length > 0 && found.memorySettings?.longTerm) {
          activeConversationId = convsResult.data[0].id;
          activeConv = convsResult.data[0];
          setConversation(activeConv);
        } else {
          console.log('Creating new conversation for:', coachId);
          const { data: newConv, error: createError } = await supabase
            .from('conversations')
            .insert({ user_id: user.id, coach_id: coachId })
            .select()
            .single();

          if (createError) {
            console.error('Failed to create conversation:', createError);
          }
          activeConversationId = newConv?.id;
          setConversation(newConv);
        }

        setConversationId(activeConversationId);

        // 2. Load Messages from Supabase
        if (activeConversationId) {
          const { data: history } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', activeConversationId)
            .order('created_at', { ascending: true });

          if (history && history.length > 0) {
            setMessages(history.map(m => ({ role: m.role, content: m.content })));
          } else {
            // New Session: Add greeting
            const greetingText = `Welcome, ${userName}. I'm here to listen. What's currently on your mind?`;
            const greeting = { role: 'assistant', content: greetingText } as Message;
            setMessages([greeting]);

            await supabase.from('messages').insert({
              conversation_id: activeConversationId,
              role: 'assistant',
              content: greetingText
            });
          }
        }
      } catch (err) {
        console.error('Chat init error:', err);
      }
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
    Alert.alert('Save & Exit', 'Your progress is automatically saved to the cloud.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Finish',
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
    if (IS_EXPO_GO) return;
    if (!isPro) {
      router.push('/paywall')
      return
    }
    setLastVoiceRecordingUri(uri)
    setInputText('Voice note recorded. Tap to edit.')
  }

  async function sendMessage(text: string = inputText) {
    const finalContent = text || inputText;
    if (!finalContent.trim() || !currentCoach) return

    if (!user) {
      Alert.alert('Auth Error', 'You must be logged in to send messages.');
      return;
    }

    // Ensure we have a conversationId or try to get one
    let activeConvId = conversationId;
    if (!activeConvId) {
      console.log('No active session. Attempting to create one for:', coachId);
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({ user_id: user.id, coach_id: coachId })
        .select()
        .single();

      if (createError) {
        console.error('Session creation failed:', createError);
        Alert.alert(
          'Session Error',
          `Could not establish a connection. ${createError.message}\n\nHint: Check if the 'conversations' table exists in Supabase.`
        );
        return;
      }

      if (newConv) {
        activeConvId = newConv.id;
        setConversationId(activeConvId);
        setConversation(newConv);
      }
    }

    if (!activeConvId) {
      Alert.alert('Session Error', 'Could not establish a connection. Please try again.');
      return;
    }

    const userMsg: Message = { role: 'user', content: finalContent }
    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setLoading(true)
    Keyboard.dismiss()

    try {
      // 1. Persist User Message
      const { error: msgError } = await supabase.from('messages').insert({
        conversation_id: activeConvId,
        role: 'user',
        content: finalContent
      })

      if (msgError) {
        console.error('Failed to persist message:', msgError);
        throw msgError;
      }

      // 2. Call Edge Function
      const { data, error } = await supabase.functions.invoke('coach', {
        body: {
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          userMessage: finalContent,
          coachId: currentCoach.id,
          systemPrompt: currentCoach.systemPrompt
        },
      })

      if (error || !data || data.error) {
        console.error('Edge Function Error:', error || data?.error)
        throw new Error(error?.message || data?.error || 'Intelligence service unavailable')
      }

      // 3. Persist & Show AI Message
      const aiReply = data.reply
      await supabase.from('messages').insert({
        conversation_id: activeConvId,
        role: 'assistant',
        content: aiReply
      })

      // Update Conversation Timestamp
      await supabase.from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', activeConvId)

      setMessages(prev => [...prev, { role: 'assistant', content: aiReply }])
      speak(aiReply)
    } catch (err: any) {
      console.error('Send message error:', err);
      const fallbackReply = "I'm listening closely. Can you tell me more about that?"
      setMessages(prev => [...prev, { role: 'assistant', content: fallbackReply } as Message])
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
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#09090b' : '#ffffff' }}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ChatHeader coach={currentCoach} logout={handleLogout} onCallPress={handleStartCall} />

        <View className="flex-1 relative">
          <ScrollView
            ref={scrollViewRef}
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 32, paddingBottom: 160 }}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
            showsVerticalScrollIndicator={false}
          >
            {conversation?.summary && (
              <Animated.View
                entering={FadeInDown.duration(800)}
                style={{
                  marginBottom: 48,
                  padding: 32,
                  backgroundColor: isDark ? 'rgba(39, 39, 42, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                  borderRadius: 40,
                  borderWidth: 1,
                  borderColor: isDark ? '#27272a' : '#f1f5f9',
                }}
              >
                <View className="flex-row items-center mb-4">
                  <View className="bg-brand-500/10 p-2 rounded-full">
                    <Feather name="anchor" size={14} color="#6366f1" />
                  </View>
                  <Text className="text-[10px] font-bold text-brand-500 uppercase tracking-[0.2em] ml-3">Context Anchor</Text>
                </View>
                <Text className="text-[17px] text-zinc-600 dark:text-zinc-400 leading-[26px] font-medium italic">
                  "{conversation.summary}"
                </Text>
              </Animated.View>
            )}

            {messages.map((msg, i) => (
              <Animated.View
                key={i}
                entering={FadeInDown.springify().damping(18).stiffness(80).delay(i * 30)}
                className={`mb-8 max-w-[88%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}
              >
                <View
                  style={{
                    paddingHorizontal: 28,
                    paddingVertical: 20,
                    borderRadius: 32,
                    borderTopLeftRadius: msg.role === 'assistant' ? 0 : 32,
                    borderTopRightRadius: msg.role === 'user' ? 0 : 32,
                    backgroundColor: msg.role === 'user'
                      ? (isDark ? '#f8fafc' : '#18181b')
                      : (isDark ? '#18181b' : '#ffffff'),
                    borderWidth: msg.role === 'assistant' ? 1 : 0,
                    borderColor: isDark ? '#27272a' : '#f9fafb',
                    ...(msg.role === 'user' ? {
                      elevation: 4,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8
                    } : {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                    })
                  }}
                >
                  <Text className={`text-[17px] leading-[26px] font-medium ${msg.role === 'user'
                    ? 'text-white dark:text-zinc-950'
                    : 'text-zinc-800 dark:text-zinc-100'
                    }`}>
                    {msg.content}
                  </Text>
                </View>
                <Text className={`text-[10px] mt-3 px-4 font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest ${msg.role === 'user' ? 'text-right' : 'text-left'
                  }`}>
                  {msg.role === 'user' ? 'You' : currentCoach.name}
                </Text>
              </Animated.View>
            ))}

            {loading && (
              <View className="self-start mb-12 ml-2">
                <ThinkingIndicator />
              </View>
            )}
          </ScrollView>

          {/* Suggestion Chips Overlay */}
          {messages.length <= 1 && !loading && (
            <View className="absolute bottom-36 w-full">
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
