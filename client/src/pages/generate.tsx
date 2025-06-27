import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Copy, Download, RotateCcw, Lightbulb } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const generateFormSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  features: z.string().min(1, "Features are required"),
  category: z.string().min(1, "Category is required"),
  keywords: z.string().min(1, "Keywords are required"),
  tone: z.enum(["professional", "casual", "enthusiastic"]),
  length: z.enum(["short", "medium", "long"]),
});

type GenerateFormData = z.infer<typeof generateFormSchema>;

export default function Generate() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);

  const form = useForm<GenerateFormData>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: {
      productName: "",
      features: "",
      category: "",
      keywords: "",
      tone: "professional",
      length: "medium",
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const generateDescriptionMutation = useMutation({
    mutationFn: async (data: GenerateFormData) => {
      const response = await apiRequest("POST", "/api/generate/description", {
        productName: data.productName,
        features: data.features.split("\n").filter(f => f.trim()),
        category: data.category,
        keywords: data.keywords.split(",").map(k => k.trim()).filter(k => k),
        tone: data.tone,
        length: data.length,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Product description generated successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate description. Please try again.",
        variant: "destructive",
      });
    },
  });

  const suggestKeywordsMutation = useMutation({
    mutationFn: async (data: { productName: string; category: string }) => {
      const response = await apiRequest("POST", "/api/generate/keywords", data);
      return response.json();
    },
    onSuccess: (data) => {
      setSuggestedKeywords(data.keywords);
      toast({
        title: "Keywords suggested",
        description: "Click on any keyword to add it to your list",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to suggest keywords",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const onSubmit = (data: GenerateFormData) => {
    generateDescriptionMutation.mutate(data);
  };

  const handleSuggestKeywords = () => {
    const productName = form.getValues("productName");
    const category = form.getValues("category");
    
    if (!productName || !category) {
      toast({
        title: "Missing Information",
        description: "Please enter product name and category first",
        variant: "destructive",
      });
      return;
    }

    suggestKeywordsMutation.mutate({ productName, category });
  };

  const addKeyword = (keyword: string) => {
    const currentKeywords = form.getValues("keywords");
    const keywordList = currentKeywords ? currentKeywords.split(",").map(k => k.trim()) : [];
    
    if (!keywordList.includes(keyword)) {
      const newKeywords = [...keywordList, keyword].join(", ");
      form.setValue("keywords", newKeywords);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Content copied to clipboard",
    });
  };

  const getSeoScoreBadge = (score: number) => {
    if (score >= 8) return <Badge className="bg-emerald-100 text-emerald-800">Excellent: {score}/10</Badge>;
    if (score >= 6) return <Badge className="bg-amber-100 text-amber-800">Good: {score}/10</Badge>;
    return <Badge variant="destructive">Needs Work: {score}/10</Badge>;
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Generate Description" 
          subtitle="Create AI-powered product descriptions"
        />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Product Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="productName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter product name..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="features"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Key Features (one per line)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="electronics">Electronics</SelectItem>
                                  <SelectItem value="clothing">Clothing</SelectItem>
                                  <SelectItem value="home-garden">Home & Garden</SelectItem>
                                  <SelectItem value="sports">Sports</SelectItem>
                                  <SelectItem value="beauty">Beauty</SelectItem>
                                  <SelectItem value="books">Books</SelectItem>
                                  <SelectItem value="toys">Toys</SelectItem>
                                  <SelectItem value="automotive">Automotive</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-2">
                          <Label>Keyword Suggestions</Label>
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm"
                            onClick={handleSuggestKeywords}
                            disabled={suggestKeywordsMutation.isPending}
                            className="w-full"
                          >
                            <Lightbulb className="w-4 h-4 mr-2" />
                            {suggestKeywordsMutation.isPending ? "Suggesting..." : "Suggest Keywords"}
                          </Button>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="keywords"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Keywords</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="keyword1, keyword2, keyword3"
                                rows={2}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {suggestedKeywords.length > 0 && (
                        <div className="space-y-2">
                          <Label>Suggested Keywords (click to add)</Label>
                          <div className="flex flex-wrap gap-2">
                            {suggestedKeywords.map((keyword, index) => (
                              <Badge 
                                key={index}
                                variant="outline"
                                className="cursor-pointer hover:bg-primary hover:text-white"
                                onClick={() => addKeyword(keyword)}
                              >
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="tone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tone</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="professional">Professional</SelectItem>
                                  <SelectItem value="casual">Casual</SelectItem>
                                  <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="length"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Length</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="short">Short (50-100 words)</SelectItem>
                                  <SelectItem value="medium">Medium (100-200 words)</SelectItem>
                                  <SelectItem value="long">Long (200+ words)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={generateDescriptionMutation.isPending}
                      >
                        {generateDescriptionMutation.isPending ? (
                          <>
                            <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Description
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Generated Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Generated Description</CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedContent ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getSeoScoreBadge(generatedContent.generatedDescription.seoScore)}
                          <Badge variant="outline">
                            {generatedContent.generatedDescription.wordCount} words
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(generatedContent.generatedDescription.content)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const blob = new Blob([generatedContent.generatedDescription.content], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = 'product-description.txt';
                              a.click();
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-slate-700 leading-relaxed">
                          {generatedContent.generatedDescription.content}
                        </p>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <h4 className="font-medium text-slate-900">Performance Metrics</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-600">SEO Score:</span>
                            <span className="ml-2 font-medium">{generatedContent.generatedDescription.seoScore}/10</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Word Count:</span>
                            <span className="ml-2 font-medium">{generatedContent.generatedDescription.wordCount}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Keyword Density:</span>
                            <span className="ml-2 font-medium">{generatedContent.generatedDescription.keywordDensity}%</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Remaining Credits:</span>
                            <span className="ml-2 font-medium">{generatedContent.remainingCredits}</span>
                          </div>
                        </div>
                      </div>

                      {generatedContent.generatedDescription.suggestedKeywords && generatedContent.generatedDescription.suggestedKeywords.length > 0 && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            <h4 className="font-medium text-slate-900">Suggested Additional Keywords</h4>
                            <div className="flex flex-wrap gap-2">
                              {generatedContent.generatedDescription.suggestedKeywords.map((keyword: string, index: number) => (
                                <Badge key={index} variant="outline">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Button variant="outline" onClick={() => setGeneratedContent(null)}>
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Generate Another
                        </Button>
                        <Button>
                          Save Description
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-slate-400 mb-4">
                        <Sparkles className="w-16 h-16 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-2">Ready to Generate</h3>
                      <p className="text-slate-500">
                        Fill in the product information and click "Generate Description" to create your AI-powered content.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
