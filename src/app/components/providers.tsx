'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
        <ChakraProvider>
            {children}
        </ChakraProvider>
    </AppRouterCacheProvider>
  ) 
}