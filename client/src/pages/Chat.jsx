import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Menu, X } from 'lucide-react';

import PageTransition from '../components/layout/PageTransition';
import ChatBubble from '../components/chat/ChatBubble';
import TypingIndicator from '../components/chat/TypingIndicator';
import ChatSidebar from '../components/chat/ChatSidebar';
import Loader from '../components/ui/Loader';

import * as chatService from '../services/chatService';


export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [error, setError] = useState('');

  const scrollRef = useRef(null);


  // ============================================================
  // LOAD CONVERSATIONS
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    chatService
      .getConversations()
      .then((convos) => {
        if (cancelled) return;

        setConversations(convos);

        if (convos.length > 0) {
          setActiveId(convos[0]._id || convos[0].id);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not load your chat history.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingConvos(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);


  // ============================================================
  // LOAD MESSAGES WHEN CONVERSATION CHANGES
  // ============================================================

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    setLoadingMessages(true);

    chatService
      .getMessages(activeId)
      .then((msgs) => {
        if (!cancelled) {
          setMessages(msgs);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not load this conversation.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingMessages(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeId]);


  // ============================================================
  // AUTO SCROLL
  // ============================================================

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, sending]);


  // ============================================================
  // CREATE CONVERSATION
  // ============================================================

  const handleCreateConversation = useCallback(async () => {
    try {
      const convo = await chatService.createConversation();

      setConversations((prev) => [
        convo,
        ...prev,
      ]);

      setActiveId(convo._id || convo.id);
      setMessages([]);
      setMobileSidebarOpen(false);

    } catch {
      setError('Could not start a new chat right now.');
    }
  }, []);


  // ============================================================
  // SELECT CONVERSATION
  // ============================================================

  const handleSelectConversation = useCallback((id) => {
    setActiveId(id);
    setMobileSidebarOpen(false);
  }, []);


  // ============================================================
  // DELETE CONVERSATION
  // ============================================================

  const handleDeleteConversation = useCallback(
    async (id) => {
      try {
        await chatService.deleteConversation(id);

        setConversations((prev) =>
          prev.filter(
            (c) => (c._id || c.id) !== id
          )
        );

        if (activeId === id) {
          setActiveId(null);
          setMessages([]);
        }

      } catch {
        setError('Could not delete that conversation.');
      }
    },
    [activeId]
  );


  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const handleSend = async (e) => {
    e.preventDefault();

    const text = input.trim();

    if (!text || sending) return;

    let conversationId = activeId;

    setError('');

    try {

      // --------------------------------------------------------
      // Create conversation if none exists
      // --------------------------------------------------------

      if (!conversationId) {
        const convo =
          await chatService.createConversation(
            text.slice(0, 40)
          );

        conversationId =
          convo._id || convo.id;

        setConversations((prev) => [
          convo,
          ...prev,
        ]);

        setActiveId(conversationId);
      }


      // --------------------------------------------------------
      // Optimistically display user message
      // --------------------------------------------------------

      const userMessage = {
        role: 'user',
        content: text,
        _id: `temp-${Date.now()}`,
      };

      setMessages((prev) => [
        ...prev,
        userMessage,
      ]);

      setInput('');
      setSending(true);


      // --------------------------------------------------------
      // Send to backend
      // --------------------------------------------------------

      const reply =
        await chatService.sendMessage(
          conversationId,
          text
        );


      // --------------------------------------------------------
      // Add Nova response
      // Includes sources returned by Tavily
      // --------------------------------------------------------

      setMessages((prev) => [
        ...prev,
        reply,
      ]);

    } catch (err) {

      console.error('Chat error:', err);

      setError(
        'Your tutor could not respond just now. Please try again.'
      );

    } finally {
      setSending(false);
    }
  };


  // ============================================================
  // UI
  // ============================================================

  return (
    <PageTransition className="flex h-full flex-col lg:flex-row">

      {/* ======================================================
          DESKTOP SIDEBAR
      ====================================================== */}

      <div className="hidden w-72 shrink-0 border-r border-white/10 lg:block">

        {loadingConvos ? (

          <div className="flex h-full items-center justify-center">
            <Loader size="sm" />
          </div>

        ) : (

          <ChatSidebar
            conversations={conversations}
            activeId={activeId}
            onSelect={handleSelectConversation}
            onCreate={handleCreateConversation}
            onDelete={handleDeleteConversation}
            className="h-full"
          />

        )}

      </div>


      {/* ======================================================
          MOBILE SIDEBAR
      ====================================================== */}

      <AnimatePresence>

        {mobileSidebarOpen && (
          <>

            {/* Overlay */}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setMobileSidebarOpen(false)
              }
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            />


            {/* Drawer */}

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-void lg:hidden"
            >

              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">

                <span className="text-sm font-medium text-slate-200">
                  Your chats
                </span>

                <button
                  onClick={() =>
                    setMobileSidebarOpen(false)
                  }
                  className="text-slate-400"
                >
                  <X size={20} />
                </button>

              </div>


              <ChatSidebar
                conversations={conversations}
                activeId={activeId}
                onSelect={handleSelectConversation}
                onCreate={handleCreateConversation}
                onDelete={handleDeleteConversation}
                className="h-[calc(100%-49px)]"
              />

            </motion.div>

          </>
        )}

      </AnimatePresence>


      {/* ======================================================
          CHAT AREA
      ====================================================== */}

      <div className="flex min-w-0 flex-1 flex-col">


        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 lg:px-6">

          <button
            onClick={() =>
              setMobileSidebarOpen(true)
            }
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 lg:hidden"
            aria-label="Open chat history"
          >
            <Menu size={20} />
          </button>


          <div>

            <h1 className="font-display text-base font-semibold text-parchment">
              Tutor chat
            </h1>

            <p className="text-xs text-slate-500">
              Ask about anything, not just your notes
            </p>

          </div>

        </div>


        {/* ====================================================
            MESSAGES
        ==================================================== */}

        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto px-4 py-6 lg:px-6"
        >

          {loadingMessages ? (

            <div className="flex h-full items-center justify-center">
              <Loader size="sm" />
            </div>

          ) : messages.length === 0 ? (

            <div className="flex h-full flex-col items-center justify-center text-center">

              <p className="font-display text-lg font-medium text-slate-200">
                What are you studying today?
              </p>

              <p className="mt-1.5 max-w-xs text-sm text-slate-500">
                Ask a question, paste a tricky problem, or bring up one of your uploaded notes.
              </p>

            </div>

          ) : (

            messages.map((m, i) => (

              <ChatBubble
                key={m._id || m.id || i}

                role={m.role}

                content={m.content}

                {/* 🔎 IMPORTANT:
                    Pass Tavily sources to ChatBubble */}
                sources={m.sources || []}

                timestamp={
                  m.createdAt
                    ? new Date(
                        m.createdAt
                      ).toLocaleTimeString(
                        [],
                        {
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )
                    : ''
                }
              />

            ))

          )}


          {/* Typing indicator */}

          {sending && <TypingIndicator />}

        </div>


        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <p className="px-4 pb-2 text-xs text-rose-400 lg:px-6">
            {error}
          </p>
        )}


        {/* ====================================================
            INPUT
        ==================================================== */}

        <form
          onSubmit={handleSend}
          className="border-t border-white/10 p-3 lg:p-4"
        >

          <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 focus-within:border-amber-400/60">

            <textarea
              value={input}

              onChange={(e) =>
                setInput(e.target.value)
              }

              onKeyDown={(e) => {

                if (
                  e.key === 'Enter' &&
                  !e.shiftKey
                ) {
                  e.preventDefault();
                  handleSend(e);
                }

              }}

              placeholder="Ask your tutor anything..."

              rows={1}

              className="max-h-32 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-parchment outline-none placeholder:text-slate-500"
            />


            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-indigo-500 text-white transition-opacity disabled:opacity-40"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>

          </div>

        </form>

      </div>

    </PageTransition>
  );
}
