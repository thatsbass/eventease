import type { ComponentProps } from "react"
import { Button, Stack, Text } from "@chakra-ui/react"
import { MdAlternateEmail } from "react-icons/md"
import { AuthField } from "./auth-field"

type Props = {
  email: string
  onEmailChange: (value: string) => void
  onSubmit: ComponentProps<typeof Stack>["onSubmit"]
  error?: string | null
  isSubmitting?: boolean
}

export function AuthEmailStep({ email, onEmailChange, onSubmit, error, isSubmitting }: Props) {
  return (
    <Stack as="form" gap={4} onSubmit={onSubmit}>
      <AuthField
        label="Email"
        icon={MdAlternateEmail}
        placeholder="you@example.com"
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
      />

      {error ? (
        <Text fontSize="xs" color="red.300">
          {error}
        </Text>
      ) : null}

      <Button
        type="submit"
        bg="white"
        color="gray.900"
        borderRadius="lg"
        h="44px"
        disabled={Boolean(isSubmitting)}
        _hover={{ bg: "gray.100" }}
      >
        {isSubmitting ? "Verification..." : "Continuer"}
      </Button>
    </Stack>
  )
}
