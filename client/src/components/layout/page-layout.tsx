import { type ReactNode } from "react";

export interface PageLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
}

export function PageLayout({
  title,
  description,
  children,
  isLoading = false,
  loadingText = "Loading...",
}: PageLayoutProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">{loadingText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
