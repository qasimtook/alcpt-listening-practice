import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import AudioPlayer from "./audio-player";
import type { Question, FeedbackResponse } from "@shared/schema";

interface QuestionInterfaceProps {
  question: Question;
  audioUrl: string;
  selectedAnswer: string;
  feedback: FeedbackResponse | null;
  isGeneratingAudio: boolean;
  isSubmitting: boolean;
  onAnswerSelect: (answer: string) => void;
  onSubmitAnswer: () => void;
}

export default function QuestionInterface({
  question,
  audioUrl,
  selectedAnswer,
  feedback,
  isGeneratingAudio,
  isSubmitting,
  onAnswerSelect,
  onSubmitAnswer,
}: QuestionInterfaceProps) {
  const allOptions = [question.correctAnswer, ...question.otherOptions].sort();
  const optionLabels = ["A", "B", "C", "D"];

  const getOptionLetter = (option: string) => {
    const index = allOptions.indexOf(option);
    return optionLabels[index] || "";
  };

  return (
    <Card className="shadow-material-lg mb-6">
      {/* Audio Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-foreground">
            Question {question.questionIndex}
          </h2>
          <span className="px-3 py-1 bg-blue-100 text-primary text-sm font-medium rounded-full">
            Listening
          </span>
        </div>
        
        {/* Audio Player */}
        <AudioPlayer audioUrl={audioUrl} isLoading={isGeneratingAudio} />
        
        {/* Question Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-foreground font-medium">{question.questionText}</p>
        </div>
      </div>

      {/* Answer Options */}
      <div className="p-6">
        <h3 className="text-lg font-medium mb-4">Choose the best answer:</h3>
        
        <div className="space-y-3">
          {allOptions.map((option, index) => {
            const letter = optionLabels[index];
            const isSelected = selectedAnswer === option;
            const isCorrect = feedback && option === question.correctAnswer;
            const isIncorrect = feedback && selectedAnswer === option && !isCorrect;
            
            return (
              <button
                key={option}
                onClick={() => !feedback && onAnswerSelect(option)}
                disabled={!!feedback}
                className={`w-full text-left p-4 border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                  isSelected && !feedback
                    ? "border-primary bg-blue-50"
                    : isCorrect
                    ? "border-success bg-green-50"
                    : isIncorrect
                    ? "border-error bg-red-50"
                    : "border-border hover:border-primary hover:bg-blue-50"
                } ${feedback ? "cursor-default" : "cursor-pointer"}`}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 border-2 rounded-full flex items-center justify-center mr-4 text-sm font-medium ${
                    isSelected && !feedback
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCorrect
                      ? "border-success bg-success text-white"
                      : isIncorrect
                      ? "border-error bg-error text-white"
                      : "border-border"
                  }`}>
                    {letter}
                  </div>
                  <span className="flex-1">{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onSubmitAnswer}
            disabled={!selectedAnswer || !!feedback || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Checking Answer...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Submit Answer
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Replay audio functionality would go here
              console.log("Replay audio");
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Replay Audio
          </Button>
        </div>
      </div>

      {/* Feedback Section */}
      {feedback && (
        <div className="p-6 border-t border-border">
          <div className={`flex items-center mb-4 ${
            feedback.isCorrect ? "text-success" : "text-error"
          }`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
              feedback.isCorrect ? "bg-success" : "bg-error"
            }`}>
              {feedback.isCorrect ? (
                <CheckCircle className="text-white text-lg" />
              ) : (
                <XCircle className="text-white text-lg" />
              )}
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${
                feedback.isCorrect ? "text-success" : "text-error"
              }`}>
                {feedback.isCorrect ? "Correct!" : "Incorrect"}
              </h3>
              <p className="text-muted-foreground">
                {feedback.isCorrect 
                  ? "Well done, you selected the right answer."
                  : `The correct answer is: ${getOptionLetter(feedback.correctAnswer)}. ${feedback.correctAnswer}`
                }
              </p>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2">Explanation:</h4>
            <p className="text-foreground">{feedback.explanation}</p>
          </div>
        </div>
      )}
    </Card>
  );
}
