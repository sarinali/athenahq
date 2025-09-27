import React from "react";
import { cn } from "@/lib/utils";

interface GradientBorderViewProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  contentClassName?: string;
  children?: React.ReactNode;
  inverted?: boolean;
}

export default function GradientBorderView({
  children,
  className,
  contentClassName,
  inverted = false,
  ...props
}: GradientBorderViewProps) {
  return (
    <div
      className={cn(
        "rounded-[20px] p-[1px]",
        inverted
          ? "bg-gradient-to-b from-[#4C4A4A] to-[#191919]"
          : "bg-gradient-to-b from-[#393939] to-[#000000]",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "rounded-[20px]",
          inverted ? "bg-black" : "bg-[#252525]",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}

