import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Upload, File, X, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileWithPreview extends File {
  preview?: string;
}

export function GatherPage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // URL validation function
  const validateUrl = (value: string) => {
    if (!value) {
      setUrlError("");
      return false;
    }

    try {
      new URL(value);
      setUrlError("");
      return true;
    } catch (e) {
      setUrlError("Please enter a valid URL");
      return false;
    }
  };

  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    validateUrl(newUrl);
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files) as FileWithPreview[];
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files) as FileWithPreview[];
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  // Remove a file
  const removeFile = (fileToRemove: FileWithPreview) => {
    setFiles(files.filter((file) => file !== fileToRemove));
  };

  // Check if the form is valid (valid URL or at least one file)
  const isFormValid = () => {
    return (url && !urlError) || files.length > 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      // In a real app, you would process the files/URL here
      navigate("/sales/verticals");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Info Gathering</h1>
        <p className="text-lg text-muted-foreground">
          Provide product information to kick off the sales analysis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* URL Input Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Globe className="mr-2 h-5 w-5 text-primary" />
            Product Page URL
          </h2>

          <div className="space-y-2">
            <Label htmlFor="product-url">Enter your product page URL</Label>
            <div className="relative">
              <Input
                id="product-url"
                placeholder="https://example.com/your-product"
                value={url}
                onChange={handleUrlChange}
                className={cn(urlError && "border-destructive")}
              />
              {urlError && (
                <div className="flex items-center text-sm text-destructive mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {urlError}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* File Upload Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Upload className="mr-2 h-5 w-5 text-primary" />
            Or Upload Files
          </h2>

          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/20 hover:border-primary/50"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">
                {isDragging ? "Drop files here" : "Drag & drop files here"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                or click to browse (PDF, DOC, DOCX, TXT, JPG, PNG)
              </p>
            </div>
          </div>

          {/* File Preview List */}
          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-medium">
                Uploaded Files ({files.length})
              </h3>
              <div className="divide-y">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center">
                      <File className="h-5 w-5 text-muted-foreground mr-2" />
                      <div>
                        <p className="text-sm font-medium truncate max-w-[250px]">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(file)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Sticky Footer with Continue Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 md:p-6 z-10">
          <div className="max-w-2xl mx-auto flex justify-end">
            <Button type="submit" disabled={!isFormValid()} className="gap-2">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Spacer to prevent content from being hidden behind sticky footer */}
        <div className="h-20"></div>
      </form>
    </div>
  );
}
