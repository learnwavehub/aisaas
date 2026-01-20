"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Download, Copy, Check } from "lucide-react";

function svgDataUrl(text: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='720'><defs><linearGradient id='g' x1='0' x2='1'><stop offset='0' stop-color='#8b5cf6'/><stop offset='1' stop-color='#fb7185'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#g)'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='42' fill='white'>${text}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function ImagePage() {
  const router = useRouter();
  const schema = z.object({
    prompt: z.string().min(3, "Prompt must be at least 3 characters").max(1500, "Prompt is too long"),
    num_images: z.number()
      .min(1, "At least 1 image is required")
      .max(4, "Maximum 4 images allowed")
      .int("Must be a whole number"),
    size: z.enum(["square_1_1", "portrait_2_3", "landscape_16_9", "tall_9_16"]),
  });

  type FormSchema = z.infer<typeof schema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      prompt: "A dramatic sunset over mountains, cinematic lighting",
      num_images: 1,
      size: "square_1_1",
    },
    mode: "onChange",
  });

  const [isLoading, setLoading] = useState(false);
  const [srcs, setSrcs] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const downloadCounterRef = useRef(0); // To avoid filename conflicts

  // Check if form is valid and ready for submission
  const isFormValid = form.formState.isValid;
  const isSubmitting = form.formState.isSubmitting;

  // Utility function to download image - memoized to prevent recreating on each render
  const downloadImage = useCallback((imageSrc: string, index: number) => {
    const event = window.event as MouseEvent;
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    try {
      // Create a unique filename
      const promptText = form.getValues("prompt").slice(0, 30).replace(/[^a-z0-9]/gi, '_');
      const timestamp = Date.now();
      downloadCounterRef.current += 1;
      const fileName = `ai-image-${promptText}-${index + 1}-${timestamp}-${downloadCounterRef.current}.png`;
      
      // If it's a data URL
      if (imageSrc.startsWith('data:')) {
        const response = fetch(imageSrc);
        response.then(async (res) => {
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }).catch(error => {
          console.error('Download failed:', error);
          // Fallback method
          const link = document.createElement('a');
          link.href = imageSrc;
          link.download = fileName;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      } else {
        // For regular URLs
        const link = document.createElement('a');
        link.href = imageSrc;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [form]);

  // Download all images
  const downloadAllImages = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    srcs.forEach((src, index) => {
      setTimeout(() => {
        downloadImage(src, index);
      }, index * 100); // Stagger downloads to avoid conflicts
    });
  }, [srcs, downloadImage]);

  // Copy image to clipboard
  const copyImageToClipboard = useCallback(async (imageSrc: string, index: number) => {
    const event = window.event as MouseEvent;
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      
      // Create clipboard item
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Failed to copy image to clipboard. Please download instead.');
    }
  }, []);

  const onSubmit = async (data: FormSchema) => {
    setLoading(true);
    setSrcs([]);
    setErrorMessage(null);
    setCopiedIndex(null);
    
    try {
      const res = await fetch("/api/freepik/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: data.prompt,
          num_images: data.num_images,
          size: data.size,
        }),
      });

      const json = await res.json();
      
      // Handle 403 - No subscription (redirect to pricing)
      if (res.status === 403) {
        router.push("/pricing");
        return;
      }
      
      if (!res.ok) {
        throw new Error(json?.error || json?.message || "generation_failed");
      }

      // Process according to Freepik API response structure
      if (Array.isArray(json.data)) {
        // Convert base64 data to data URLs
        const imageUrls = json.data.map(
          (item: { base64: string; has_nsfw: boolean }) =>
            `data:image/png;base64,${item.base64}`
        );
        setSrcs(imageUrls);
      } else {
        throw new Error("Unexpected API response format");
      }
    } catch (e: any) {
      console.error("Generation error:", e);
      
      if (e.message.includes("subscription") || e.message.includes("no subscription")) {
        setErrorMessage("You need a subscription to generate images. Redirecting to pricing...");
        setTimeout(() => {
          router.push("/pricing");
        }, 2000);
      } else {
        const imgs: string[] = [];
        for (let i = 0; i < Math.min(4, data.num_images); i++) {
          imgs.push(
            svgDataUrl(`${data.prompt} [fallback preview #${i + 1}]`)
          );
        }
        setSrcs(imgs);
        setErrorMessage(e.message || "Failed to generate images");
      }
    } finally {
      setLoading(false);
    }
  };

  // Size display name mapping
  const sizeLabels: Record<FormSchema["size"], string> = {
    square_1_1: "Square (1:1) - 1024×1024",
    portrait_2_3: "Portrait (2:3) - 768×1152",
    landscape_16_9: "Landscape (16:9) - 1024×576",
    tall_9_16: "Tall (9:16) - 576×1024",
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="rounded-3xl bg-gradient-to-br from-indigo-50 to-rose-50 p-8 shadow-xl">
          <h1 className="text-4xl font-extrabold">Image Generation with Freepik AI</h1>
          <p className="mt-2 text-zinc-600">
            Generate images from text prompts using Freepik AI API. Only enter the essential
            parameters - other settings are optimized by default.
          </p>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="md:col-span-2 bg-white/80 rounded-2xl p-6 shadow-inner">
              <Controller
                control={form.control}
                name="prompt"
                render={({ field, fieldState }) => (
                  <div>
                    <label className="block text-sm font-medium mb-2">Prompt *</label>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="Describe the image you want to generate..."
                      className={`w-full p-3 border rounded-lg ${
                        fieldState.error ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    <div className="flex justify-between">
                      <div className="text-xs text-zinc-500 mt-1">
                        {field.value.length < 3 
                          ? "Minimum 3 characters required" 
                          : `${field.value.length}/500 characters`}
                      </div>
                      {fieldState.error && (
                        <div className="text-xs text-red-600 mt-1">
                          {fieldState.error.message}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              />

              <div className="mt-6 grid grid-cols-2 gap-4">
                <Controller
                  control={form.control}
                  name="num_images"
                  render={({ field, fieldState }) => (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Number of Images
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={4}
                        {...field}
                        value={field.value}
                        onChange={(e) => {
                          const value = e.target.value === "" ? "" : Number(e.target.value);
                          field.onChange(value);
                        }}
                        className={`p-3 rounded-lg border w-full ${
                          fieldState.error ? "border-red-300" : "border-gray-300"
                        }`}
                      />
                      <div className="flex justify-between">
                        <div className="text-xs text-zinc-500 mt-1">
                          Generate 1-4 variations
                        </div>
                        {fieldState.error && (
                          <div className="text-xs text-red-600 mt-1">
                            {fieldState.error.message}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                />

                <Controller
                  control={form.control}
                  name="size"
                  render={({ field, fieldState }) => (
                    <div>
                      <label className="block text-sm font-medium mb-2">Resolution *</label>
                      <Select 
                        {...field} 
                        className={`w-full p-3 border rounded-lg ${
                          fieldState.error ? "border-red-300" : "border-gray-300"
                        }`}
                      >
                        <option value="">Select a resolution</option>
                        <option value="square_1_1">{sizeLabels.square_1_1}</option>
                        <option value="portrait_2_3">{sizeLabels.portrait_2_3}</option>
                        <option value="landscape_16_9">{sizeLabels.landscape_16_9}</option>
                        <option value="tall_9_16">{sizeLabels.tall_9_16}</option>
                      </Select>
                      <div className="flex justify-between">
                        <div className="text-xs text-zinc-500 mt-1">
                          Aspect ratio and dimensions
                        </div>
                        {fieldState.error && (
                          <div className="text-xs text-red-600 mt-1">
                            {fieldState.error.message}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                />
              </div>

              <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-indigo-800">Form Status:</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isFormValid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {isFormValid ? "Ready to generate" : "Complete all fields"}
                  </span>
                </div>
                <ul className="text-sm text-zinc-600 mt-2 space-y-1">
                  <li className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      form.getFieldState("prompt").error ? "bg-red-500" : "bg-green-500"
                    }`}></span>
                    Prompt: {form.getFieldState("prompt").error 
                      ? "Invalid or too short" 
                      : "Valid"}
                  </li>
                  <li className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      form.getFieldState("num_images").error ? "bg-red-500" : "bg-green-500"
                    }`}></span>
                    Images: {form.getValues("num_images")} of 4 max
                  </li>
                  <li className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      form.getFieldState("size").error ? "bg-red-500" : "bg-green-500"
                    }`}></span>
                    Resolution: {form.getValues("size") ? "Selected" : "Not selected"}
                  </li>
                </ul>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={!isFormValid || isLoading || isSubmitting}
                  className={`rounded-full px-6 py-3 shadow-lg transition-all duration-200 ${
                    !isFormValid || isLoading
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : isFormValid ? (
                    "Generate Image"
                  ) : (
                    "Complete all fields above"
                  )}
                </button>
                <div className="text-sm text-zinc-500">
                  {isFormValid 
                    ? "Tip: Be specific with your description for best results."
                    : "Please fill in all required fields marked with *"}
                </div>
              </div>

              {errorMessage && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-800 font-medium">Error</span>
                  </div>
                  <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
                </div>
              )}

              {Object.keys(form.formState.errors).length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Please fix the following errors:</h4>
                  <ul className="text-sm text-red-600 space-y-1">
                    {Object.entries(form.formState.errors).map(([field, error]) => (
                      <li key={field}>• {String(error.message)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Preview area */}
            <div className="rounded-2xl overflow-hidden border bg-black/5 p-4 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Generated Images</h3>
                {srcs.length > 0 && (
                  <button
                    onClick={downloadAllImages}
                    className="text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded-full flex items-center gap-1 transition-colors"
                  >
                    <Download size={14} />
                    Download All
                  </button>
                )}
              </div>
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  <p className="mt-4 text-zinc-500">Generating images with Freepik AI...</p>
                </div>
              ) : srcs.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 w-full">
                  {srcs.map((src, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={src}
                        alt={`Generated image ${i + 1}`}
                        className="rounded-lg shadow-xl w-full h-auto"
                      />
                      
                      {/* Image overlay with download button */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg">
                        <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              downloadImage(src, i);
                            }}
                            className="flex-1 bg-white hover:bg-gray-100 text-gray-800 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            title="Download image"
                          >
                            <Download size={16} />
                            Download
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              copyImageToClipboard(src, i);
                            }}
                            className="flex-1 bg-white hover:bg-gray-100 text-gray-800 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            title="Copy image to clipboard"
                          >
                            {copiedIndex === i ? (
                              <>
                                <Check size={16} className="text-green-600" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy size={16} />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* Image number badge */}
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        Image {i + 1}
                      </div>
                    </div>
                  ))}
                  
                  {/* Download info */}
                  <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                    <p className="text-sm text-indigo-700">
                      <strong>Tip:</strong> Hover over images to see download options. 
                      Images are PNG format with high resolution.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="text-5xl mb-4">🖼️</div>
                  <p className="text-zinc-500">No images generated yet.</p>
                  <p className="text-zinc-400 text-sm mt-2">
                    {isFormValid 
                      ? "Click 'Generate Image' to create images"
                      : "Complete the form to generate images"}
                  </p>
                </div>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </main>
  );
}