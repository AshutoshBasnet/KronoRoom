"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CreepyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    /**
     * Optional custom class for the button container
     */
    className?: string;
    /**
     * Optional custom class for the button cover (the visible part)
     */
    coverClassName?: string;
}

type Coords = {
    x: number;
    y: number;
};

export const CreepyButton: React.FC<CreepyButtonProps> = ({
    children,
    className,
    coverClassName,
    onClick,
    ...props
}) => {
    const eyesRef = useRef<HTMLSpanElement>(null);
    const [eyeCoords, setEyeCoords] = useState<Coords>({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const updateEyes = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
        const userEvent =
            "touches" in e ? (e as React.TouchEvent<HTMLButtonElement>).touches[0] : (e as React.MouseEvent<HTMLButtonElement>);

        if (!eyesRef.current) return;

        // get the center of the eyes container
        const eyesRect = eyesRef.current.getBoundingClientRect();
        const eyesCenter = {
            x: eyesRect.left + eyesRect.width / 2,
            y: eyesRect.top + eyesRect.height / 2,
        };

        // cursor position
        const cursor = {
            x: userEvent.clientX,
            y: userEvent.clientY,
        };

        // calculate the eye angle
        const dx = cursor.x - eyesCenter.x;
        const dy = cursor.y - eyesCenter.y;
        const angle = Math.atan2(-dy, dx) + Math.PI / 2;

        // pupil distance from the eye center
        const visionRangeX = 180; // Max distance to look horizontally
        const visionRangeY = 75; // Max distance to look vertically
        const distance = Math.hypot(dx, dy);

        // Limit the movement so pupils don't go too far
        const x = (Math.sin(angle) * Math.min(distance, visionRangeX)) / visionRangeX;
        const y = (Math.cos(angle) * Math.min(distance, visionRangeY)) / visionRangeY;

        setEyeCoords({ x, y });
    };

    // Reset eyes when mouse leaves
    const resetEyes = () => {
        setEyeCoords({ x: 0, y: 0 });
        setIsHovered(false);
    };

    const pupilStyle = {
        transform: `translate(calc(-50% + ${eyeCoords.x * 50}%), calc(-50% + ${eyeCoords.y * 50}%))`
    };

    return (
        <button
            className={cn(
                "relative min-w-[10em] rounded-full bg-[#001220] cursor-pointer outline-none select-none group inline-block",
                "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-400 border border-cyan-500/20",
                className
            )}
            onClick={onClick}
            onMouseMove={(e) => {
                updateEyes(e);
                setIsHovered(true);
            }}
            onTouchMove={updateEyes}
            onMouseLeave={resetEyes}
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
            {...props}
        >
            {/* Eyes Container */}
            <span
                ref={eyesRef}
                className="absolute flex items-center gap-[0.35em] right-[1.25em] bottom-[0.55em] h-[0.75em] z-0 pointer-events-none"
            >
                {/* Left Eye */}
                <motion.span
                    className="relative w-[0.8em] h-[0.8em] bg-white rounded-full overflow-hidden shadow-inner"
                    animate={{ height: ["0.8em", "0.8em", "0em", "0.8em"] }}
                    transition={{
                        duration: 3,
                        times: [0, 0.92, 0.96, 1],
                        repeat: Infinity,
                        ease: "linear",
                    }}
                >
                    <span
                        className="absolute top-1/2 left-1/2 w-[0.4em] h-[0.4em] bg-[#000814] rounded-full transition-transform duration-75 ease-out shadow-sm"
                        style={pupilStyle}
                    />
                </motion.span>
                {/* Right Eye */}
                <motion.span
                    className="relative w-[0.8em] h-[0.8em] bg-white rounded-full overflow-hidden shadow-inner"
                    animate={{ height: ["0.8em", "0.8em", "0em", "0.8em"] }}
                    transition={{
                        duration: 3,
                        times: [0, 0.92, 0.96, 1],
                        repeat: Infinity,
                        ease: "linear",
                    }}
                >
                    <span
                        className="absolute top-1/2 left-1/2 w-[0.4em] h-[0.4em] bg-[#000814] rounded-full transition-transform duration-75 ease-out shadow-sm"
                        style={pupilStyle}
                    />
                </motion.span>
            </span>

            {/* Button Cover */}
            <motion.span
                className={cn(
                    "absolute inset-0 block rounded-full bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white font-bold tracking-wide",
                    "shadow-[0_0_20px_rgba(0,180,216,0.35)]",
                    "flex items-center justify-center px-6 py-3.5 gap-2",
                    "origin-[1.5em_50%]",
                    coverClassName
                )}
                animate={{
                    rotate: isHovered ? -10 : 0,
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    mass: 0.8,
                }}
            >
                {children}
            </motion.span>

            {/* Invisible placeholder to maintain size since cover is absolute */}
            <span className="block opacity-0 px-6 py-3.5 font-bold tracking-wide min-w-[10em] flex items-center justify-center gap-2">
                {children}
            </span>
        </button>
    );
};

export default CreepyButton;
