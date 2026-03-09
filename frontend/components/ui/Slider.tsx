"use client";

interface SliderProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    label?: string;
    suffix?: string;
}

export default function Slider({ value, onChange, min = 0, max = 100, label, suffix }: SliderProps) {
    return (
        <div className="w-full">
            {label && (
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">{label}</label>
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {value}{suffix}
                    </span>
                </div>
            )}
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            />
            <div className="flex justify-between mt-1 text-xs text-slate-400 font-medium">
                <span>{min}{suffix}</span>
                <span>{max}{suffix}</span>
            </div>
        </div>
    );
}
