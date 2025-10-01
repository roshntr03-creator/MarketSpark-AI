/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from '../contexts/LanguageProvider';
import { useBrand } from '../contexts/BrandProvider';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { MicrophoneIcon, StopCircleIcon } from '../components/icons';
import type { TranscriptEntry } from '../types/index';

// --- Audio Helper Functions ---
function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}

// --- Component ---
interface VoiceCoachScreenProps {
    onClose: () => void;
}

type ConnectionState = "idle" | "connecting" | "connected" | "error";

const VoiceCoachScreen: React.FC<VoiceCoachScreenProps> = ({ onClose }) => {
    const { t } = useTranslations();
    const { brandPersona } = useBrand();

    const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [statusText, setStatusText] = useState(t.voiceCoachStart);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
    const nextStartTimeRef = useRef(0);
    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const stopSession = useCallback(() => {
        console.log("Stopping session...");
        sessionPromiseRef.current?.then(session => session.close());
        sessionPromiseRef.current = null;
        
        scriptProcessorRef.current?.disconnect();
        mediaStreamSourceRef.current?.disconnect();
        scriptProcessorRef.current = null;
        mediaStreamSourceRef.current = null;

        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;

        inputAudioContextRef.current?.close().catch(console.error);
        outputAudioContextRef.current?.close().catch(console.error);
        inputAudioContextRef.current = null;
        outputAudioContextRef.current = null;
        
        sourcesRef.current.forEach(source => source.stop());
        sourcesRef.current.clear();
        nextStartTimeRef.current = 0;
        setConnectionState("idle");
    }, []);

    const startSession = useCallback(async () => {
        setConnectionState("connecting");
        setTranscript([]); // Clear transcript on new session

        try {
            // Initialize Audio Contexts
            // FIX: Cast window to `any` to support `webkitAudioContext` for older browser compatibility without TypeScript errors.
            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            inputAudioContextRef.current = inputAudioContext;
            outputAudioContextRef.current = outputAudioContext;

            const systemInstruction = `You are a friendly, expert marketing coach. Your personality is: "${brandPersona}". Keep your responses concise and conversational.`;
            
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction,
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
                callbacks: {
                    onopen: async () => {
                        console.log("Connection opened.");
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        streamRef.current = stream;
                        
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        mediaStreamSourceRef.current = source;
                        
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                        setConnectionState("connected");
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                        }
                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.turnComplete) {
                            const userInput = currentInputTranscriptionRef.current.trim();
                            const modelOutput = currentOutputTranscriptionRef.current.trim();
                            
                            setTranscript(prev => [
                                ...prev,
                                ...(userInput ? [{ id: Date.now() + Math.random(), speaker: 'user' as const, text: userInput }] : []),
                                ...(modelOutput ? [{ id: Date.now() + Math.random(), speaker: 'model' as const, text: modelOutput }] : []),
                            ]);
                            
                            currentInputTranscriptionRef.current = '';
                            currentOutputTranscriptionRef.current = '';
                        }

                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            const ctx = outputAudioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                            const sourceNode = ctx.createBufferSource();
                            sourceNode.buffer = audioBuffer;
                            sourceNode.connect(ctx.destination);
                            sourceNode.addEventListener('ended', () => sourcesRef.current.delete(sourceNode));
                            sourceNode.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(sourceNode);
                        }

                        if (message.serverContent?.interrupted) {
                           sourcesRef.current.forEach(source => source.stop());
                           sourcesRef.current.clear();
                           nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error("Session error:", e);
                        setConnectionState("error");
                        stopSession();
                    },
                    onclose: (e: CloseEvent) => {
                        console.log("Connection closed.", e.reason);
                        stopSession();
                    },
                },
            });
            sessionPromiseRef.current = sessionPromise;
        } catch (error) {
            console.error("Failed to start session:", error);
            setConnectionState("error");
        }
    }, [ai.live, brandPersona, stopSession]);

    const toggleSession = () => {
        if (connectionState === "idle" || connectionState === "error") {
            startSession();
        } else {
            stopSession();
        }
    };

    useEffect(() => {
        switch (connectionState) {
            case "idle": setStatusText(t.voiceCoachStart); break;
            case "connecting": setStatusText(t.voiceCoachConnecting); break;
            case "connected": setStatusText(t.voiceCoachListening); break;
            case "error": setStatusText("Error. Tap to retry."); break;
        }
    }, [connectionState, t]);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (sessionPromiseRef.current) {
                stopSession();
            }
        };
    }, [stopSession]);
    
    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-lg z-50 flex flex-col animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="voice-coach-title">
            <div className="flex-shrink-0 p-4 flex items-center justify-between border-b border-white/10">
                <div className="text-center flex-grow">
                    <h2 id="voice-coach-title" className="text-xl font-bold text-white">{t.voiceCoachTitle}</h2>
                    <p className="text-sm text-gray-400">{t.voiceCoachSubtitle}</p>
                </div>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">&times;</button>
            </div>

            <div className="flex-grow p-4 overflow-y-auto flex flex-col-reverse">
                <div className="space-y-4">
                     {transcript.map((entry) => (
                        <div key={entry.id} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${entry.speaker === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                                <p>{entry.text}</p>
                            </div>
                        </div>
                    ))}
                    {transcript.length === 0 && (
                        <div className="flex justify-start">
                             <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none">
                                <p>{t.voiceCoachInitialMessage}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-shrink-0 p-6 text-center border-t border-white/10">
                <button
                    onClick={toggleSession}
                    disabled={connectionState === 'connecting'}
                    className={`relative w-20 h-20 rounded-full transition-colors duration-300 flex items-center justify-center mx-auto disabled:opacity-50
                        ${connectionState === 'connected' ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                    {connectionState === 'connected' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                    {connectionState === 'connected' ? <StopCircleIcon className="w-10 h-10 text-white" /> : <MicrophoneIcon className="w-10 h-10 text-white" />}
                </button>
                <p className="mt-4 text-gray-300">{statusText}</p>
            </div>
        </div>
    );
};

export default VoiceCoachScreen;