import { useId, useState } from "react";
import { Upload } from "lucide-react";
import { supabase } from "../../lib/supabase";
export default function ChapterImageUpload({
  chapterId,
  imageUrl,
  onChange,
  onBusyChange,
  disabled = false,
}: {
  chapterId: string;
  imageUrl: string;
  onChange: (url: string) => void;
  onBusyChange: (busy: boolean) => void;
  disabled?: boolean;
}) {
  const inputId = useId();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function upload(file: File) {
    setError("");
    if (!chapterId || disabled) return;
    const extension: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    if (
      !extension[file.type] ||
      file.size === 0 ||
      file.size > 5 * 1024 * 1024
    ) {
      setError("Choose a JPG, PNG or WebP image up to 5 MB.");
      return;
    }
    setBusy(true);
    onBusyChange(true);
    try {
      // Decode before uploading to reject corrupt files, without drawing or changing the image.
      const decoded = await createImageBitmap(file);
      decoded.close();
      const path = `chapters/${chapterId}/hero/${crypto.randomUUID()}.${extension[file.type]}`;
      const result = await supabase.storage
        .from("event-media")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (result.error) throw new Error("Upload failed");
      onChange(
        supabase.storage.from("event-media").getPublicUrl(path).data.publicUrl,
      );
    } catch {
      setError(
        "The image could not be uploaded. Check the file and your connection, then try again.",
      );
    } finally {
      setBusy(false);
      onBusyChange(false);
    }
  }
  return (
    <section className="space-y-3">
      <h2 className="font-medium">Chapter image</h2>
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Chapter image preview"
          className="h-48 w-full rounded-lg object-cover sm:h-64"
        />
      )}
      <label
        htmlFor={inputId}
        className={`inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/20 px-4 py-3 ${busy || !chapterId || disabled ? "opacity-50" : "cursor-pointer hover:bg-white/5"}`}
      >
        <Upload size={18} />
        {busy ? "Uploading image…" : "Upload chapter image"}
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={busy || !chapterId || disabled}
        className="sr-only"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          e.currentTarget.value = "";
          if (file) void upload(file);
        }}
      />
      <p className="text-sm text-zinc-400">
        {!chapterId
          ? "Save the chapter first, then upload its image."
          : "Choose a JPG, PNG or WebP image up to 5 MB. Save the chapter after uploading."}
      </p>
      {busy && (
        <p role="status" className="text-sm text-amber-200">
          Uploading your image…
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}
      <details>
        <summary className="min-h-11 cursor-pointer text-sm text-zinc-400">
          Use an existing image link
        </summary>
        <label className="mt-2 block text-sm">
          Image URL
          <input
            type="url"
            disabled={busy || disabled}
            value={imageUrl}
            onChange={(e) => onChange(e.target.value)}
            className="mt-2 min-h-11 w-full rounded-lg border border-white/20 bg-zinc-900 px-3"
          />
        </label>
      </details>
    </section>
  );
}
