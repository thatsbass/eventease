import type { ComponentProps } from "react"
import { Button, Stack, Text } from "@chakra-ui/react"
import { MdLockOutline } from "react-icons/md"
import { AuthEmailSummary } from "./auth-email-summary"
import { AuthField } from "./auth-field"
import { TextError } from "./auth-error-text"

type Props = {
  email: string
  password: string
  onPasswordChange: (value: string) => void
  onChangeEmail: () => void
  onSubmit: ComponentProps<typeof Stack>["onSubmit"]
  error?: string | null
  isSubmitting?: boolean
}

export function AuthLoginStep({
  email,
  password,
  onPasswordChange,
  onChangeEmail,
  onSubmit,
  error,
  isSubmitting,
}: Props) {
  return (
    <Stack as="form" gap={4} onSubmit={onSubmit}>
      <AuthEmailSummary email={email} onChangeEmail={onChangeEmail} />

      <AuthField
        label="Mot de passe"
        icon={MdLockOutline}
        type="password"
        placeholder="********"
        value={password}
        onChange={(event) => onPasswordChange(event.target.value)}
      />

      <TextError error={error} />

      <Button
        type="submit"
        bg="white"
        color="gray.900"
        borderRadius="lg"
        h="44px"
        disabled={Boolean(isSubmitting)}
        _hover={{ bg: "gray.100" }}
      >
        {isSubmitting ? "Connexion..." : "Se connecter"}
      </Button>
    </Stack>
  )
}
