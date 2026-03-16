"use client";

import type { ReactNode } from "react";

import clsx from "clsx";

import Card from "@/components/single/card";

export type LoadingStepStatus = "pending" | "active" | "completed" | "error";

export interface LoadingStepItem {
  label: string;
  description?: string;
  status?: LoadingStepStatus;
}

interface LoadingStepProps {
  isLoading: boolean;
  variant?: "inline" | "overlay" | "page";
  title?: string;
  description?: ReactNode;
  currentStep?: string;
  steps?: LoadingStepItem[];
  children?: ReactNode;
  className?: string;
  panelClassName?: string;
  overlayClassName?: string;
  minHeightClassName?: string;
}

const STATUS_STYLES: Record<LoadingStepStatus, string> = {
  pending: "border-gray-300 bg-white dark:border-white/15 dark:bg-transparent",
  active: "border-accent-600 bg-accent-600 shadow-[0_0_0_1px_rgba(37,99,235,0.22)]",
  completed: "border-emerald-600 bg-emerald-600",
  error: "border-red-600 bg-red-600",
};

const LoadingPanel = ({
  title,
  description,
  currentStep,
  steps,
  panelClassName,
}: Omit<LoadingStepProps, "children" | "className" | "overlayClassName" | "variant" | "isLoading" | "minHeightClassName">) => {
  return (
    <Card extra={clsx("w-full max-w-xl border border-gray-200 shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:shadow-[0_20px_44px_rgba(0,0,0,0.32)]", panelClassName)}>
      <div className="p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-accent-200 bg-accent-50 dark:border-accent-800/40 dark:bg-accent-900/10">
            <div className="h-5 w-5 animate-spin border-2 border-accent-200 border-t-accent-700 dark:border-accent-700/40 dark:border-t-accent-300" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold tracking-[0.01em] text-navy-700 dark:text-white">
              {title || "Cargando"}
            </h3>

            {description ? (
              <div className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
                {description}
              </div>
            ) : null}

            {currentStep ? (
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent-700 dark:text-accent-300">
                {currentStep}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
            <span>En proceso</span>
            <span>Sincronizando</span>
          </div>
          <div className="relative h-1.5 overflow-hidden bg-gray-200 dark:bg-white/10">
            <div className="loading-step-bar absolute inset-y-0 left-0 w-[38%] bg-accent-600 dark:bg-accent-400" />
          </div>
        </div>

        {steps?.length ? (
          <div className="mt-5 space-y-3 border-t border-gray-200 pt-4 dark:border-white/10">
            {steps.map((step, index) => {
              const status = step.status || "pending";

              return (
                <div key={`${step.label}-${index}`} className="flex items-start gap-3">
                  <div
                    className={clsx(
                      "mt-1 h-3 w-3 shrink-0 border",
                      STATUS_STYLES[status]
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {step.label}
                    </p>
                    {step.description ? (
                      <p className="mt-0.5 text-xs leading-5 text-gray-500 dark:text-gray-400">
                        {step.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
      <style jsx>{`
        .loading-step-bar {
          animation: loadingStepSlide 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          will-change: transform;
        }

        @keyframes loadingStepSlide {
          0% {
            transform: translateX(-140%);
          }
          50% {
            transform: translateX(120%);
          }
          100% {
            transform: translateX(260%);
          }
        }
      `}</style>
    </Card>
  );
};

const LoadingStep = ({
  isLoading,
  variant = "inline",
  title,
  description,
  currentStep,
  steps,
  children,
  className,
  panelClassName,
  overlayClassName,
  minHeightClassName = "min-h-[240px]",
}: LoadingStepProps) => {
  if (variant === "overlay" && children) {
    return (
      <div className={clsx("relative", className)}>
        {children}
        {isLoading ? (
          <div
            className={clsx(
              "absolute inset-0 z-20 flex items-center justify-center bg-white/86 p-4 backdrop-blur-sm dark:bg-navy-900/82",
              overlayClassName
            )}
          >
            <LoadingPanel
              title={title}
              description={description}
              currentStep={currentStep}
              steps={steps}
              panelClassName={panelClassName}
            />
          </div>
        ) : null}
      </div>
    );
  }

  if (!isLoading) {
    return children ? <>{children}</> : null;
  }

  if (variant === "page") {
    return (
      <div
        className={clsx(
          "fixed inset-0 z-[12000] flex items-center justify-center bg-slate-100/80 p-4 backdrop-blur-sm dark:bg-navy-900/84",
          overlayClassName,
          className
        )}
      >
        <LoadingPanel
          title={title}
          description={description}
          currentStep={currentStep}
          steps={steps}
          panelClassName={panelClassName}
        />
      </div>
    );
  }

  return (
    <div className={clsx("flex w-full items-center justify-center", minHeightClassName, className)}>
      <LoadingPanel
        title={title}
        description={description}
        currentStep={currentStep}
        steps={steps}
        panelClassName={panelClassName}
      />
    </div>
  );
};

export default LoadingStep;
