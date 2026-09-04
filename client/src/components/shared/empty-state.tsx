'use client'

import { Box, Text } from '@chakra-ui/react'

type EmptyStateProps = {
  title: string
  description?: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Box textAlign="center" py={10}>
      <Text fontWeight="semibold">{title}</Text>
      {description ? <Text color="text.muted">{description}</Text> : null}
    </Box>
  )
}
