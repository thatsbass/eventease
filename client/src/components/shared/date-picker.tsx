"use client"

import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import { Icon } from "@chakra-ui/react"
import { SingleDatepicker } from "chakra-dayzed-datepicker"
import type { SingleDatepickerProps } from "chakra-dayzed-datepicker"
import { MdCalendarToday } from "react-icons/md"

export const defaultDatePickerPropsConfigs: NonNullable<
  SingleDatepickerProps["propsConfigs"]
> = {
  dayOfMonthBtnProps: {
    defaultBtnProps: {
      _hover: {
        background: "purple.200",
      },
    },
    selectedBtnProps: {
      background: "purple.100",
      border: "1px solid",
      borderColor: "purple.500",
    },
    todayBtnProps: {
      border: "1px solid",
      borderColor: "purple.500",
    },
  },
  dateNavBtnProps: {
    _hover: {
      background: "purple.50",
    },
  },
  popoverCompProps: {
    popoverContentProps: {
      color: "gray.500",
      boxShadow: "xs",
    },
  },
  calendarPanelProps: {
    wrapperProps: {
      borderColor: "green",
    },
    contentProps: {
      borderWidth: 0,
    },
    headerProps: {
      padding: "5px",
    },
    dividerProps: {
      display: "none",
    },
  },
  weekdayLabelProps: {
    fontWeight: "normal",
  },
  dateHeadingProps: {
    fontWeight: "semibold",
  },
}

export type DatePickerProps = Omit<
  SingleDatepickerProps,
  "date" | "onDateChange" | "triggerIcon" | "propsConfigs"
> & {
  value?: Date
  defaultValue?: Date
  onChange?: (date: Date) => void
  triggerIcon?: ReactNode
  propsConfigs?: SingleDatepickerProps["propsConfigs"]
}

export default function DatePicker({
  value,
  defaultValue,
  onChange,
  triggerVariant = "input",
  triggerIcon,
  propsConfigs,
  ...rest
}: DatePickerProps) {
  const [internalDate, setInternalDate] = useState<Date>(
    defaultValue ?? value ?? new Date()
  )

  const isControlled = value !== undefined
  const currentDate = isControlled ? value : internalDate
  const handleDateChange = (nextDate: Date) => {
    if (!isControlled) {
      setInternalDate(nextDate)
    }
    onChange?.(nextDate)
  }

  const resolvedTriggerIcon =
    triggerIcon ?? <Icon as={MdCalendarToday} boxSize="18px" color="gray.500" />

  const resolvedPropsConfigs = useMemo(
    () => propsConfigs ?? defaultDatePickerPropsConfigs,
    [propsConfigs]
  )

  const normalizedPropsConfigs = useMemo(() => {
    const inputProps = resolvedPropsConfigs?.inputProps
    if (!inputProps) {
      return resolvedPropsConfigs
    }

    const width = (inputProps as { w?: string | number; width?: string | number }).w ?? inputProps.width
    const minWidth =
      (inputProps as { minW?: string | number; minWidth?: string | number }).minW ?? inputProps.minWidth

    if (width === undefined && minWidth === undefined) {
      return resolvedPropsConfigs
    }

    return {
      ...resolvedPropsConfigs,
      inputProps: {
        ...inputProps,
        ...(width !== undefined && inputProps.width === undefined ? { width } : {}),
        ...(minWidth !== undefined && inputProps.minWidth === undefined ? { minWidth } : {}),
      },
    }
  }, [resolvedPropsConfigs])

  return (
    <SingleDatepicker
      name="date-input"
      date={currentDate}
      onDateChange={handleDateChange}
      propsConfigs={normalizedPropsConfigs}
      {...(triggerVariant === "input"
        ? { triggerVariant: "input", triggerIcon: resolvedTriggerIcon }
        : { triggerVariant: "default" })}
      {...rest}
    />
  )
}
