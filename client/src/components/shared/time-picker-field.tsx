"use client";

import * as React from "react";
import {
  Button,
  Field,
  HStack,
  Icon,
  Input,
  Popover,
  Portal,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { LuClock3 } from "react-icons/lu";

type TimePickerFieldProps = {
  label?: string;
  placeholder?: string;
  value?: string | null;
  onChange?: (time: string | null) => void;

  minTime?: string;
  maxTime?: string;
  stepMinutes?: number;
  closeOnSelect?: boolean;
  hideIcon?: boolean;
  required?: boolean;
  invalid?: boolean;
  disabled?: boolean;

  helperText?: string;
  errorText?: string;
  clearLabel?: string;
  closeLabel?: string;
  formatDisplay?: (time: string) => string;
  valueTextColor?: string;
  placeholderTextColor?: string;

  rootProps?: React.ComponentProps<typeof Field.Root>;
  triggerProps?: React.ComponentProps<typeof Button>;
  popoverContentProps?: React.ComponentProps<typeof Popover.Content>;
  timeInputProps?: React.ComponentProps<typeof Input>;
  optionsGridProps?: React.ComponentProps<typeof SimpleGrid>;
  optionButtonProps?: React.ComponentProps<typeof Button>;
  selectedOptionButtonProps?: React.ComponentProps<typeof Button>;
  footerButtonsWrapProps?: React.ComponentProps<typeof HStack>;
  clearButtonProps?: React.ComponentProps<typeof Button>;
  closeButtonProps?: React.ComponentProps<typeof Button>;

  name?: string;
  id?: string;
  className?: string;
};

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

const toMinutes = (time: string) => {
  const match = TIME_RE.exec(time);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};

const isValidTime = (time: string | null | undefined): time is string => {
  if (!time) return false;
  return TIME_RE.test(time);
};

export function TimePickerField({
  label = "Heure",
  placeholder = "Choisir une heure",
  value = null,
  onChange,
  minTime,
  maxTime,
  stepMinutes = 30,
  closeOnSelect = true,
  hideIcon = false,
  required = false,
  invalid = false,
  disabled = false,
  helperText,
  errorText,
  clearLabel = "Effacer",
  closeLabel = "Fermer",
  formatDisplay = (time) => time,
  valueTextColor = "fg",
  placeholderTextColor = "fg.muted",
  rootProps,
  triggerProps,
  popoverContentProps,
  timeInputProps,
  optionsGridProps,
  optionButtonProps,
  selectedOptionButtonProps,
  footerButtonsWrapProps,
  clearButtonProps,
  closeButtonProps,
  name,
  id,
  className,
}: TimePickerFieldProps) {
  const [open, setOpen] = React.useState(false);

  const normalizedStep = Math.max(1, Math.floor(stepMinutes));
  const minMinutes = React.useMemo(() => toMinutes(minTime ?? ""), [minTime]);
  const maxMinutes = React.useMemo(() => toMinutes(maxTime ?? ""), [maxTime]);

  const isAllowed = React.useCallback(
    (time: string) => {
      const minutes = toMinutes(time);
      if (minutes === null) return false;
      if (minMinutes !== null && minutes < minMinutes) return false;
      if (maxMinutes !== null && minutes > maxMinutes) return false;
      return true;
    },
    [minMinutes, maxMinutes],
  );

  const timeOptions = React.useMemo(() => {
    const options: string[] = [];
    for (let m = 0; m < 24 * 60; m += normalizedStep) {
      const hh = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      const time = `${hh}:${mm}`;
      if (isAllowed(time)) options.push(time);
    }
    return options;
  }, [normalizedStep, isAllowed]);

  const setValue = React.useCallback(
    (time: string | null) => {
      if (time && !isAllowed(time)) return;
      onChange?.(time);
    },
    [onChange, isAllowed],
  );

  const close = React.useCallback(() => setOpen(false), []);

  const displayValue = isValidTime(value) ? formatDisplay(value) : "";

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
              {!hideIcon ? <Icon as={LuClock3} /> : null}
            </HStack>
          </Button>
        </Popover.Trigger>

        <Portal>
          <Popover.Positioner>
            <Popover.Content p={3} w="auto" {...popoverContentProps} >
              {/* <Popover.Arrow /> */}
              <Popover.Body p={0}>
                <VStack align="stretch" gap={3}>
                  <Input
                    hidden
                    type="time"
                    value={isValidTime(value) ? value : ""}
                    onChange={(event) => {
                      const next = event.target.value;
                      if (!isValidTime(next)) {
                        setValue(null);
                        return;
                      }
                      setValue(next);
                      if (closeOnSelect) close();
                    }}
                    min={minTime}
                    max={maxTime}
                    step={normalizedStep * 60}
                    disabled={disabled}
                    {...timeInputProps}
                  />

                  <SimpleGrid columns={2} gap={2} maxH="180px" overflowY="auto" {...optionsGridProps} className="hidden-scroll">
                    {timeOptions.map((time) => {
                      const selected = value === time;
                      return (
                        <Button
                          key={time}
                          size="xs"
                          variant={selected ? "solid" : "ghost"}
                          onClick={() => {
                            setValue(time);
                            if (closeOnSelect) close();
                          }}
                          {...(selected ? selectedOptionButtonProps : optionButtonProps)}
                        >
                          {formatDisplay(time)}
                        </Button>
                      );
                    })}
                  </SimpleGrid>

                  <HStack justify="space-between" {...footerButtonsWrapProps}>
                    <Button size="sm" variant="ghost" onClick={() => setValue(null)} {...clearButtonProps}>
                      {clearLabel}
                    </Button>
                    <Button size="sm" variant="outline" onClick={close} {...closeButtonProps}>
                      {closeLabel}
                    </Button>
                  </HStack>
                </VStack>
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>

      <Input type="hidden" name={name} value={isValidTime(value) ? value : ""} readOnly />

      {!invalid && helperText ? <Field.HelperText>{helperText}</Field.HelperText> : null}
      {invalid && errorText ? <Field.ErrorText>{errorText}</Field.ErrorText> : null}
    </Field.Root>
  );
}
