import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Headphones, Target, TrendingUp } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            ALCPT Listening Practice
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Master your English listening skills with AI-powered audio questions, 
            instant feedback, and personalized progress tracking.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="text-lg px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Get Started
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center border-0 shadow-lg">
            <CardHeader>
              <Headphones className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle className="text-lg">Realistic Audio</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI-generated speech that mimics real exam conditions
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg">
            <CardHeader>
              <Target className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <CardTitle className="text-lg">Instant Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get immediate explanations for correct and incorrect answers
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg">
            <CardHeader>
              <TrendingUp className="w-12 h-12 mx-auto text-purple-600 mb-4" />
              <CardTitle className="text-lg">Track Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor your improvement with detailed performance analytics
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg">
            <CardHeader>
              <BookOpen className="w-12 h-12 mx-auto text-orange-600 mb-4" />
              <CardTitle className="text-lg">Multiple Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Practice with over 100 questions across multiple test formats
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Designed specifically for ALCPT preparation with proven results
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">5</div>
              <div className="text-gray-600 dark:text-gray-300">Complete Tests</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">119</div>
              <div className="text-gray-600 dark:text-gray-300">Practice Questions</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">100%</div>
              <div className="text-gray-600 dark:text-gray-300">Free to Use</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to improve your listening skills?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Join thousands of students who have improved their ALCPT scores
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="text-lg px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Start Practicing Now
          </Button>
        </div>
      </div>
    </div>
  );
}