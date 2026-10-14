import { RotateCcw, Search } from "lucide-react";

export type ReportFilterOption = {
	value: string;
	label: string;
};

export type ReportFilterField = {
	key: string;
	label: string;
	placeholder?: string;
	options?: ReportFilterOption[];
};

type ReportFiltersProps = {
	searchLabel: string;
	searchPlaceholder: string;
	searchValue: string;
	fields: ReportFilterField[];
	values: Record<string, string>;
	onSearchChange: (value: string) => void;
	onFieldChange: (key: string, value: string) => void;
	onReset: () => void;
};

export function ReportFilters({
	searchLabel,
	searchPlaceholder,
	searchValue,
	fields,
	values,
	onSearchChange,
	onFieldChange,
	onReset,
}: ReportFiltersProps) {
	return (
		<section className="mb-5 rounded-lg border border-line bg-surface p-4 sm:p-5 print:hidden">
			<div className="mb-3 flex items-center justify-between gap-3">
				<div>
					<h2 className="text-sm font-semibold text-ink">
						Report filters
					</h2>
					<p className="mt-0.5 text-xs text-ink-muted">
						Filters are applied by this report endpoint.
					</p>
				</div>
				<button
					type="button"
					onClick={onReset}
					className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-ink-muted hover:bg-surface-2 hover:text-ink"
				>
					<RotateCcw size={14} aria-hidden="true" />
					Clear filters
				</button>
			</div>
			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				<label className="relative sm:col-span-2 xl:col-span-2">
					<span className="sr-only">{searchLabel}</span>
					<Search
						aria-hidden="true"
						className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
					/>
					<input
						type="search"
						value={searchValue}
						onChange={(event) =>
							onSearchChange(event.target.value)
						}
						placeholder={searchPlaceholder}
						className="h-10 w-full rounded-md border border-line bg-bg pl-9 pr-3 text-sm text-ink outline-none focus:border-brand"
					/>
				</label>
				{fields.map((field) => (
					<label key={field.key}>
						<span className="sr-only">
							{field.label}	
						</span>
						{field.options ? (
							<select
								value={values[field.key] ?? ""}
								onChange={(event) =>
									onFieldChange(
										field.key,
										event.target.value,
									)
								}
								className="h-10 w-full rounded-md border border-line bg-bg px-3 text-sm text-ink outline-none focus:border-brand"
							>
								<option value="">
									{field.label}
								</option>
								{field.options.map((option) => (
									<option
										key={option.value}
										value={option.value}
									>
										{option.label}
									</option>
								))}
							</select>
						) : (
							<input
								type="search"
								value={values[field.key] ?? ""}
								onChange={(event) =>
									onFieldChange(
										field.key,
										event.target.value,
									)
								}
								placeholder={
									field.placeholder ??
									field.label
								}
								className="h-10 w-full rounded-md border border-line bg-bg px-3 text-sm text-ink outline-none focus:border-brand"
							/>
						)}
					</label>
				))}
			</div>
		</section>
	);
}
