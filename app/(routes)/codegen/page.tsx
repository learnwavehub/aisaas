"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Copy } from "lucide-react";
import {useRouter} from 'next/navigation'
 const schema = z.object({
  prompt: z.string().min(6, "Provide a clear description of the code you want"),
});

type FormSchema = z.infer<typeof schema>;

export default function CodegenPage() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: { 
      prompt: "Create a responsive hero component in React and Tailwind" 
    },
  });

  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
 const router =useRouter();
  const onSubmit = async (data: FormSchema) => {
    setLoading(true);
    setOutput("");
    
    try {
      const res = await fetch('/api/openai/codegen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: data.prompt }),
      });
      
      const json = await res.json();
        if (res.status === 403) {
        router.push("/pricing");
        return;
      }
      
      
      if (!res.ok) {
        throw new Error(json?.error || 'Generation failed');
      }
      
      const text = json.code || '// No code generated';
      
      // Simple typing effect
      for (let i = 1; i <= text.length; i++) {
        setOutput(text.slice(0, i));
        await new Promise((r) => setTimeout(r, 2));
      }
      
    } catch (e: any) {
      setOutput(`// Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (e) {}
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="rounded-3xl bg-gradient-to-br from-sky-50 to-indigo-50 p-8 shadow-xl">
        <h1 className="text-4xl font-extrabold">AI Code Generator</h1>
        <p className="mt-2 text-zinc-600">
          Describe what code you want, and AI will generate it for you
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                What code do you need?
              </label>
              <Textarea
                {...form.register("prompt")}
                placeholder="Example: Create a React component that fetches and displays user data from an API..."
                rows={4}
                className="w-full"
              />
              {form.formState.errors.prompt && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.prompt.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Code"}
            </button>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Generated Code</h3>
              {output && (
                <button
                  onClick={copyToClipboard}
                  type="button"
                  className="inline-flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
              )}
            </div>
            
            <div className="relative">
              <pre className="whitespace-pre-wrap rounded-lg bg-gray-900 p-4 text-sm text-gray-100 overflow-auto min-h-[300px]">
                <code>
                  {output || (loading ? "Generating your code..." : "// Your code will appear here")}
                </code>
              </pre>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}