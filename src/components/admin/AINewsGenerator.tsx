import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useCategories } from "@/hooks/useArticles";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, Newspaper, Zap, Clock, Settings, Timer, AlertCircle } from "lucide-react";

export const AINewsGenerator = () => {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [articleCount, setArticleCount] = useState<number>(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationLog, setGenerationLog] = useState<string[]>([]);
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(20);
  const [autoTimer, setAutoTimer] = useState<NodeJS.Timeout | null>(null);
  const [nextRunTime, setNextRunTime] = useState<Date | null>(null);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const selectAllCategories = () => {
    if (categories) {
      setSelectedCategories(categories.map(c => c.id));
    }
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
  };

  const handleGenerate = async () => {
    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category");
      return;
    }

    const selectedCats = categories?.filter(c => selectedCategories.includes(c.id)) || [];
    const categoryNames = selectedCats.map(c => c.name).join(',');

    setIsGenerating(true);
    setGenerationLog([`🚀 Triggering Cloud Generation via GitHub Actions...`]);
    setGenerationLog(prev => [...prev, `📂 Categories: ${categoryNames}`]);

    try {
      // Call Vercel API which calls GitHub API
      const response = await fetch('/api/trigger-github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categories: categoryNames
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to trigger generation');
      }

      setGenerationLog(prev => [...prev, `✓ Success: GitHub Action triggered!`]);
      setGenerationLog(prev => [...prev, `⏳ The articles will appear in ~2-5 minutes.`]);
      toast.success("Generation started on the cloud!");

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Generation error:", error);
      setGenerationLog(prev => [...prev, `✗ Error: ${errorMessage}`]);
      toast.error(errorMessage || "Failed to trigger generation");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAll = async () => {
    // Simplified All Handler
    setIsGenerating(true);
    setGenerationLog([`🚀 Triggering Cloud Generation for ALL categories...`]);
    try {
      const response = await fetch('/api/trigger-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: 'all' }),
      });
      if (!response.ok) throw new Error('Failed');
      setGenerationLog(prev => [...prev, `✓ GitHub Action triggered for all categories.`]);
      toast.success("Full generation started!");
    } catch (e) {
      toast.error("Failed to trigger");
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generation timer
  useEffect(() => {
    if (autoEnabled && !autoTimer) {
      const runAutoGeneration = async () => {
        console.log("Running scheduled auto-generation...");
        await handleGenerateAll();
        setNextRunTime(new Date(Date.now() + intervalMinutes * 60 * 1000));
      };

      // Set next run time
      setNextRunTime(new Date(Date.now() + intervalMinutes * 60 * 1000));

      const timer = setInterval(runAutoGeneration, intervalMinutes * 60 * 1000);
      setAutoTimer(timer);

      toast.success(`Auto-generation enabled! Next run in ${intervalMinutes} minutes`);
    } else if (!autoEnabled && autoTimer) {
      clearInterval(autoTimer);
      setAutoTimer(null);
      setNextRunTime(null);
      toast.info("Auto-generation disabled");
    }

    return () => {
      if (autoTimer) {
        clearInterval(autoTimer);
      }
    };
  }, [autoEnabled, intervalMinutes]);

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI News Generator
          </CardTitle>
          <CardDescription>
            Automatically fetch trending news (with Indian focus), rewrite with AI for SEO optimization,
            generate unique images, and publish as Breaking News.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">

          <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <Newspaper className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-primary">Automation Status: ACTIVE</p>
              <p className="text-sm text-muted-foreground mt-1">
                The automated news pipeline is configured to run via <strong>GitHub Actions</strong> (Cloud) or <strong>Terminal</strong> (Local).
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Select Categories</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllCategories}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearAllCategories}>
                  Clear
                </Button>
              </div>
            </div>

            {categoriesLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories?.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent transition-colors"
                  >
                    <Checkbox
                      id={category.id}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                      disabled={isGenerating}
                    />
                    <Label
                      htmlFor={category.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="articleCount">Articles per Category</Label>
              <Input
                id="articleCount"
                type="number"
                min={1}
                max={5}
                value={articleCount}
                onChange={(e) => setArticleCount(parseInt(e.target.value) || 1)}
                disabled={isGenerating}
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 1-2 articles to avoid rate limits.
              </p>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleGenerate}
              disabled={isGenerating || selectedCategories.length === 0}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Generate Breaking News
                </>
              )}
            </Button>
          </div>

          {/* Running Manually Fallback (Hidden/Less Prominent) */}
          <div className="pt-4 border-t">
            <Button variant="ghost" className="w-full text-xs text-muted-foreground" onClick={handleGenerateAll}>
              Trigger Full Site Generation (All Categories)
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-lg">How it works</h3>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li><strong>Fetch:</strong> Crawls RSS feeds (Times of India, BBC, etc.)</li>
              <li><strong>Process:</strong> Uses Gemini Pro to rewrite and summarize.</li>
              <li><strong>Visuals:</strong> Generates unique images via Pollinations.ai.</li>
              <li><strong>Publish:</strong> Saves to Database as "Breaking News".</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Auto-Generation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            Automated Scheduling
          </CardTitle>
          <CardDescription>
            Enable automatic news generation at regular intervals. Articles older than 20 minutes
            are automatically demoted from Breaking News when new articles are published.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-generate Breaking News</Label>
              <p className="text-sm text-muted-foreground">
                Automatically generate {articleCount} article(s) per category at set intervals
              </p>
            </div>
            <Switch
              checked={autoEnabled}
              onCheckedChange={setAutoEnabled}
              disabled={isGenerating}
            />
          </div>

          {autoEnabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="interval">Interval (minutes)</Label>
                <Input
                  id="interval"
                  type="number"
                  min={10}
                  max={1440}
                  value={intervalMinutes}
                  onChange={(e) => setIntervalMinutes(parseInt(e.target.value) || 20)}
                  disabled={isGenerating}
                />
                <p className="text-xs text-muted-foreground">
                  Default: 20 minutes. Breaking news older than this will be auto-demoted.
                </p>
              </div>

              {nextRunTime && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary">
                  <Timer className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Next run: {nextRunTime.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Generation Log */}
      {generationLog.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              Generation Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm max-h-64 overflow-y-auto">
              {generationLog.map((log, index) => (
                <div
                  key={index}
                  className={`${log.startsWith("✓") ? "text-green-600 dark:text-green-400" :
                    log.startsWith("✗") ? "text-red-600 dark:text-red-400" :
                      log.includes("🔴") ? "text-destructive font-medium" :
                        "text-muted-foreground"
                    }`}
                >
                  {log}
                </div>
              ))}
              {isGenerating && (
                <div className="flex items-center gap-2 text-muted-foreground mt-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Processing...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-transparent rounded-lg border">
              <div className="text-2xl mb-2">🇮🇳</div>
              <div className="font-medium text-sm">1. Fetch News</div>
              <div className="text-xs text-muted-foreground">Indian + Global sources</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-transparent rounded-lg border">
              <div className="text-2xl mb-2">🤖</div>
              <div className="font-medium text-sm">2. AI Rewrite</div>
              <div className="text-xs text-muted-foreground">SEO optimized content</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-transparent rounded-lg border">
              <div className="text-2xl mb-2">🖼️</div>
              <div className="font-medium text-sm">3. Generate Image</div>
              <div className="text-xs text-muted-foreground">AI-powered visuals</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-destructive/10 to-transparent rounded-lg border border-destructive/20">
              <div className="text-2xl mb-2">🔴</div>
              <div className="font-medium text-sm">4. Breaking News</div>
              <div className="text-xs text-muted-foreground">Auto-published live</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-transparent rounded-lg border">
              <div className="text-2xl mb-2">⏰</div>
              <div className="font-medium text-sm">5. Auto-Rank</div>
              <div className="text-xs text-muted-foreground">Demote after 20 min</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
