'use client'

import { Button, Menu, MenuItem, MenuTrigger, Popover } from 'react-aria-components'

const ReactAriaDropdown = () => {
  return (
    <MenuTrigger>
        <Button aria-label="Menu"className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Options</Button>
        <Popover>
            <Menu>
                <MenuItem id="item-1" className="flex flex-col bg-white shadow-lg rounded px-4 py-2">Item 1</MenuItem>
                <MenuItem id="item-2" className="flex flex-col bg-white shadow-lg rounded px-4 py-2">Item 2</MenuItem>
            </Menu>
        </Popover>
  </MenuTrigger>
  )
}

export default ReactAriaDropdown