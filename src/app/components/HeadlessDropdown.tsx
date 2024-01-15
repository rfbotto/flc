'use client'

import { Menu, Transition } from '@headlessui/react';

const HeadlessDropdown = () => (
    <Menu as="div">
        <Menu.Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Options</Menu.Button>
        <Menu.Items className="flex flex-col bg-white shadow-lg rounded p-1">
            <Menu.Item as="div" className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Item 1</Menu.Item>
            <Menu.Item as="div" className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Item 2</Menu.Item>
        </Menu.Items>
    </Menu>
)

export default HeadlessDropdown