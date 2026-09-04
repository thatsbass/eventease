'use client'

import { Button, Clipboard, HStack, Text } from "@chakra-ui/react"
import { MdDone } from "react-icons/md"

type Props = {
    value: string
}

export function EventUrlClipboard({ value }: Props) {
    return (
        <Clipboard.Root value={value}>
            <Clipboard.Trigger asChild>
                <Button
                    size="xs"
                    variant="outline"
                    borderColor="whiteAlpha.200"
                    color="gray.200"
                    bg="whiteAlpha.100"
                    _hover={{ bg: "whiteAlpha.200" }}
                >
                    <Clipboard.Indicator copied={
                        <HStack>
                            <Text>Copie</Text>
                            <MdDone />
                        </HStack>
                    }>
                        Copier le lien
                    </Clipboard.Indicator>
                </Button>
            </Clipboard.Trigger>
        </Clipboard.Root>
    )
}