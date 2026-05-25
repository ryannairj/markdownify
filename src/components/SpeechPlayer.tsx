import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Square, Volume2, Headphones, Sparkles,
  ChevronDown, ChevronUp, AlertCircle, HelpCircle, AudioLines
} from 'lucide-react';
import { Document } from '../types';

interface SpeechPlayerProps {
  activeDoc: Document | null;
}

// Robust utility to strip markdown tags and deliver pristine prose
function stripMarkdown(md: string): string {
  if (!md) return '';
  return md
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove bold/italics
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove headers markup
    .replace(/^\s*#{1,6}\s+/gm, '')
    // Remove blockquotes markup
    .replace(/^\s*>\s+/gm, '')
    // Remove links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images ![text](url) -> text or empty
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Remove list markers
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Remove checkboxes
    .replace(/-\s*\[[ xX]\]\s+/g, '')
    // Replace multiple spaces/newlines
    .replace(/\s+/g, ' ')
    .trim();
}

export default function SpeechPlayer({ activeDoc }: SpeechPlayerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  
  // Auditory settings
  const [rate, setRate] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  
  // Player lifecycle states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [sentences, setSentences] = useState<string[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0);

  // References to keep sync intact during updates
  const speechRef = useRef<typeof window.speechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentSentenceIdxRef = useRef<number>(0);
  const sentencesRef = useRef<string[]>([]);
  const rateRef = useRef<number>(1.0);
  const pitchRef = useRef<number>(1.0);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Keep references updated for the asynchronous callback events
  useEffect(() => {
    currentSentenceIdxRef.current = currentSentenceIndex;
  }, [currentSentenceIndex]);

  useEffect(() => {
    sentencesRef.current = sentences;
  }, [sentences]);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  useEffect(() => {
    pitchRef.current = pitch;
  }, [pitch]);

  // Load and subscribe browser SpeechSynthesis voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        
        // Auto-select preferred voice (saved or default English)
        const savedVoice = localStorage.getItem('manuscript_tts_voice');
        if (savedVoice && availableVoices.some(v => v.voiceURI === savedVoice)) {
          setSelectedVoiceURI(savedVoice);
          const voiceObj = availableVoices.find(v => v.voiceURI === savedVoice);
          if (voiceObj) voiceRef.current = voiceObj;
        } else {
          // Fallback to first English voice or any standard physical voice
          const defaultVoice = availableVoices.find(v => v.lang.startsWith('en') && v.localService) ||
                               availableVoices.find(v => v.lang.startsWith('en')) ||
                               availableVoices[0];
          if (defaultVoice) {
            setSelectedVoiceURI(defaultVoice.voiceURI);
            voiceRef.current = defaultVoice;
          }
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      // Emergency mute on component teardown or page closure
      if (speechRef.current) {
        speechRef.current.cancel();
      }
    };
  }, []);

  // Sync vocal reference with voice selection state changes
  useEffect(() => {
    const selected = voices.find(v => v.voiceURI === selectedVoiceURI);
    if (selected) {
      voiceRef.current = selected;
    }
  }, [selectedVoiceURI, voices]);

  // Handle active document switches - stop speaking the voice thread
  useEffect(() => {
    handleStop();
  }, [activeDoc?.id]);

  // Segment current content on command
  const prepareSentences = () => {
    if (!activeDoc) return [];
    const stripped = stripMarkdown(activeDoc.content);
    if (!stripped) return [];
    
    // Split sentences precisely using lookbehind constraints keeping punctuation
    const rawSentences = stripped
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
      
    return rawSentences;
  };

  const speakSentence = (index: number) => {
    if (!speechRef.current) return;
    
    // Safety check - cease speaking at document limits
    if (index >= sentencesRef.current.length || index < 0) {
      handleStop();
      return;
    }

    // Cancel existing thread to speak cleanly
    speechRef.current.cancel();
    setCurrentSentenceIndex(index);

    const sentenceToRead = sentencesRef.current[index];
    const utterance = new SpeechSynthesisUtterance(sentenceToRead);
    
    // Apply configurations securely from live refs
    utterance.rate = rateRef.current;
    utterance.pitch = pitchRef.current;
    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }

    // Capture completion events to advance sequentially (Chrome-bug resistant)
    utterance.onend = () => {
      const nextIdx = currentSentenceIdxRef.current + 1;
      if (nextIdx < sentencesRef.current.length) {
        speakSentence(nextIdx);
      } else {
        handleStop();
      }
    };

    utterance.onerror = (e) => {
      // Prevent bubble on interrupt triggers
      if (e.error !== 'interrupted') {
        console.error('SpeechSynthesis error channel caught:', e);
        handleStop();
      }
    };

    utteranceRef.current = utterance;
    speechRef.current.speak(utterance);
  };

  const handlePlay = () => {
    if (!speechRef.current || !activeDoc) return;

    if (isPaused) {
      // Locked Resume workflow: restarts exact index to work around active Chrome lockups
      setIsPaused(false);
      setIsPlaying(true);
      speakSentence(currentSentenceIndex);
    } else {
      const prepared = prepareSentences();
      if (prepared.length === 0) return;
      
      setSentences(prepared);
      sentencesRef.current = prepared;
      setIsPlaying(true);
      setIsPaused(false);
      
      // Start of manuscript speech flow
      setCurrentSentenceIndex(0);
      currentSentenceIdxRef.current = 0;
      setTimeout(() => {
        speakSentence(0);
      }, 50);
    }
  };

  const handlePause = () => {
    if (!speechRef.current || !isPlaying) return;
    
    // Works around freeze bugs by canceling physical utterance but caching indices
    speechRef.current.cancel();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (speechRef.current) {
      speechRef.current.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSentenceIndex(0);
  };

  const handleVoiceChange = (uri: string) => {
    setSelectedVoiceURI(uri);
    localStorage.setItem('manuscript_tts_voice', uri);
    
    // Hot recalculate if playing: immediately transition speaker voice thread
    if (isPlaying) {
      const selected = voices.find(v => v.voiceURI === uri);
      if (selected) voiceRef.current = selected;
      setTimeout(() => speakSentence(currentSentenceIndex), 50);
    }
  };

  if (!activeDoc) return null;

  return (
    <div className="no-print border-b border-[#222] bg-[#0c0c0c] transition-all">
      {/* Outer Action Link */}
      <div className="flex items-center justify-between px-6 py-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-sans font-semibold text-[#888] hover:text-[#a89f8d] transition-all cursor-pointer"
          title="Listen to your manuscript draft spoken aloud"
        >
          <Headphones className={`w-3.5 h-3.5 ${isPlaying ? 'text-[#a89f8d] animate-pulse' : ''}`} />
          <span>Read Manuscript Aloud</span>
          {isPlaying && (
            <span className="flex items-center gap-1 ml-2 text-[9px] font-mono lowercase italic text-[#a89f8d]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a89f8d] animate-ping" />
              now listening...
            </span>
          )}
        </button>

        {isOpen && (
          <button 
            onClick={() => setIsOpen(false)}
            className="text-[10px] uppercase font-sans text-[#555] hover:text-[#a89f8d] transition"
          >
            Hide Panel
          </button>
        )}
      </div>

      {/* Primary Collapsible Controls Interface Row */}
      {isOpen && (
        <div className="px-6 pb-4 pt-1 space-y-3 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded bg-[#090909] border border-[#222]">
            
            {/* Audio controllers Group */}
            <div className="flex items-center gap-2">
              {!isPlaying ? (
                <button
                  onClick={handlePlay}
                  className="p-2 bg-[#a89f8d] text-[#0a0a0a] rounded hover:bg-[#b0a797] transition cursor-pointer"
                  title="Speak document"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="p-2 bg-[#1a1a1a] text-[#a89f8d] border border-[#a89f8d]/30 rounded hover:bg-[#252525] transition cursor-pointer"
                  title="Pause speaking"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" />
                </button>
              )}

              <button
                onClick={handleStop}
                disabled={!isPlaying && !isPaused}
                className="p-2 bg-[#1a1a1a] border border-[#222] text-[#555] enabled:hover:text-white enabled:hover:border-rose-900 rounded transition disabled:opacity-40 cursor-pointer"
                title="Stop speech synthetics"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>

              <div className="h-4 w-px bg-[#222] mx-1" />

              {/* Live equalizers when playing */}
              {isPlaying && (
                <div className="flex items-center gap-0.5 px-2 py-1 bg-[#1a1a1a]/30 rounded border border-[#222] text-[#a89f8d]">
                  <AudioLines className="w-3.5 h-3.5 animate-pulse" />
                  <span className="text-[9px] font-mono uppercase tracking-wider">voice feedback active</span>
                </div>
              )}
            </div>

            {/* Speeds and Voices dropdown controls */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              
              {/* Select available voice settings custom element */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-wider text-[#555] font-sans">Voice Profile:</span>
                <select
                  value={selectedVoiceURI}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  className="px-2 py-1 bg-[#0f0f0f] text-[#b1b1b1] hover:text-white hover:border-[#333] border border-[#222] rounded text-[10px] focus:outline-none focus:border-[#a89f8d] cursor-pointer"
                >
                  {voices.length === 0 ? (
                    <option value="">Browsers Voice Loading...</option>
                  ) : (
                    voices.map(voice => (
                      <option key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} ({voice.lang}) {voice.localService ? '[Local]' : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Adjust Speed modifier rate */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-wider text-[#555] font-sans">Reading Speed:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    className="accent-[#a89f8d] w-16 h-1 bg-[#222] rounded cursor-pointer"
                    title="Control reading velocity rate"
                  />
                  <span className="text-[10px] font-mono text-[#a89f8d] w-6 text-right">
                    {rate.toFixed(1)}x
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Dynamic Active Sentences visual block */}
          {(isPlaying || isPaused) && sentences.length > 0 && (
            <div className="p-3 bg-gradient-to-r from-[#141414] to-[#0d0d0d] border border-[#222] rounded-r border-l-2 border-l-[#a89f8d]">
              <div className="flex justify-between items-center text-[9px] uppercase tracking-widest text-[#555] mb-1.5 font-sans">
                <span>Active Caption Segment</span>
                <span className="font-mono text-[#a89f8d]">
                  Sentence {currentSentenceIndex + 1} of {sentences.length} ({Math.round(((currentSentenceIndex + 1) / sentences.length) * 100)}%)
                </span>
              </div>
              <p className="font-serif italic text-sm text-[#b1b1b1] leading-relaxed transition-all duration-300">
                "{sentences[currentSentenceIndex]}"
              </p>
            </div>
          )}

          {/* Quick instructions guide */}
          {!isPlaying && !isPaused && (
            <div className="flex gap-2 text-[10px] text-[#555] font-serif italic max-w-2xl px-1">
              <Sparkles className="w-3.5 h-3.5 text-[#a89f8d] flex-shrink-0 mt-0.5" />
              <span>
                To review the natural rhythm, check formatting errors, or spot awkward phrasing, click the live Play trigger. The workspace automatically strips raw Markdown characters (e.g. asterisks, hashes, code structures) to deliver clean spoken prose.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
