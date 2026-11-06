import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Cards';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Zap,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export const AICoachView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm_init',
      sender: 'assistant',
      text: `Hello Jordan. I have reviewed your current biofeedback metrics: **78.5 kg**, Hypertrophy goal, and Push/Pull/Legs training schedule.

How can I assist your athletic preparation today? Select a prompt below or ask any question on biomechanics or nutritional timing.`,
      time: 'Just now',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestionChips = [
    'Generate 4-day split',
    'High protein low carb snack',
    'How to improve squat depth without lower back pain',
    'How should I periodize Bench Press this cycle?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsTyping(true);

    try {
      const reply = await api.sendAICoachMessage(textToSend);
      const assistantMsg: ChatMessage = {
        id: 'bot_' + Date.now(),
        sender: 'assistant',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          text: 'Unable to query athletic intelligence gateway right now. Please check local connectivity.',
          time: 'Now',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderFormattedText = (content: string) => {
    // Quick Markdown renderer for headings, bold, bullet points
    return content.split('\n').map((line, i) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={i} className="font-display font-extrabold text-sm sm:text-base text-accent mt-3 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <div key={i} className="font-bold text-text mt-2 mb-1">
            {line.replace(/\*\*/g, '')}
          </div>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-text-muted my-1 ml-2">
            <span className="text-accent font-bold">•</span>
            <span>{line.replace(/^[-*] /, '')}</span>
          </div>
        );
      }
      return (
        <p key={i} className="text-xs sm:text-sm text-text my-1 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-normal">
      {/* Header */}
      <div className="pb-2 border-b border-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-mono font-bold text-accent uppercase">
              ATHLETIC INTELLIGENCE AGENT
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text mt-1">
            AI Coach & Periodization Advisor
          </h1>
        </div>
        <div className="p-2 rounded-xl bg-accent/10 border border-accent/30 text-accent font-mono text-xs font-bold hidden sm:flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          <span>Biometric Injected</span>
        </div>
      </div>

      {/* Chat Container */}
      <Card className="p-4 sm:p-6 flex flex-col h-[650px] relative">
        {/* Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3 border-b border-border">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted shrink-0">
            Suggested:
          </span>
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="px-3 py-1.5 rounded-pill bg-surface border border-border text-xs text-text-muted hover:border-accent hover:text-accent whitespace-nowrap transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map(msg => {
            const isBot = msg.sender === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  isBot ? 'justify-start' : 'justify-end'
                }`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/40 text-accent flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-xl p-4 rounded-2xl text-left ${
                    isBot
                      ? 'bg-surface border border-border text-text'
                      : 'bg-accent text-on-accent font-medium shadow-md'
                  }`}
                >
                  {isBot ? renderFormattedText(msg.text) : <p className="text-sm">{msg.text}</p>}
                  <div className="text-[10px] opacity-60 text-right mt-1 font-mono">
                    {msg.time}
                  </div>
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-xl bg-surface border border-border text-text flex items-center justify-center shrink-0 mt-1 font-bold text-xs">
                    JD
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/40 text-accent flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-surface border border-border flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-text-muted font-mono ml-2">
                  Analyzing periodization models...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage(inputPrompt);
          }}
          className="mt-4 pt-4 border-t border-border flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={e => setInputPrompt(e.target.value)}
            placeholder="Ask about volume allocation, deloads, macro cycling, or form cues..."
            className="flex-1 min-h-[48px] px-4 py-2.5 rounded-xl bg-surface border border-border text-sm text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!inputPrompt.trim() || isTyping}
            className="min-h-[48px] px-5"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
};
