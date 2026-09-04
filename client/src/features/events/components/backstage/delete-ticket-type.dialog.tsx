"use client"

import { Button, Dialog, Portal, Stack, Text } from "@chakra-ui/react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticketName: string
  ticketSold?: number
  onConfirm?: () => Promise<unknown> | unknown
  isConfirming?: boolean
}

export function DeleteTicketTypeDialog({
  open,
  onOpenChange,
  ticketName,
  ticketSold = 0,
  onConfirm,
  isConfirming,
}: Props) {
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
                  Supprimer le billet ?
                </Dialog.Title>
                <Dialog.Description color="gray.500" fontSize="sm">
                  Cette action est irreversible.
                </Dialog.Description>
              </Stack>
            </Dialog.Header>

            <Dialog.Body pt={4}>
              <Stack gap={2}>
                <Text color="gray.400" fontSize="sm">
                  Billet:
                </Text>
                <Text color="gray.100" fontWeight="semibold">
                  {ticketName}
                </Text>
                {ticketSold > 0 ? (
                  <Text color="orange.300" fontSize="sm">
                    Ce billet a deja des ventes. La suppression risque d'echouer.
                  </Text>
                ) : null}
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
                    Annuler
                  </Button>
                </Dialog.CloseTrigger>

                <Button
                  bg="red.500"
                  borderColor="red.500"
                  color="white"
                  _hover={{ bg: "red.400" }}
                  onClick={handleConfirm}
                  loading={Boolean(isConfirming)}
                  disabled={!onConfirm}
                >
                  Supprimer
                </Button>
              </Stack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

