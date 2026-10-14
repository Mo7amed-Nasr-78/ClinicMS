export function Logomark({ size = 22 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <circle
                cx="12"
                cy="12"
                r="10.5"
                stroke="currentColor"
                strokeWidth="1.4"
            />
            <path
                d="M5 12.5H8.2L10 8L13 16L14.8 12.5H19"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </svg>
    );
}