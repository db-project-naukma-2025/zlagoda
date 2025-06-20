import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Renders a styled scrollable container with custom scrollbars and viewport.
 *
 * Wraps the Radix UI ScrollArea primitives to provide a customizable scroll area, including a styled viewport, scrollbars, and corner element. Additional props and class names are forwarded to the root element.
 *
 * @param className - Additional class names to apply to the scroll area container
 * @param children - Elements to display within the scrollable viewport
 */
function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      className={cn("relative", className)}
      data-slot="scroll-area"
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
        data-slot="scroll-area-viewport"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

/**
 * Renders a customizable scrollbar for a scroll area, supporting vertical or horizontal orientation.
 *
 * Applies conditional styling based on orientation and includes a styled thumb element.
 *
 * @param orientation - The scrollbar orientation, either "vertical" or "horizontal". Defaults to "vertical".
 */
function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className,
      )}
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        className="bg-border relative flex-1 rounded-full"
        data-slot="scroll-area-thumb"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
