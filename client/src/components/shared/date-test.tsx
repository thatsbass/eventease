"use client";

import * as React from "react";
import {
  Box,
  Button,
  Field,
  HStack,
  Icon,
  Input,
  Popover,
  Portal,
  Text,
} from "@chakra-ui/react";
import { LuCalendar } from "react-icons/lu";
import { DayPicker, Matcher } from "react-day-picker"
import { format, Locale } from "date-fns";
import { fr } from "date-fns/locale";
import "react-day-picker/dist/style.css";

type DatePickerFieldProps = {
  label?: string;
  placeholder?: string;
  value?: Date | null;
  onChange?: (date: Date | null) => void;

  /** règles */
  minDate?: Date;
  maxDate?: Date;
  disabledDays?: Matcher | Matcher[];
  required?: boolean;
  invalid?: boolean;
  disabled?: boolean;

  /** texte */
  helperText?: string;
  errorText?: string;
  clearLabel?: string;
  closeLabel?: string;
  locale?: Locale;

  /** affichage */
  formatDisplay?: (date: Date) => string;
  hideIcon?: boolean;
  closeOnSelect?: boolean;
  valueTextColor?: string;
  placeholderTextColor?: string;

  /** personnalisation Chakra */
  rootProps?: React.ComponentProps<typeof Field.Root>;
  triggerProps?: React.ComponentProps<typeof Button>;
  popoverContentProps?: React.ComponentProps<typeof Popover.Content>;
  calendarWrapperProps?: React.ComponentProps<typeof Box>;
  footerButtonsWrapProps?: React.ComponentProps<typeof HStack>;
  clearButtonProps?: React.ComponentProps<typeof Button>;
  closeButtonProps?: React.ComponentProps<typeof Button>;

  /** classNames pour react-day-picker */
  dayPickerClassName?: string;
  dayPickerModifiersStyles?: React.ComponentProps<typeof DayPicker>["modifiersStyles"];
  dayPickerModifiersClassNames?: React.ComponentProps<typeof DayPicker>["modifiersClassNames"];
  todayStyle?: React.CSSProperties;
  selectedStyle?: React.CSSProperties;
  todayClassName?: string;
  selectedClassName?: string;

  /** slot custom du footer */
  renderFooter?: (ctx: {
    value: Date | null;
    setValue: (d: Date | null) => void;
    close: () => void;
  }) => React.ReactNode;

  /** html form */
  name?: string;
  id?: string;
  className?: string;
};

export function DatePickerField({
  label = "Date",
  placeholder = "Choisir une date",
  value = null,
  onChange,
  minDate,
  maxDate,
  disabledDays,
  required = false,
  invalid = false,
  disabled = false,
  helperText,
  errorText,
  clearLabel = "Effacer",
  closeLabel = "Fermer",
  locale = fr,
  formatDisplay = (d) => format(d, "dd/MM/yyyy", { locale: fr }),
  hideIcon = false,
  closeOnSelect = true,
  valueTextColor = "fg",
  placeholderTextColor = "fg.muted",
  rootProps,
  triggerProps,
  popoverContentProps,
  calendarWrapperProps,
  footerButtonsWrapProps,
  clearButtonProps,
  closeButtonProps,
  dayPickerClassName,
  dayPickerModifiersStyles,
  dayPickerModifiersClassNames,
  todayStyle,
  selectedStyle,
  todayClassName,
  selectedClassName,
  renderFooter,
  name,
  id,
  className,
}: DatePickerFieldProps) {
  const [open, setOpen] = React.useState(false);

  const displayValue = value ? formatDisplay(value) : "";

  const computedDisabledDays = React.useMemo(() => {
    const rules: Matcher[] = [];
    if (minDate) rules.push({ before: minDate });
    if (maxDate) rules.push({ after: maxDate });

    if (Array.isArray(disabledDays)) rules.push(...disabledDays);
    else if (disabledDays) rules.push(disabledDays);

    return rules.length ? rules : undefined;
  }, [minDate, maxDate, disabledDays]);

  const setValue = React.useCallback(
    (d: Date | null) => onChange?.(d),
    [onChange]
  );

  const close = React.useCallback(() => setOpen(false), []);

  const mergedModifiersStyles = React.useMemo(() => {
    return {
      ...dayPickerModifiersStyles,
      ...(todayStyle ? { today: { ...dayPickerModifiersStyles?.today, ...todayStyle } } : {}),
      ...(selectedStyle
        ? { selected: { ...dayPickerModifiersStyles?.selected, ...selectedStyle } }
        : {}),
    };
  }, [dayPickerModifiersStyles, todayStyle, selectedStyle]);

  const mergedModifiersClassNames = React.useMemo(() => {
    return {
      ...dayPickerModifiersClassNames,
      ...(todayClassName ? { today: todayClassName } : {}),
      ...(selectedClassName ? { selected: selectedClassName } : {}),
    };
  }, [dayPickerModifiersClassNames, todayClassName, selectedClassName]);

  return (
    <Field.Root
      required={required}
      invalid={invalid}
      disabled={disabled}
      className={className}
      {...rootProps}
    >
      {label ? <Field.Label>{label}</Field.Label> : null}

      <Popover.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
        <Popover.Trigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            w="full"
            justifyContent="space-between"
            h="10"
            px={3}
            disabled={disabled}
            aria-label={label}
            {...triggerProps}
          >
            <HStack justify="space-between" w="full">
              <Text color={displayValue ? valueTextColor : placeholderTextColor}>
                {displayValue || placeholder}
              </Text>
              {!hideIcon ? <Icon as={LuCalendar} /> : null}
            </HStack>
          </Button>
        </Popover.Trigger>

        <Portal>
          <Popover.Positioner>
            <Popover.Content p={3} w="auto" {...popoverContentProps}>
              <Popover.Body p={0}>
                <Box {...calendarWrapperProps}>
                  <DayPicker
                    mode="single"
                    selected={value ?? undefined}
                    onSelect={(date : Date | undefined) => {
                      const next = date ?? null;
                      setValue(next);
                      if (closeOnSelect) close();
                    }}
                    disabled={computedDisabledDays}
                    locale={locale}
                    weekStartsOn={1}
                    showOutsideDays
                    className={dayPickerClassName}
                    modifiersStyles={mergedModifiersStyles}
                    modifiersClassNames={mergedModifiersClassNames}
                  />

                  {renderFooter ? (
                    renderFooter({ value, setValue, close })
                  ) : (
                    <HStack justify="space-between" mt={3} {...footerButtonsWrapProps}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setValue(null)}
                        {...clearButtonProps}
                      >
                        {clearLabel}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={close}
                        {...closeButtonProps}
                      >
                        {closeLabel}
                      </Button>
                    </HStack>
                  )}
                </Box>
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>

      <Input
        type="hidden"
        name={name}
        value={value ? format(value, "yyyy-MM-dd") : ""}
        readOnly
      />

      {!invalid && helperText ? <Field.HelperText>{helperText}</Field.HelperText> : null}
      {invalid && errorText ? <Field.ErrorText>{errorText}</Field.ErrorText> : null}
    </Field.Root>
  );
}
