"use client"

import { Text } from "@chakra-ui/react"
import UseTimer from "./shared/timer"

export default function Timer() {
    const { time } = UseTimer()
    return (
        <Text fontWeight={"semibold"} display={{ base: "none", md: "block" }}>
            {`${time} Africa/Dakar`}
        </Text>
    )
} 
