'use client'

import { Button, HStack, Icon, Text } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { MdArrowBack } from "react-icons/md"

type Props = {
    content?: string
}

const BackToPage = ({ content = "Retour"}: Props) => {
    const router = useRouter()
    const handleToBack = () => router.back();
    return (
        <Button
            bg="whiteAlpha.200" 
            size="sm"
            variant="ghost"
            color="gray.300"
            borderRadius="full"
            _hover={{ bg: "whiteAlpha.300" }}
            onClick={handleToBack}
        >
            <HStack gap={2}>
                <Icon as={MdArrowBack} />
                <Text>{content}</Text>
            </HStack>
        </Button>
    )
}

export default BackToPage;