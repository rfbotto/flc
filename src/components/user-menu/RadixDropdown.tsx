'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

const RadixDropdown = () => {
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" aria-label="Customise options">Options</button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content className="flex flex-col bg-white shadow-lg rounded p-1" sideOffset={5}>
                    <DropdownMenu.Item className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        Item 1
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        Item 2
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    )
}

export default RadixDropdown
