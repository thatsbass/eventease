import { Text } from "@chakra-ui/react"

type Props = {
  error?: string | null
}

export function TextError({ error }: Props) {
  if (!error) return null

  return (
    <Text fontSize="xs" color="red.300">
      {error}
    </Text>
  )
}
