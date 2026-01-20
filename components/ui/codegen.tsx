"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

export default function CodeGen() {
  const [prompt, setPrompt] = useState("Create a responsive hero component in React and Tailwind");
  const [lang, setLang] = useState("tsx");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");

  const generate = async () => {
    setLoading(true);
    setOutput("");
    await new Promise((r) => setTimeout(r, 700));
    const sampleMap: Record<string, string> = {
      tsx: `export default function Hero() {\n  return (<header className=\"bg-gradient-to-br p-8\">/* ... */</header>);\n}`,
      js: `function greet() {\n  console.log('Hello from generated code')\n}`,
      py: `def hello():\n    print('Hello from generated code')\n`,
    };

    const sample = sampleMap[lang] ?? sampleMap.tsx;

    // reveal quickly
    for (let i = 1; i <= sample.length; i++) {
      setOutput(sample.slice(0, i));
      // small delay
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 6));
    }

    setLoading(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (e) {
      // ignore
    }
  };

  return (
    <section id="codegen" className="mx-auto max-w-7xl px-6 py-12">
      <div className="rounded-2xl bg-white/70 p-6 shadow">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Code Generation</h3>
          <div className="flex items-center gap-2">
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="p-2 rounded-md border">
              <option value="tsx">TSX</option>
              <option value="js">JavaScript</option>
              <option value="py">Python</option>
            </select>
            <button onClick={generate} className="rounded-md bg-sky-600 text-white px-3 py-2">{loading ? 'Generating…' : 'Generate'}</button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="md:col-span-2 p-3 rounded-md border" rows={4} />
          <div className="md:col-span-1">
            <div className="rounded-md border p-3 h-full flex flex-col justify-between">
              <div className="text-sm text-zinc-500">Options</div>
              <div className="mt-4 text-xs text-zinc-600">Select language and click Generate to produce a sample snippet.</div>
            </div>
          </div>
        </div>

        <div className="mt-4 relative">
          <pre className="whitespace-pre-wrap rounded-md bg-zinc-100 p-4 text-sm overflow-auto">
            <code>{output || (loading ? 'Generating…' : '// Your generated code will appear here')}</code>
          </pre>
          <button onClick={copy} className="absolute right-2 top-2 rounded-md bg-white/80 p-1">
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
