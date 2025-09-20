import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { ScrollArea } from "./ui/scroll-area";
import { MessageCircle, AlertCircle, X, Minimize2, Maximize2 } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: string;
  question: string;
  answer: string | null;
  timestamp: Date;
}

const QUESTIONS = [
  { 
    id: 1, 
    text: "What are today's visitor stats?", 
    url: "/api/stats/today",
    description: "Get total visitors, peak hours, and current occupancy"
  },
  { 
    id: 2, 
    text: "Which zone is most crowded?", 
    url: "/api/zones/most-crowded",
    description: "View the busiest areas in real-time"
  },
  { 
    id: 3, 
    text: "Show me the average dwell time.", 
    url: "/api/zones/avg-dwell",
    description: "See how long visitors stay in each zone"
  },
  { 
    id: 4, 
    text: "How many visitors are currently in the store?", 
    url: "/api/stats/current",
    description: "Get the current store occupancy"
  },
];

export function Chatbot() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleAsk = async (questionId: number) => {
    setLoading(true);
    setError(null);
    const question = QUESTIONS.find(q => q.id === questionId);
    if (!question) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      question: question.text,
      answer: null,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, newMessage]);

    try {
      const res = await fetch(question.url);
      if (!res.ok) throw new Error("Failed to fetch answer");
      const data = await res.json();
      
      setChatHistory(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, answer: data.answer || JSON.stringify(data, null, 2) }
            : msg
        )
      );
    } catch (err) {
      setError("Could not fetch answer. Please try again.");
      setChatHistory(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, answer: "Sorry, could not fetch the answer." }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="lg"
              className="rounded-full w-14 h-14 shadow-lg"
              onClick={() => setIsOpen(true)}
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[440px]"
          >
            <Card className={`bg-card/95 backdrop-blur-sm flex flex-col shadow-lg border-primary/20 ${
              isMinimized ? 'h-auto' : 'h-[600px]'
            }`}>
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <CardTitle>Store Assistant</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsMinimized(!isMinimized)}
                    >
                      {isMinimized ? (
                        <Maximize2 className="h-4 w-4" />
                      ) : (
                        <Minimize2 className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {!isMinimized && (
                  <div className="text-muted-foreground text-sm">
                    Select a question below to get instant insights about your store
                  </div>
                )}
              </CardHeader>
              {!isMinimized && (
                <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
                  {/* Questions Section */}
                  <div className="grid grid-cols-2 gap-3">
                    {QUESTIONS.map(q => (
                      <Button
                        key={q.id}
                        variant="outline"
                        className="h-auto py-3 px-4 flex flex-col items-start gap-1"
                        onClick={() => handleAsk(q.id)}
                        disabled={loading}
                      >
                        <div className="font-medium">{q.text}</div>
                        <div className="text-xs text-muted-foreground">{q.description}</div>
                      </Button>
                    ))}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Chat History */}
                  {chatHistory.length > 0 && (
                    <ScrollArea className="flex-1 border rounded-md p-4">
                      <div className="space-y-4">
                        {chatHistory.map(msg => (
                          <div key={msg.id} className="space-y-2">
                            <div className="flex items-start gap-2">
                              <div className="bg-primary/10 rounded-lg p-3 text-sm">
                                {msg.question}
                              </div>
                            </div>
                            <div className="flex items-start gap-2 pl-4">
                              {msg.answer ? (
                                <div className="bg-muted rounded-lg p-3 text-sm">
                                  {msg.answer}
                                </div>
                              ) : (
                                <Skeleton className="h-8 w-32" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}