import { Button } from "antd"
import type { ButtonProps } from "antd"
import { type FC, type ReactNode } from "react"

type ButtonBg = "primary" | "transparent" | "gray" | "fill" | "outline"

type TButton = {
  text: string
  size?: "lg" | "md"
  icon?: ReactNode
  bg?: ButtonBg
  onClick?: () => void
  disabled?: boolean
  className?: string
  children?: ReactNode
  role?: ButtonProps["role"]
  "aria-label"?: string
  "aria-checked"?: boolean
}

const antdLook: Record<ButtonBg, Pick<ButtonProps, "color" | "variant">> = {
  primary: { color: "primary", variant: "solid" },
  fill: { color: "primary", variant: "filled" },
  gray: { color: "default", variant: "filled" },
  outline: { color: "primary", variant: "outlined" },
  transparent: { color: "default", variant: "text" },
}

export const CustomButton: FC<TButton> = ({
  text,
  size = "md",
  icon,
  bg = "primary",
  onClick,
  disabled,
  className,
  children,
  role,
  "aria-label": ariaLabel,
  "aria-checked": ariaChecked,
}) => {
  return (
    <Button
      {...antdLook[bg]}
      size={size === "lg" ? "large" : "middle"}
      block={size === "lg"}
      icon={icon}
      htmlType="button"
      autoInsertSpace={false}
      onClick={onClick}
      disabled={disabled}
      className={className}
      role={role}
      aria-label={ariaLabel}
      aria-checked={ariaChecked}
    >
      {text}
      {children}
    </Button>
  )
}

export default CustomButton
