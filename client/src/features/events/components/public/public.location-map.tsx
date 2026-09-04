import { Box, AspectRatio } from "@chakra-ui/react"

export function LocationMap({ address }: { address: string }) {
  const q = encodeURIComponent(address)
  const src = `https://www.google.com/maps?q=${q}&output=embed`

  return (
    <Box>
      <AspectRatio ratio={13 / 4} w="full" borderRadius="xl" overflow="hidden">
        <iframe
          title="Google Maps"
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ border: 0 }}
          allowFullScreen
        />
      </AspectRatio>
    </Box>
  )
}
