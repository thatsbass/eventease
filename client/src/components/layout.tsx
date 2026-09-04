"use client"
import { Box, Grid, HStack, Icon, Text } from "@chakra-ui/react"
import { MdArrowOutward, MdMailOutline, MdFlightTakeoff } from "react-icons/md"
import { FaInstagram } from "react-icons/fa"
import { FaXTwitter } from "react-icons/fa6"
import Header from "./header"


export const userThemes = {
  bordeaux: "rgba(56, 3, 34, 0.99)",
  violetNight: "rgba(48, 5, 70, 0.99)",
  cherryRed: "rgba(80, 10, 30, 0.99)",
  indigo: "rgba(35, 10, 60, 0.99)",
  emeraldDark: "rgba(10, 60, 40, 0.99)",
  deepBlue: "rgba(10, 35, 80, 0.99)",
  sunsetOrange: "rgba(90, 30, 10, 0.99)",
  royalPurple: "rgba(70, 20, 90, 0.99)",
  midnight: "rgba(20, 20, 35, 0.99)",
  forestDark: "rgba(15, 50, 30, 0.99)"
};


export const OrganizerLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <Box
            minH="100vh"
            bg={`linear-gradient(to bottom, ${userThemes.midnight}, #131313 , #131313 20%)`}
            color="gray.100"
            display="flex"
            flexDirection="column"
        >
            <Header />
            <Box flex="1">{children}</Box>
            <Footer />
        </Box>
    )
}   

const Footer = () => {
    return (
        <Box borderTop="1px solid" borderColor="whiteAlpha.200" py={{ base: 4, md: 6 }} mt={6}>
            <Grid
                maxW="1200px"
                mx="auto"
                px={{ base: 4, md: 8 }}
                templateColumns={{ base: "1fr", md: "1fr auto 1fr" }}
                gap={{ base: 3, md: 4 }}
                alignItems="center"
            >
                <HStack gap={4} color="gray.400" fontSize="sm" justifySelf={{ md: "start" }}>
                    <Text>Decouvrir</Text>
                    <Text>Tarifs</Text>
                    <Text>Aide</Text>
                </HStack>

                <HStack
                    gap={2}
                    color="gray.400"
                    fontSize="sm"
                    justifySelf="center"
                >
                    <Text>Organisez votre evenement avec EventEase</Text>
                    <Icon as={MdArrowOutward} />
                </HStack>

                <HStack gap={3} color="gray.400" justifySelf={{ md: "end" }}>
                    <Icon as={MdMailOutline} />
                    <Icon as={MdFlightTakeoff} />
                    <Icon as={FaXTwitter} />
                    <Icon as={FaInstagram} />
                </HStack>
            </Grid>
        </Box>
    )
}
