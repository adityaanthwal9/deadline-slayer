'use client';

import { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import type { DailyBrief } from '@/types';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

export function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser. Use Chrome.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setListening(true);
    recognition.onend = () => {
      setListening(false);
      if (transcript) {
        setProcessing(true);
        setTimeout(() => {
          onTranscript(transcript);
          setProcessing(false);
          setTranscript('');
        }, 500);
      }
    };
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('');
      setTranscript(t);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [transcript, onTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={listening ? stopListening : startListening}
        className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
          listening
            ? 'bg-red-500/20 border-2 border-red-500 voice-active'
            : 'bg-amber-500/10 border-2 border-amber-500/40 hover:border-amber-500/70'
        }`}
      >
        {processing ? (
          <Loader2 size={24} className="text-amber-400 animate-spin" />
        ) : listening ? (
          <MicOff size={24} className="text-red-400" />
        ) : (
          <Mic size={24} className="text-amber-400" />
        )}
        {listening && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
        )}
      </button>

      <div className="text-center">
        {listening ? (
          <div>
            <div className="text-xs text-red-400 font-medium mb-1">LISTENING...</div>
            {transcript && (
              <div className="text-xs text-[#9898B0] max-w-[200px] text-center leading-relaxed">
                "{transcript}"
              </div>
            )}
          </div>
        ) : processing ? (
          <div className="text-xs text-amber-400">Parsing task...</div>
        ) : (
          <div className="text-xs text-[#5C5C74]">Tap to speak a task</div>
        )}
      </div>
    </div>
  );
}


interface VoiceBriefProps {
  brief: DailyBrief | null;
}

export function VoiceBriefButton({ brief }: VoiceBriefProps) {
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback(() => {
    if (!brief) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const text = [
      brief.greeting,
      brief.mission_statement,
      `Your priority mission: ${brief.top_task?.title}.`,
      brief.top_task_reason,
      brief.risk_alerts?.length > 0
        ? `Risk alerts: ${brief.risk_alerts.map(a => a.message).join('. ')}`
        : '',
      brief.motivational_note,
    ].filter(Boolean).join(' ');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to use a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.includes('Google') || v.name.includes('Alex') || v.name.includes('Daniel')
    );
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [brief, speaking]);

  if (!brief) return null;

  return (
    <button
      onClick={speak}
      title={speaking ? 'Stop playback' : 'Play JARVIS brief'}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
        speaking
          ? 'bg-amber-500/30 border border-amber-500/60 text-amber-400'
          : 'bg-white/5 border border-white/10 text-[#9898B0] hover:text-amber-400 hover:border-amber-500/30'
      }`}
    >
      {speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
    </button>
  );
}
