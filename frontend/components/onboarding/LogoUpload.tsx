"use client";

import { useEffect, useState, DragEvent } from "react";
import { ImagePlus, X } from "lucide-react";

export const LOGO_ACCEPT = ["image/png", "image/jpeg", "image/webp"];
export const LOGO_MAX_BYTES = 2 * 1024 * 1024; // 2 MB

type LogoUploadProps = {
	file: File | null;
	onChange: (file: File | null) => void;
	error?: string;
};

export function validateLogo(file: File): string | null {
	if (!LOGO_ACCEPT.includes(file.type)) return "Use a PNG, JPG, or WebP image.";
	if (file.size > LOGO_MAX_BYTES) return "Logo must be 2 MB or smaller.";
	return null;
}

export function LogoUpload({ file, onChange, error }: LogoUploadProps) {
	const [preview, setPreview] = useState<string | null>(null);
	const [dragging, setDragging] = useState(false);

	// Build (and clean up) an object URL for the preview thumbnail.
	useEffect(() => {
		if (!file) {
			setPreview(null);
			return;
		}
		const url = URL.createObjectURL(file);
		setPreview(url);
		return () => URL.revokeObjectURL(url);
	}, [file]);

	const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
		e.preventDefault();
		setDragging(false);
		const dropped = e.dataTransfer.files?.[0];
		if (dropped) onChange(dropped);
	};

	if (file && preview && !error) {
		return (
			<div className="flex items-center gap-4 p-4 rounded-2xl border border-line bg-surface">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={preview}
					alt="Clinic logo preview"
					className="w-16 h-16 rounded-xl object-contain bg-surface-2 border border-line"
				/>
				<div className="flex-1 min-w-0">
					<p className="text-[0.9rem] font-medium text-ink truncate">{file.name}</p>
					<p className="font-mono text-[0.76rem] text-ink-faint">
						{(file.size / 1024).toFixed(0)} KB
					</p>
				</div>
				<button
					type="button"
					onClick={() => onChange(null)}
					aria-label="Remove logo"
					className="p-2 rounded-full text-ink-faint hover:text-ink hover:bg-surface-2 transition-colors duration-150"
				>
					<X size={16} />
				</button>
			</div>
		);
	}

	return (
		<div>
			<label
				htmlFor="logo"
				onDragOver={(e) => {
					e.preventDefault();
					setDragging(true);
				}}
				onDragLeave={() => setDragging(false)}
				onDrop={handleDrop}
				className={`flex flex-col items-center justify-center gap-3 px-6 py-10 rounded-2xl border border-dashed text-center cursor-pointer transition-colors duration-150 focus-within:outline focus-within:outline-2 focus-within:outline-accent focus-within:outline-offset-[3px] ${
					dragging
						? "border-brand bg-surface-2"
						: "border-line-strong bg-surface hover:border-brand hover:bg-surface-2"
				}`}
			>
				<span className="w-11 h-11 rounded-full bg-surface-2 text-brand flex items-center justify-center">
					<ImagePlus size={20} strokeWidth={1.8} />
				</span>
				<span className="text-[0.92rem] font-medium text-ink">
					Drop your logo here, or <span className="text-brand">browse</span>
				</span>
				<span className="text-[0.8rem] text-ink-faint">PNG, JPG or WebP · up to 2 MB</span>
				<input
					id="logo"
					type="file"
					accept={LOGO_ACCEPT.join(",")}
					className="sr-only"
					aria-describedby={error ? "logo-error" : undefined}
					onChange={(e) => {
						const picked = e.target.files?.[0] ?? null;
						onChange(picked);
						e.target.value = ""; // allow re-picking the same file
					}}
				/>
			</label>
			{error && (
				<p id="logo-error" role="alert" className="mt-2 text-[0.82rem] text-accent-strong">
					{error}
				</p>
			)}
		</div>
	);
}
