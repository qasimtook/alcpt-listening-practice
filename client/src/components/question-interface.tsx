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
      {/* Question Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-foreground">
            Question {question.questionIndex}
          </h2>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            question.questionIndex <= 66 
              ? "bg-blue-100 text-blue-700" 
              : "bg-green-100 text-green-700"
          }`}>
            {question.questionIndex <= 66 ? "Listening" : "Reading & Grammar"}
          </span>
        </div>
        
        {/* Audio Player for Listening Questions (1-66) */}
        {question.questionIndex <= 66 && (
          <div className="mb-4">
            <AudioPlayer audioUrl={audioUrl} isLoading={isGeneratingAudio} />
          </div>
        )}
        
        {/* Question Text */}
        <div className={`p-4 rounded-lg ${
          question.questionIndex <= 66 ? "bg-blue-50" : "bg-green-50"
        }`}>
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
          {question.questionIndex <= 66 && (
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
          )}
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

          {/* Arabic Explanation */}
          {feedback.arabicExplanation && (
            <div className="bg-green-50 rounded-lg p-4 mt-4" dir="rtl">
              <h4 className="font-medium text-foreground mb-3 text-right">الشرح باللغة العربية:</h4>
              <div className="space-y-4 text-right">
                <div>
                  <h5 className="font-semibold text-green-800 mb-2">الإجابة الصحيحة:</h5>
                  <p className="text-green-700">{feedback.arabicExplanation.الإجابة_الصحيحة}</p>
                </div>
                
                <div>
                  <h5 className="font-semibold text-green-800 mb-2">شرح الإجابة الصحيحة:</h5>
                  <div className="bg-white rounded p-3 text-green-700">
                    <p className="font-medium">{feedback.arabicExplanation.شرح_الإجابة_الصحيحة?.السبب_الرئيسي}</p>
                    <p className="mt-2 text-sm">{feedback.arabicExplanation.شرح_الإجابة_الصحيحة?.الدليل_من_السؤال}</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-green-800 mb-2">تحليل الخيارات الخاطئة:</h5>
                  <div className="space-y-2">
                    {feedback.arabicExplanation.تحليل_الخيارات_الخاطئة && Object.entries(feedback.arabicExplanation.تحليل_الخيارات_الخاطئة).map(([key, option]: [string, any]) => (
                      <div key={key} className="bg-red-50 rounded p-2 text-sm">
                        <span className="font-medium text-red-700">{option.الخيار}:</span>
                        <span className="text-red-600 mr-2">{option.سبب_الخطأ}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-green-800 mb-2">القاعدة اللغوية:</h5>
                  <p className="bg-blue-50 rounded p-3 text-blue-700">{feedback.arabicExplanation.القاعدة_اللغوية}</p>
                </div>

                <div>
                  <h5 className="font-semibold text-green-800 mb-2">نصيحة للطالب:</h5>
                  <p className="bg-yellow-50 rounded p-3 text-yellow-700">{feedback.arabicExplanation.نصيحة_للطالب}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
