"use client";

import { AlertCircle, CheckCircle, Info } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/utils";

const messageVariants = cva("p-4 rounded-lg text-sm flex items-start gap-3", {
  variants: {
    variant: {
      default: "bg-gray-100 text-gray-800 border border-gray-200",
      success: "bg-green-50 text-green-800 border border-green-100",
      error: "bg-red-50 text-red-800 border border-red-100 font-medium",
      warning: "bg-yellow-50 text-yellow-800 border border-yellow-100"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

export type Message = {
  message?: string;
  error?: string;
  success?: string;
  warning?: string;
};

interface FormMessageProps extends VariantProps<typeof messageVariants> {
  message: Message;
  className?: string;
}

export function FormMessage({ message, className, variant }: FormMessageProps) {
  // Determine the variant based on the message object
  const computedVariant = variant || (() => {
    if (message.success) return "success";
    if (message.error) return "error";
    if (message.warning) return "warning";
    return "default";
  })();
  
  // Get the message content based on the message object fields
  const content = message.success || message.error || message.warning || message.message;
  
  // Select the appropriate icon based on the variant
  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    default: Info
  }[computedVariant];
  
  return (
    <div className={cn(messageVariants({ variant: computedVariant }), className)}>
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {content}
      </div>
    </div>
  );
}
