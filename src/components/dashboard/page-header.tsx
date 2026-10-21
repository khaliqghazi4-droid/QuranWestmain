export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    // adm-page-header: readable over the admin's background video (globals.css)
    <div className="adm-page-header flex flex-wrap items-end justify-between gap-3 mb-3">
      <div>
        <h1 className="text-base sm:text-lg font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
