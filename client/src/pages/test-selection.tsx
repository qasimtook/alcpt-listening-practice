import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ArrowLeft, Clock, Shuffle, Headphones } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { Test } from "@shared/schema";

export default function TestSelection() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Load test data on mount
  const loadTestDataMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/load-test-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to load test data");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tests"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to load test data. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Fetch tests
  const { data: tests, isLoading } = useQuery<Test[]>({
    queryKey: ["/api/tests"],
    enabled: !loadTestDataMutation.isPending,
  });

  useEffect(() => {
    loadTestDataMutation.mutate();
  }, []);

  const handleSelectTest = (testId: number) => {
    setLocation(`/question?testId=${testId}`);
  };

  const handleRandomTest = () => {
    setLocation("/question");
  };

  if (isLoading || loadTestDataMutation.isPending) {
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

        <main className="max-w-6xl mx-auto px-4 py-8">
          <Card className="shadow-material mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="border border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-5 w-16 mb-1" />
                      <Skeleton className="h-4 w-32 mb-3" />
                      <Skeleton className="h-3 w-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
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

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Card className="shadow-material mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Select a Test</h2>
                <p className="text-muted-foreground">Choose from available ALCPT practice tests</p>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => setLocation("/")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
            
            {/* Test Cards Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tests?.map((test) => (
                <Card 
                  key={test.id}
                  className="border border-border hover:border-primary hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleSelectTest(test.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-sm">
                          {test.testNumber}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {test.questionCount} questions
                      </span>
                    </div>
                    <h3 className="font-medium mb-1">{test.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {test.description}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>{test.duration}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Random Test Option */}
              <Card 
                className="border-2 border-dashed border-border hover:border-primary hover:bg-blue-50 transition-all cursor-pointer"
                onClick={handleRandomTest}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Shuffle className="text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-1">Random Practice</h3>
                  <p className="text-sm text-muted-foreground">Mixed questions from all tests</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
