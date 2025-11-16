import { cn } from '../lib/utils';

export default function Card({ title, description, actions, className, children }) {
  return (
    <section className={cn('card motion-fade', className)}>
      {(title || description || actions) && (
        <header className="flex items-start justify-between gap-4 mb-4">
          <div>
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
