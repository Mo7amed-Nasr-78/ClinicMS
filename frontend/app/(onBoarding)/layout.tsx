"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

export default function OnboardingLayout({
	children,
}: {
	children: ReactNode;
}) {
	return <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>{children}</SessionProvider>;
}
