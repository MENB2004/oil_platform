// src/components/ui/Button.tsx
import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  ...rest
}) => {
  const base = "px-5 py-2 rounded-full font-semibold transition inline-flex items-center justify-center";
  const style =
    variant === "primary"
      ? "bg-amber-500 text-white hover:bg-amber-600"
      : "border border-amber-500 text-amber-600 hover:bg-amber-100 dark:hover:bg-zinc-800";
  return (
    <button className={`${base} ${style} ${className}`} {...rest}>
      {children}
    </button>
  );
};

export default Button;
