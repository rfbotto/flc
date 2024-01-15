import { Menu, MenuButton, MenuList, MenuItem, Button } from "@chakra-ui/react"

const ChakraDropdown = () => (
<Menu>
    <MenuButton as={Button} bg="blue.500" _hover={{ bg: "blue.700" }} color="white">
    Options
    </MenuButton>
    <MenuList>
    <MenuItem>Item 1</MenuItem>
    <MenuItem>Item 2</MenuItem>
    </MenuList>
</Menu>
)

export default ChakraDropdown