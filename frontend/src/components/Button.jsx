import { cn } from '../lib/utils';

export default function Button({ variant = 'primary', size = 'md', className, as = 'button', children, ...props }) {
  const Component = as;
  const variants = {
    primary: 'btn btn-primary',
    outline: 'btn btn-outline',
    ghost: 'btn btn-ghost',
  };

  const sizes = {
    md: 'px-5 py-3 text-sm',
    sm: 'px-4 py-2 text-xs',
    lg: 'px-6 py-3 text-base',
  };

  const disabledClass = props.disabled ? 'opacity-60 cursor-not-allowed' : '';

  return (
    <Component className={cn(variants[variant], sizes[size], 'transition-base', disabledClass, className)} {...props}>
      {children}
    </Component>
  );
}
