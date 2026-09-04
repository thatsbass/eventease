import type { ComponentProps } from "react"
import { Button, Stack } from "@chakra-ui/react"
import { MdAlternateEmail, MdLockOutline, MdPersonOutline } from "react-icons/md"
import { AuthEmailSummary } from "./auth-email-summary"
import { AuthField } from "./auth-field"
import { TextError } from "./auth-error-text"

type Props = {
  email: string
  fullName: string
  username: string
  password: string
  confirmPassword: string
  onFullNameChange: (value: string) => void
  onUsernameChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onChangeEmail: () => void
  onSubmit: ComponentProps<typeof Stack>["onSubmit"]
  error?: string | null
  isSubmitting?: boolean
}

export function AuthRegisterStep({
  email,
  fullName,
  username,
  password,
  confirmPassword,
  onFullNameChange,
  onUsernameChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onChangeEmail,
  onSubmit,
  error,
  isSubmitting,
}: Props) {
  return (
    <Stack as="form" gap={4} onSubmit={onSubmit}>
      <AuthEmailSummary email={email} onChangeEmail={onChangeEmail} />

      <AuthField
        label="Nom complet"
        icon={MdPersonOutline}
        placeholder="Awa Diop"
        value={fullName}
        onChange={(event) => onFullNameChange(event.target.value)}
      />

      <AuthField
        label="Nom d'utilisateur"
        icon={MdAlternateEmail}
        placeholder="awa.diop"
        value={username}
        onChange={(event) => onUsernameChange(event.target.value)}
      />

      <AuthField
        label="Mot de passe"
        icon={MdLockOutline}
        type="password"
        placeholder="********"
        value={password}
        onChange={(event) => onPasswordChange(event.target.value)}
      />

      <AuthField
        label="Confirmer le mot de passe"
        icon={MdLockOutline}
        type="password"
        placeholder="********"
        value={confirmPassword}
        onChange={(event) => onConfirmPasswordChange(event.target.value)}
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
        {isSubmitting ? "Creation..." : "Creer mon compte"}
      </Button>
    </Stack>
  )
}
