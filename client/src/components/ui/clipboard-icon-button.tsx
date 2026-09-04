import { Button, Clipboard, IconButton , Text} from "@chakra-ui/react"

export const ClipboardIconButton = () => {
  return (
    <Clipboard.Trigger asChild>
      <Button variant="surface" size="sm">
        <Clipboard.Indicator />
        <Text>Copier</Text>
      </Button>
    </Clipboard.Trigger>
  )
}