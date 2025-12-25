"use client";

import { useRef, useState, useEffect } from 'react';

interface VirtualListProps<T> {
    items: T[];
    height: number;
    itemHeight: number;
    renderItem: (item: T, index: number) => React.ReactNode;
    className?: string;
}

export default function VirtualList<T>({ items, height, itemHeight, renderItem, className }: VirtualListProps<T>) {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const totalHeight = items.length * itemHeight;

    // Calculate visible range
    const startIndex = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(height / itemHeight);
    const endIndex = Math.min(items.length, startIndex + visibleCount + 2); // +2 buffer

    const visibleItems = items.slice(startIndex, endIndex).map((item, index) => ({
        item,
        index: startIndex + index,
        offset: (startIndex + index) * itemHeight,
    }));

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    };

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className={`overflow-auto relative ${className}`}
            style={{ height: height }}
        >
            <div style={{ height: totalHeight, position: 'relative' }}>
                {visibleItems.map(({ item, index, offset }) => (
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            top: offset,
                            left: 0,
                            width: '100%',
                            height: itemHeight,
                        }}
                    >
                        {renderItem(item, index)}
                    </div>
                ))}
            </div>
        </div>
    );
}
