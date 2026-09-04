import { Button, Stack, Text } from "@chakra-ui/react"

type Props = {
  email: string
  onChangeEmail: () => void
}

export function AuthEmailSummary({ email, onChangeEmail }: Props) {
  return (
    <Stack gap={1}>
      <Text fontSize="xs" color="gray.500">
        Email
      </Text>
      <Text fontSize="sm" color="gray.200">
        {email.trim().toLowerCase()}
      </Text>
      <Button variant="plain" alignSelf="start" size="sm" color="gray.400" onClick={onChangeEmail}>
        Changer l'email
      </Button>
    </Stack>
  )
}

