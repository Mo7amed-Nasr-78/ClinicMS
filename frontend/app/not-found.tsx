import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
	return (
		<main className="flex min-h-[calc(100vh-2rem)] items-center justify-center bg-bg px-5 py-12 text-ink">
			<section className="w-full max-w-xl text-center">
				<div className="mx-auto flex size-16 items-center justify-center rounded-full bg-surface-2 text-brand">
					<SearchX aria-hidden="true" size={30} />
				</div>
				<p className="mt-8 font-mono text-sm uppercase tracking-[0.16em] text-ink-muted">
					Wardline / 404
				</p>
				<h1 className="mt-3 font-serif text-6xl leading-none sm:text-7xl">
					Page not found
				</h1>
				<p className="mx-auto mt-5 max-w-md text-base leading-7 text-ink-muted">
					This page may have moved, or the address might be
					incorrect. Check the URL or head back to the home
					page.
				</p>
				<Link
					href="/"
					className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-chip transition-colors hover:bg-brand-deep"
				>
					<ArrowLeft aria-hidden="true" size={16} />
					Back to home
				</Link>
			</section>
		</main>
	);
}
