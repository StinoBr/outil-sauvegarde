import Button from './Button';

export default function Modal({ open, onClose, title, description, children, actions }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-content motion-fade">
        <header className="mb-4">
          {title && <h3 className="text-xl font-semibold mb-1">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </header>
        <div className="space-y-4">{children}</div>
        <footer className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Fermer
          </Button>
          {actions}
        </footer>
      </div>
    </div>
  );
}
