"use client"

import { useEffect, useLayoutEffect, useState, type CSSProperties, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { CloseOutlined } from "@ant-design/icons"

interface ModalWrapperProps {
  open: boolean
  onClose: () => void
  title?: string | ReactNode
  children: ReactNode
  footer?: ReactNode | null
  showCloseButton?: boolean
  closeIcon?: ReactNode
  className?: string
  maskClosable?: boolean
  showChildClasses?: boolean
  childrenClasses?: string
  width?: number | string
  centered?: boolean
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  open,
  onClose,
  title,
  children,
  footer = null,
  showCloseButton = true,
  closeIcon,
  className = "",
  maskClosable = true,
  showChildClasses = true,
  childrenClasses = "",
  width,
  centered = false,
}) => {
  const [mounted, setMounted] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useLayoutEffect(() => {
    setMounted(true)
    const mq = window.matchMedia("(min-width: 768px)")
    const sync = () => setIsDesktop(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  useEffect(() => {
    if (!open) return
    const html = document.documentElement
    const body = document.body
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow
    html.style.overflow = "hidden"
    body.style.overflow = "hidden"
    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
    }
  }, [open])

  if (!mounted || !open) return null

  const desktopWidth =
    typeof width === "number" ? `${width}px` : width || "600px"

  const placeCenter = isDesktop || centered

  const overlayStyle: CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100svh",
    zIndex: 1100,
    display: "flex",
    flexDirection: "column",
    justifyContent: placeCenter ? "center" : "flex-start",
    alignItems: placeCenter ? "center" : "stretch",
    padding: placeCenter ? 16 : "12svh 0 12px",
    boxSizing: "border-box",
    overflow: "auto",
  }

  const sheetStyle: CSSProperties = {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    width: placeCenter ? `min(${desktopWidth}, 92vw)` : "100%",
    maxHeight: "100%",
    minHeight: 0,
    overflow: "hidden",
    background: "var(--surface)",
    borderRadius: 16,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
    margin: placeCenter ? "auto 0" : 0,
    flexShrink: 1,
  }

  const node = !showChildClasses ? (
    <div style={overlayStyle}>
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }}
        onClick={maskClosable ? onClose : undefined}
      />
      <div
        className={`relative bg-surface shadow-xl rounded-lg ${className}`}
        style={{ maxWidth: "90vw", maxHeight: "100%", width: width || "auto", minWidth: 300 }}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10"
          >
            {closeIcon || <CloseOutlined className="text-gray-700" />}
          </button>
        )}
        {children}
      </div>
    </div>
  ) : (
    <div style={overlayStyle} role="presentation">
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(0, 0, 0, 0.5)" }}
        onClick={maskClosable ? onClose : undefined}
      />
      <div role="dialog" aria-modal="true" className={className} style={sheetStyle}>
        {(title || showCloseButton) && (
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-6 md:py-4">
            {title ? (
              <div className="min-w-0 flex-1 text-base font-semibold leading-snug text-foreground md:text-lg">
                {title}
              </div>
            ) : (
              <span />
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-primary/20 md:h-8 md:w-8"
              >
                {closeIcon || <CloseOutlined className="text-gray-500" />}
              </button>
            )}
          </div>
        )}

        <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 md:px-6 md:py-5 ${childrenClasses}`}>
          {children}
        </div>

        {footer ? (
          <div className="shrink-0 border-t border-border px-4 py-3 md:px-6 md:py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )

  return createPortal(node, document.body)
}
