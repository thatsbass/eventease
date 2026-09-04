"use client"

import { Button, Dialog, Portal, Stack, Text } from "@chakra-ui/react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventTitle: string
  onConfirm?: () => Promise<unknown> | unknown
  isConfirming?: boolean
}

export function CancelEventDialog({ open, onOpenChange, eventTitle, onConfirm, isConfirming }: Props) {
  const handleConfirm = async () => {
    if (!onConfirm) return

    try {
      await onConfirm()
      onOpenChange(false)
    } catch {
      // The caller shows the error (toast). Keep the dialog open.
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(d) => onOpenChange(d.open)}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            bg="rgba(18, 18, 20, 0.92)"
            backdropFilter="blur(18px)"
            border="1px solid"
            borderColor="whiteAlpha.200"
            borderRadius="2xl"
            boxShadow="0 30px 80px rgba(0, 0, 0, 0.45)"
            px={6}
            py={5}
            maxW="520px"
          >
            <Dialog.Header>
              <Stack gap={1}>
                <Dialog.Title color="gray.100" fontWeight="semibold">
                  Annuler l'evenement ?
                </Dialog.Title>
                <Dialog.Description color="gray.500" fontSize="sm">
                  Les participants ne pourront plus s'inscrire. Cette action est fortement deconseillee sans prevenir
                  votre audience.
                </Dialog.Description>
              </Stack>
            </Dialog.Header>

            <Dialog.Body pt={4}>
              <Stack gap={2}>
                <Text color="gray.400" fontSize="sm">
                  Evenement:
                </Text>
                <Text color="gray.100" fontWeight="semibold">
                  {eventTitle}
                </Text>
              </Stack>
            </Dialog.Body>

            <Dialog.Footer pt={6}>
              <Stack w="full" gap={3} direction={{ base: "column", sm: "row" }} justify="flex-end">
                <Dialog.CloseTrigger asChild>
                  <Button
                    variant="outline"
                    borderColor="whiteAlpha.200"
                    color="gray.200"
                    _hover={{ bg: "whiteAlpha.100" }}
                  >
                    Retour
                  </Button>
                </Dialog.CloseTrigger>

                <Button
                  bg="orange.500"
                  borderColor="orange.500"
                  color="white"
                  _hover={{ bg: "orange.400" }}
                  onClick={handleConfirm}
                  loading={Boolean(isConfirming)}
                  disabled={!onConfirm}
                >
                  Oui, annuler
                </Button>
              </Stack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

