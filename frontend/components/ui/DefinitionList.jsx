export function Def({ label, children }) {
  return (
    <div className="grid min-h-10 grid-cols-3 items-center gap-2 py-2">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm font-medium">{children}</dd>
    </div>
  );
}
