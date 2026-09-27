import toast, { type ToastOptions } from "react-hot-toast"

const baseStyle = {
  color: "#ffffff",
  backdropFilter: "blur(10px)",
  border: "none",
  borderRadius: "12px",
  fontWeight: 500,
  padding: "12px 20px",
} satisfies ToastOptions["style"]

function notify(
  message: string,
  look: ToastOptions,
  options: ToastOptions | undefined,
  show: (message: string, options?: ToastOptions) => string,
) {
  return show(message, {
    duration: look.duration ?? 3000,
    ...look,
    ...options,
    style: {
      ...baseStyle,
      ...look.style,
      ...options?.style,
    },
    iconTheme: {
      primary: options?.iconTheme?.primary ?? look.iconTheme?.primary ?? "#ffffff",
      secondary: options?.iconTheme?.secondary ?? look.iconTheme?.secondary ?? "#ffffff",
    },
  })
}

export const useToast = () => {
  const success = (message: string, options?: ToastOptions) =>
    notify(
      message,
      {
        style: {
          background: "linear-gradient(135deg, #10b981, #059669)",
          boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        },
        iconTheme: { primary: "#ffffff", secondary: "#10b981" },
      },
      options,
      toast.success,
    )

  const error = (message: string, options?: ToastOptions) =>
    notify(
      message,
      {
        style: {
          background: "linear-gradient(135deg, #ef4444, #dc2626)",
          boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        },
        iconTheme: { primary: "#ffffff", secondary: "#ef4444" },
      },
      options,
      toast.error,
    )

  const loading = (message: string, options?: ToastOptions) =>
    notify(
      message,
      {
        duration: Infinity,
        style: {
          background: "linear-gradient(135deg, #3b82f6, #2563eb)",
          boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        },
        iconTheme: { primary: "#ffffff", secondary: "#3b82f6" },
      },
      options,
      toast.loading,
    )

  const info = (message: string, options?: ToastOptions) =>
    notify(
      message,
      {
        style: {
          background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
          boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        },
        iconTheme: { primary: "#ffffff", secondary: "#8b5cf6" },
      },
      options,
      toast,
    )

  const warning = (message: string, options?: ToastOptions) =>
    notify(
      message,
      {
        style: {
          background: "linear-gradient(135deg, #f59e0b, #d97706)",
          boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        },
        iconTheme: { primary: "#ffffff", secondary: "#f59e0b" },
      },
      options,
      toast,
    )

  const blank = (message: string, options?: ToastOptions) =>
    notify(
      message,
      {
        style: {
          background: "rgba(15, 23, 42, 0.9)",
          color: "#f1f5f9",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        },
        iconTheme: { primary: "#f1f5f9", secondary: "rgba(255, 255, 255, 0.2)" },
      },
      options,
      toast,
    )

  const promise = <T,>(
    request: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    },
    options?: ToastOptions,
  ) =>
    toast.promise(request, messages, {
      ...options,
      style: {
        ...baseStyle,
        ...options?.style,
      },
    })

  const dismiss = (toastId?: string) => {
    toast.dismiss(toastId)
  }

  const custom = (message: string, options?: ToastOptions) => toast(message, options)

  return {
    success,
    error,
    loading,
    info,
    warning,
    blank,
    promise,
    dismiss,
    custom,
  }
}
