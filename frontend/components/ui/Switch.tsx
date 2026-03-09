"use client";

import { Switch as HeadlessSwitch } from "@headlessui/react";

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
}

export default function Switch({ checked, onChange, label, description }: SwitchProps) {
    return (
        <HeadlessSwitch.Group as="div" className="flex items-center justify-between">
            <div className="flex flex-col">
                {label && <HeadlessSwitch.Label className="text-sm font-medium text-slate-900 passive">{label}</HeadlessSwitch.Label>}
                {description && <HeadlessSwitch.Description className="text-sm text-slate-500">{description}</HeadlessSwitch.Description>}
            </div>
            <HeadlessSwitch
                checked={checked}
                onChange={onChange}
                className={`${checked ? "bg-blue-600" : "bg-slate-200"
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
                <span
                    className={`${checked ? "translate-x-6" : "translate-x-1"
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
            </HeadlessSwitch>
        </HeadlessSwitch.Group>
    );
}
