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

    setIsGenerating(true);
    setGenerationLog([`🚀 Starting AI news generation for ${selectedCats.map(c => c.name).join(', ')}...`]);
    setGenerationLog(prev => [...prev, `📰 Generating ${articleCount} article(s) per category as BREAKING NEWS`]);

    try {
      setGenerationLog(prev => [...prev, "📡 Fetching latest news from RSS feeds (with Indian news focus)..."]);

      const { data, error } = await supabase.functions.invoke("auto-generate-news", {
        body: {
          categoryIds: selectedCategories,
          categoryNames: selectedCats.map(c => c.name),
          count: articleCount,
        },
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        setGenerationLog(prev => [...prev, `✓ ${data.message}`]);
        toast.success(data.message);

        if (data.articles?.length > 0) {
          setGenerationLog(prev => [
            ...prev,
            ...data.articles.map((a: { title: string }) => `✓ 🔴 BREAKING: ${a.title}`)
          ]);
        }
      } else {
        setGenerationLog(prev => [...prev, `✗ ${data.message || "Generation failed"}`]);
        toast.error(data.message || "Failed to generate articles");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Generation error:", error);
      setGenerationLog(prev => [...prev, `✗ Error: ${errorMessage}`]);
      toast.error(errorMessage || "Failed to generate articles");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAll = async () => {
    if (!categories || categories.length === 0) {
      toast.error("No categories available");
      return;
    }

    setIsGenerating(true);
    setGenerationLog([`🚀 Starting automated news generation for ALL categories...`]);
    setGenerationLog(prev => [...prev, `📰 ${articleCount} articles per category as BREAKING NEWS`]);
    setGenerationLog(prev => [...prev, `🇮🇳 Prioritizing Indian news sources`]);

    let successCount = 0;
    let failureCount = 0;
    const failures: string[] = [];
    let authFailed = false;

    for (const category of categories) {
      try {
        setGenerationLog(prev => [...prev, `\n📁 Processing ${category.name}...`]);

        const { data, error } = await supabase.functions.invoke("auto-generate-news", {
          body: {
            categoryIds: [category.id],
            categoryNames: [category.name],
            count: articleCount,
          },
        });

        if (error) {
          failureCount++;
          failures.push(category.name);
          setGenerationLog(prev => [...prev, `✗ ${category.name}: ${error.message}`]);

          // Check for auth errors - stop early if unauthorized
          if (error.message?.includes("401") || error.message?.includes("Unauthorized") || error.message?.includes("403")) {
            authFailed = true;
            setGenerationLog(prev => [...prev, `\n⚠️ Authentication failed. Please ensure you're logged in with an Editor or Admin account.`]);
            break;
          }
        } else if (data?.success) {
          successCount++;
          setGenerationLog(prev => [...prev, `✓ ${category.name}: ${data.message}`]);
          if (data.articles?.length > 0) {
            data.articles.forEach((a: { title: string }) => {
              setGenerationLog(prev => [...prev, `  🔴 ${a.title}`]);
            });
          }
        } else {
          failureCount++;
          failures.push(category.name);
          const msg = data?.error || data?.message || "Unknown error";
          setGenerationLog(prev => [...prev, `✗ ${category.name}: ${msg}`]);
        }

        // Delay between categories to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error: unknown) {
        failureCount++;
        failures.push(category.name);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        setGenerationLog(prev => [...prev, `✗ ${category.name}: ${errorMessage}`]);
      }
    }

    // Show accurate summary
    if (authFailed) {
      setGenerationLog(prev => [...prev, `\n⛔ Generation stopped due to authentication error.`]);
      toast.error("Authentication failed. Please re-login or check your account role.");
    } else if (failureCount === 0 && successCount > 0) {
      setGenerationLog(prev => [...prev, `\n✓ Completed: ${successCount} categories succeeded. All articles published as BREAKING NEWS.`]);
      toast.success(`Generated articles for ${successCount} categories!`);
    } else if (successCount > 0) {
      setGenerationLog(prev => [...prev, `\n⚠️ Completed: ${successCount} succeeded, ${failureCount} failed (${failures.join(", ")})`]);
      toast.warning(`Partial success: ${successCount} categories succeeded, ${failureCount} failed`);
    } else {
      setGenerationLog(prev => [...prev, `\n✗ Failed: All ${failureCount} categories failed.`]);
      toast.error("All categories failed to generate.");
    }

    setIsGenerating(false);
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
            <h3 className="font-medium text-lg">Running Manually</h3>
            <p className="text-muted-foreground">
              To generate news immediately without waiting for the schedule, use your terminal. This ensures your API keys remain secure and are not exposed to the browser.
            </p>

            <div className="bg-muted p-4 rounded-lg font-mono text-sm border flex items-center justify-between">
              <code>npm run generate-news</code>
              <Button size="sm" variant="ghost" onClick={() => {
                navigator.clipboard.writeText('npm run generate-news');
                toast.success('Command copied!');
              }}>
                Copy
              </Button>
            </div>
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
