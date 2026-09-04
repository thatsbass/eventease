"use client"

import {
  Field,
  InputGroup,
  Input,
  Box,
} from "@chakra-ui/react"
import { PasswordInput } from "./password-input"
import type { ReactNode } from "react"

interface FormFieldProps {
  label: string
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: "text" | "email" | "tel" | "password"
  icon?: ReactNode
  isPassword?: boolean
}

export const FormField = ({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  icon,
  isPassword = false,
}: FormFieldProps) => {
  return (
    <Box w="full">
      <Field.Root width="100%">
        <Field.Label fontWeight="medium" color="#07122B">
          {label}
        </Field.Label>
        <InputGroup startElement={icon}>
          {isPassword ? (
            <PasswordInput
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              bg="gray.100"
              rounded="full"
              py={5}
              pl={12}
              fontSize="md"
              _placeholder={{ color: "gray.400" }}
            />
          ) : (
            <Input
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              bg="gray.100"
              rounded="full"
              py={5}
              pl={12}
              fontSize="md"
              _placeholder={{ color: "gray.400" }}
            />
          )}
        </InputGroup>
      </Field.Root>
    </Box>
  )
}