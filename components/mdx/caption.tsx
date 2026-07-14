export function Caption({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mt-3 mb-8 text-sm leading-6 text-muted [&_p]:mb-0 [&_p]:text-sm [&_p]:leading-6">
      {children}
    </div>
  );
}
