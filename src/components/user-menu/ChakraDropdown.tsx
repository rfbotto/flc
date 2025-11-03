'use client';

import { Menu, Portal, Button } from "@chakra-ui/react"

const ChakraDropdown = () => (
<Menu.Root>
    <Menu.Trigger asChild>
        <Button bg="blue.500" _hover={{ bg: "blue.700" }} color="white">
            Options
        </Button>
    </Menu.Trigger>
    <Portal>
        <Menu.Positioner>
            <Menu.Content>
                <Menu.Item value="item1">Item 1</Menu.Item>
                <Menu.Item value="item2">Item 2</Menu.Item>
            </Menu.Content>
        </Menu.Positioner>
    </Portal>
</Menu.Root>
)

export default ChakraDropdown