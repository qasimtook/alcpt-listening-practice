import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, HelpCircle, Headphones } from "lucide-react";
import AudioPlayer from "@/components/audio-player";
import QuestionInterface from "@/components/question-interface";
import HelpModal from "@/components/help-modal";
import type { Question, FeedbackResponse } from "@shared/schema";

export default function QuestionPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();
  
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>("");

  const params = new URLSearchParams(search);
  const testId = params.get("testId") ? Number(params.get("testId")) : undefined;
  const questionId = params.get("questionId") ? Number(params.get("questionId")) : undefined;

  // Fetch random question or specific question
  const { data: question, isLoading, refetch } = useQuery<Question>({
    queryKey: questionId ? ["/api/questions", questionId] : testId ? ["/api/question", { testId }] : ["/api/question"],
    queryFn: async () => {
      if (questionId) {
        const response = await fetch(`/api/questions/${questionId}`);
        if (!response.ok) throw new Error("Failed to fetch question");
        return response.json();
      } else if (testId) {
        const response = await fetch(`/api/question?testId=${testId}`);
        if (!response.ok) throw new Error("Failed to fetch question");
        return response.json();
      } else {
        const response = await fetch("/api/question");
        if (!response.ok) throw new Error("Failed to fetch question");
        return response.json();
      }
    },
    enabled: true,
  });

  // Generate audio for question
  const generateAudioMutation = useMutation({
    mutationFn: async (questionId: number) => {
      const response = await fetch(`/api/questions/${questionId}/audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to generate audio");
      return response.json();
    },
    onSuccess: (data) => {
      setAudioUrl(data.audioUrl);
    },
    onError: () => {
      toast({
        title: "Audio Error",
        description: "Failed to generate audio. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Submit answer
  const submitAnswerMutation = useMutation({
    mutationFn: async ({ questionId, selectedAnswer }: { questionId: number; selectedAnswer: string }) => {
      const response = await fetch(`/api/questions/${questionId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedAnswer }),
      });
      if (!response.ok) throw new Error("Failed to submit answer");
      return response.json();
    },
    onSuccess: (data) => {
      setFeedback(data);
    },
    onError: () => {
      toast({
        title: "Submission Error",
        description: "Failed to submit answer. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generate audio when question loads
  useEffect(() => {
    if (question && !question.audioUrl) {
      generateAudioMutation.mutate(question.id);
    } else if (question?.audioUrl) {
      setAudioUrl(question.audioUrl);
    }
  }, [question]);

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer("");
    setFeedback(null);
    setAudioUrl("");
  }, [question?.id]);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !question) return;
    submitAnswerMutation.mutate({ questionId: question.id, selectedAnswer });
  };

  const handleNextQuestion = () => {
    if (testId) {
      setLocation(`/question?testId=${testId}`);
      refetch();
    } else {
      setLocation("/question");
      refetch();
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key >= "1" && e.key <= "4") {
      const index = parseInt(e.key) - 1;
      const allOptions = question ? [question.correctAnswer, ...question.otherOptions] : [];
      if (allOptions[index]) {
        handleAnswerSelect(allOptions[index]);
      }
    } else if (e.key === "Enter" && selectedAnswer && !feedback) {
      handleSubmitAnswer();
    } else if (e.key === "Escape") {
      setShowHelp(false);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [selectedAnswer, feedback, question]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card shadow-md border-b border-border">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Headphones className="text-primary-foreground text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-medium text-foreground">ALCPT Listening Practice</h1>
                <p className="text-sm text-muted-foreground">
                  {question ? 
                    `Test ${question.testId === 7 ? '065' : question.testId === 8 ? '066' : question.testId === 9 ? '067' : question.testId === 10 ? '068' : question.testId === 11 ? '069' : '070'} - Question ${question.questionIndex}` :
                    testId ? `Test ${testId} Practice` : "Random Question Practice"
                  }
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-20 w-full mb-6" />
          <Skeleton className="h-96 w-full mb-6" />
          <div className="flex justify-between">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </main>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">No Questions Available</h2>
            <p className="text-muted-foreground mb-4">
              No questions could be loaded. Please try again or select a different test.
            </p>
            <Button onClick={() => setLocation("/tests")}>
              Back to Test Selection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Headphones className="text-primary-foreground text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-medium text-foreground">ALCPT Listening Practice</h1>
              <p className="text-sm text-muted-foreground">American Language Course Placement Test</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <Card className="shadow-material mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Question Progress</span>
              <span className="text-sm text-muted-foreground">
                Question {question.questionIndex}
              </span>
            </div>
            <Progress value={feedback ? 100 : 50} className="w-full" />
          </CardContent>
        </Card>

        {/* Question Interface */}
        <QuestionInterface
          question={question}
          audioUrl={audioUrl}
          selectedAnswer={selectedAnswer}
          feedback={feedback}
          isGeneratingAudio={generateAudioMutation.isPending}
          isSubmitting={submitAnswerMutation.isPending}
          onAnswerSelect={handleAnswerSelect}
          onSubmitAnswer={handleSubmitAnswer}
        />

        {/* Navigation Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <Button 
            variant="ghost"
            onClick={() => setLocation("/tests")}
            className="order-2 sm:order-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Test Selection
          </Button>
          
          <div className="order-1 sm:order-2 flex gap-3">
            {feedback && (
              <Button onClick={handleNextQuestion}>
                Next Question
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowHelp(true)}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* Help Modal */}
      <HelpModal 
        isOpen={showHelp} 
        onClose={() => setShowHelp(false)} 
      />
    </div>
  );
}
