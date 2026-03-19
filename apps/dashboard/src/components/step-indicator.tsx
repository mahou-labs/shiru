import { cn } from "@/utils/cn";

type StepIndicatorProps = {
  currentStep: number;
  steps: string[];
};

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex w-full items-center justify-center gap-0">
      {steps.map((label, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={label} className="flex items-center">
            {/* Step dot + label */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex size-2.5 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                  isCompleted && "bg-primary",
                  isCurrent && "bg-primary ring-primary/20 ring-[3px]",
                  !isCompleted && !isCurrent && "bg-muted-foreground/25",
                )}
              />
              <span
                className={cn(
                  "text-[11px] leading-none font-medium whitespace-nowrap transition-colors duration-300",
                  isCurrent && "text-foreground",
                  isCompleted && "text-muted-foreground",
                  !isCompleted && !isCurrent && "text-muted-foreground/50",
                )}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                className={cn(
                  "mx-3 mt-[-18px] h-px w-10 transition-colors duration-300",
                  isCompleted ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
