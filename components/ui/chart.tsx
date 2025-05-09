import * as React from "react"
import { Tooltip, TooltipProps } from "recharts"

export interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContextValue {
  config: ChartConfig
}

interface ChartRootProps {
  config: ChartConfig
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

const ChartContext = React.createContext<ChartContextValue | null>(null)

function useChartContext(): ChartContextValue {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChartContext must be used within a <Chart />")
  }
  return context
}

function ChartRoot({ config, children, className, style }: ChartRootProps) {
  const value = React.useMemo(() => ({ config }), [config])

  return (
    <ChartContext.Provider value={value}>
      <figure className={className} style={style}>{children}</figure>
    </ChartContext.Provider>
  )
}

interface ChartTooltipContentProps {
  className?: string
  active?: boolean
  payload?: any[]
  label?: string
  hideLabel?: boolean
}

function ChartTooltipContent({
  className,
  active,
  payload,
  label,
  hideLabel,
}: ChartTooltipContentProps) {
  const { config } = useChartContext()

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      className={`rounded-lg border bg-background p-2 shadow-sm ${
        className ?? ""
      }`}
    >
      {!hideLabel && <div className="font-medium">{label}</div>}
      <div className={hideLabel ? "" : "mt-1 flex flex-col gap-0.5"}>
        {payload.map((item) => {
          const color = item.color || config[item.dataKey as string]?.color
          return (
            <div
              className="flex items-center justify-between gap-2"
              key={item.dataKey}
            >
              <div className="flex items-center gap-1">
                {color && (
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ background: color }}
                  />
                )}
                <span className="text-xs text-muted-foreground">
                  {config[item.dataKey as string]?.label || item.name}:
                </span>
              </div>
              <span className="text-xs font-medium">{item.value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Define value and name types for Recharts components
type ValueType = string | number | Array<string | number>
type NameType = string | number

// Update the interface to use proper types for Recharts Tooltip props
interface ChartTooltipProps {
  variant?: "default"
  className?: string
  children?: React.ReactNode
  cursor?: boolean | object
  offset?: number
  content?: TooltipProps<ValueType, NameType>['content']
}

function ChartTooltip({
  variant = "default",
  cursor = true,
  offset = 10,
  ...props
}: ChartTooltipProps) {
  const cursorStyle = cursor === true ? { fill: "hsl(var(--muted))" } : false;
  
  return (
    <Tooltip
      {...props}
      cursor={cursorStyle}
      wrapperStyle={{ "--tooltip-offset": `${offset}px` } as React.CSSProperties}
    />
  )
}

interface ChartContainerProps {
  config: ChartConfig
  className?: string
  children: React.ReactNode
  style?: React.CSSProperties
}

function ChartContainer({
  config,
  className,
  children,
  style,
}: ChartContainerProps) {
  const dynamicStyles = React.useMemo(
    () =>
      Object.entries(config).reduce(
        (styles, [key, value]) => ({
          ...styles,
          [`--color-${key}`]: value.color,
        }),
        {}
      ),
    [config]
  )

  const combinedStyles = { ...dynamicStyles, ...style } as React.CSSProperties;

  return (
    <ChartRoot
      config={config}
      className={className}
      style={combinedStyles}
    >
      {children}
    </ChartRoot>
  )
}

export { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  useChartContext 
} 