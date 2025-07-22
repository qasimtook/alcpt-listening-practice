import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Headphones, Volume2, ChartLine, Brain, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Headphones className="text-primary-foreground text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-medium text-foreground">ALCPT Listening Practice</h1>
                <p className="text-sm text-muted-foreground">American Language Course Placement Test</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex items-center space-x-6">
                <button className="text-muted-foreground hover:text-primary transition-colors">Home</button>
                <button 
                  onClick={() => setLocation("/tests")}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Tests
                </button>
                <button className="text-muted-foreground hover:text-primary transition-colors">Progress</button>
                <button className="text-muted-foreground hover:text-primary transition-colors">Help</button>
              </nav>
              
              {user && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-muted-foreground">
                    Welcome, {user.firstName || user.email}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Hero */}
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-8 text-primary-foreground mb-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-4">Master Your English Listening Skills</h2>
            <p className="text-xl mb-6 opacity-90">Practice with authentic ALCPT questions featuring realistic audio scenarios and comprehensive feedback.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => setLocation("/tests")}
                className="bg-card text-primary hover:bg-card/90"
              >
                <Volume2 className="mr-2 h-4 w-4" />
                Start Practice
              </Button>
              <Button 
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                How It Works
              </Button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-material">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Volume2 className="text-primary text-xl" />
              </div>
              <h3 className="text-lg font-medium mb-2">Realistic Audio</h3>
              <p className="text-muted-foreground">High-quality text-to-speech audio that mimics real exam conditions</p>
            </CardContent>
          </Card>

          <Card className="shadow-material">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <ChartLine className="text-success text-xl" />
              </div>
              <h3 className="text-lg font-medium mb-2">Track Progress</h3>
              <p className="text-muted-foreground">Monitor your improvement across different test sections</p>
            </CardContent>
          </Card>

          <Card className="shadow-material">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="text-warning text-xl" />
              </div>
              <h3 className="text-lg font-medium mb-2">Instant Feedback</h3>
              <p className="text-muted-foreground">Get immediate explanations and learn from mistakes</p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">© 2024 ALCPT Listening Practice. Educational tool for English language learners.</p>
            <p className="text-sm text-muted-foreground">Practice questions generated using advanced AI technology for realistic exam preparation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
