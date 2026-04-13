export default function EmbedRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-0">{children}</div>;
}
