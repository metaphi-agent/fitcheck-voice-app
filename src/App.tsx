import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Sparkles, ShoppingBag, Shirt, Footprints } from 'lucide-react'

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
      }
      isFinal: boolean
    }
    length: number
  }
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message?: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: SpeechRecognitionErrorEvent) => void
  onend: () => void
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

interface OutfitRecommendation {
  category: string
  items: string[]
  icon: typeof Shirt
}

const examplePrompts = [
  "Going to a dinner date",
  "Meeting friends for brunch",
  "Heading to work"
]

function App() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [outfitRecommendations, setOutfitRecommendations] = useState<OutfitRecommendation[]>([])
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    // Initialize Speech Recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognitionAPI()

      if (recognitionRef.current) {
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = ''
          let finalTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptText = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcriptText
            } else {
              interimTranscript += transcriptText
            }
          }

          setTranscript(finalTranscript || interimTranscript)

          if (finalTranscript) {
            setTimeout(() => {
              generateOutfitRecommendations(finalTranscript)
            }, 500)
          }
        }

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('')
      setShowResults(false)
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const handlePromptClick = (prompt: string) => {
    setTranscript(prompt)
    generateOutfitRecommendations(prompt)
  }

  const generateOutfitRecommendations = (input: string) => {
    const lowerInput = input.toLowerCase()

    let recommendations: OutfitRecommendation[] = []

    if (lowerInput.includes('date') || lowerInput.includes('dinner')) {
      recommendations = [
        {
          category: 'Top',
          items: ['Fitted button-down shirt', 'Slim-fit blazer', 'Dark colored polo'],
          icon: Shirt
        },
        {
          category: 'Bottom',
          items: ['Dark wash jeans', 'Chinos in navy or grey', 'Tailored dress pants'],
          icon: ShoppingBag
        },
        {
          category: 'Footwear',
          items: ['Chelsea boots', 'Leather loafers', 'Clean white sneakers'],
          icon: Footprints
        }
      ]
    } else if (lowerInput.includes('brunch') || lowerInput.includes('friends')) {
      recommendations = [
        {
          category: 'Top',
          items: ['Casual henley', 'Light sweater', 'Graphic tee with overshirt'],
          icon: Shirt
        },
        {
          category: 'Bottom',
          items: ['Light wash jeans', 'Khaki chinos', 'Comfortable joggers'],
          icon: ShoppingBag
        },
        {
          category: 'Footwear',
          items: ['Canvas sneakers', 'Casual loafers', 'Stylish sandals'],
          icon: Footprints
        }
      ]
    } else if (lowerInput.includes('work') || lowerInput.includes('office')) {
      recommendations = [
        {
          category: 'Top',
          items: ['Crisp dress shirt', 'Professional blazer', 'Knit polo'],
          icon: Shirt
        },
        {
          category: 'Bottom',
          items: ['Dress pants', 'Grey wool trousers', 'Dark chinos'],
          icon: ShoppingBag
        },
        {
          category: 'Footwear',
          items: ['Oxford dress shoes', 'Derby shoes', 'Minimalist leather sneakers'],
          icon: Footprints
        }
      ]
    } else {
      // Default casual recommendation
      recommendations = [
        {
          category: 'Top',
          items: ['Comfortable t-shirt', 'Casual button-up', 'Lightweight hoodie'],
          icon: Shirt
        },
        {
          category: 'Bottom',
          items: ['Versatile jeans', 'Casual chinos', 'Comfortable shorts'],
          icon: ShoppingBag
        },
        {
          category: 'Footwear',
          items: ['Classic sneakers', 'Casual shoes', 'Comfortable slip-ons'],
          icon: Footprints
        }
      ]
    }

    setOutfitRecommendations(recommendations)
    setShowResults(true)
    setIsListening(false)
  }

  const resetApp = () => {
    setShowResults(false)
    setTranscript('')
    setOutfitRecommendations([])
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-12 relative overflow-hidden">
      {/* Ambient glow background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/[0.02] blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/[0.015] blur-[80px] rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        {!showResults ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, filter: 'blur(20px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(20px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md flex flex-col items-center justify-center flex-1"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <motion.h1
                className="text-[64px] font-thin tracking-[-0.04em] leading-[0.9] text-white/90 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                fitcheck
              </motion.h1>
              <motion.p
                className="text-base font-light text-[#9CA3AF]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                your best fit, every time
              </motion.p>
            </div>

            {/* Example prompts */}
            <motion.div
              className="w-full mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-sm font-light text-white/40 mb-4">Try saying:</p>
              <div className="flex flex-col gap-3">
                {examplePrompts.map((prompt, i) => (
                  <motion.button
                    key={prompt}
                    onClick={() => handlePromptClick(prompt)}
                    className="px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]
                             text-white/60 hover:text-white/90 hover:bg-white/[0.05] hover:border-white/[0.15]
                             font-light text-left transition-all duration-500"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Microphone button */}
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.button
                onClick={isListening ? stopListening : startListening}
                className="relative w-24 h-24 rounded-full bg-white flex items-center justify-center
                         shadow-2xl transition-all duration-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={isListening ? {
                  boxShadow: [
                    '0 0 0 0 rgba(255, 255, 255, 0.4)',
                    '0 0 0 20px rgba(255, 255, 255, 0)',
                    '0 0 0 0 rgba(255, 255, 255, 0.4)',
                  ]
                } : {}}
                transition={isListening ? {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                } : {}}
              >
                <Mic className="w-10 h-10 text-black" strokeWidth={2} />

                {/* Pulse rings when listening */}
                {isListening && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-white/30"
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{ scale: 1.8, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-white/30"
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{ scale: 1.8, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                    />
                  </>
                )}
              </motion.button>

              <p className="text-sm font-light text-white/50">
                {isListening ? 'Listening...' : 'Tap to speak'}
              </p>

              {transcript && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 px-6 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08]"
                >
                  <p className="text-white/70 font-light text-center">{transcript}</p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, filter: 'blur(20px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(20px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl flex flex-col flex-1"
          >
            {/* Header with back button */}
            <div className="mb-8">
              <motion.button
                onClick={resetApp}
                className="px-4 py-2 rounded-lg text-white/60 hover:text-white/90
                         hover:bg-white/[0.05] transition-all duration-500 mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                ← Back
              </motion.button>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-white/70" />
                  <h2 className="text-xl font-light text-white/80">Your Outfit</h2>
                </div>
                <p className="text-sm font-light text-white/50">For: {transcript}</p>
              </motion.div>
            </div>

            {/* Outfit recommendations */}
            <div className="flex flex-col gap-4 flex-1 pb-12">
              {outfitRecommendations.map((rec, i) => (
                <motion.div
                  key={rec.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-black rounded-2xl p-6 border border-white/[0.08]
                           hover:bg-white/[0.02] hover:border-white/[0.12]
                           transition-all duration-700"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center">
                      <rec.icon className="w-5 h-5 text-white/70" />
                    </div>
                    <h3 className="text-lg font-light text-white/90">{rec.category}</h3>
                  </div>

                  <ul className="space-y-2">
                    {rec.items.map((item, j) => (
                      <motion.li
                        key={j}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.15 + j * 0.1, duration: 0.6 }}
                        className="text-white/60 font-light text-sm pl-4 border-l border-white/[0.08]"
                      >
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            {/* Try again button */}
            <motion.button
              onClick={resetApp}
              className="w-full px-6 py-4 rounded-2xl bg-white/[0.05] border border-white/[0.10]
                       text-white/80 hover:text-white/90 hover:bg-white/[0.08] hover:border-white/[0.15]
                       font-light transition-all duration-500"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Try Another Occasion
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.footer
        className="text-center mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
      >
        <p className="text-xs font-light text-white/30 tracking-wide">
          Voice-powered fashion assistant
        </p>
      </motion.footer>
    </div>
  )
}

export default App