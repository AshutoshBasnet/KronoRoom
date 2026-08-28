"use client";

import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface FlipFadeTextProps {
    /**
     * Array of words or phrases to cycle through
     * @default ["LOADING", "COMPUTING", "SEARCHING", "RETRIEVING", "ASSEMBLING"]
     */
    words?: string[];
    /**
     * Interval between word changes in milliseconds
     * @default 2500
     */
    interval?: number;
    /**
     * Additional CSS classes for the container
     */
    className?: string;
    /**
     * Additional CSS classes for the text
     */
    textClassName?: string;
    /**
     * Animation duration for each letter in seconds
     * @default 0.6
     */
    letterDuration?: number;
    /**
     * Stagger delay between letters on enter in seconds
     * @default 0.05
     */
    staggerDelay?: number;
    /**
     * Stagger delay between letters on exit in seconds
     * @default 0.03
     */
    exitStaggerDelay?: number;
}

const defaultWords = ["LOADING", "COMPUTING", "SEARCHING", "RETRIEVING", "ASSEMBLING"];

// Memoized Letter component for performance
const Letter = memo(function Letter({
    char,
    letterDuration
}: {
    char: string;
    letterDuration: number;
}) {
    const displayChar = char === " " ? "\u00A0" : char;

    return (
        <motion.span
            style={{ transformStyle: "preserve-3d", display: "inline-block" }}
            variants={{
                initial: {
                    rotateX: 90,
                    y: 20,
                    opacity: 0,
                    filter: "blur(8px)",
                },
                animate: {
                    rotateX: 0,
                    y: 0,
                    opacity: 1,
                    filter: "blur(0px)",
                    transition: {
                        duration: letterDuration,
                        ease: [0.2, 0.65, 0.3, 0.9],
                    },
                },
                exit: {
                    rotateX: -90,
                    y: -20,
                    opacity: 0,
                    filter: "blur(8px)",
                    transition: {
                        duration: letterDuration * 0.67,
                        ease: "easeIn",
                    },
                },
            }}
            className="inline-block"
        >
            {displayChar}
        </motion.span>
    );
});

// Memoized Word component for performance
const Word = memo(function Word({
    text,
    staggerDelay,
    exitStaggerDelay,
    letterDuration,
    textClassName
}: {
    text: string;
    staggerDelay: number;
    exitStaggerDelay: number;
    letterDuration: number;
    textClassName?: string;
}) {
    const letters = useMemo(() => text.split(""), [text]);

    return (
        <motion.div
            className={cn(
                "flex flex-wrap justify-center items-center gap-[0.02em] font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-100",
                textClassName
            )}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={{
                initial: { opacity: 1 },
                animate: {
                    opacity: 1,
                    transition: {
                        staggerChildren: staggerDelay,
                    },
                },
                exit: {
                    opacity: 1,
                    transition: {
                        staggerChildren: exitStaggerDelay,
                    },
                },
            }}
        >
            {letters.map((char, i) => (
                <Letter
                    key={`${char}-${i}`}
                    char={char}
                    letterDuration={letterDuration}
                />
            ))}
        </motion.div>
    );
});

export function FlipFadeText({
    words = defaultWords,
    interval = 3000,
    className,
    textClassName,
    letterDuration = 0.5,
    staggerDelay = 0.04,
    exitStaggerDelay = 0.02,
}: FlipFadeTextProps) {
    const [index, setIndex] = useState(0);

    const updateIndex = useCallback(() => {
        setIndex((prev) => (prev + 1) % words.length);
    }, [words.length]);

    useEffect(() => {
        if (!words || words.length <= 1) return;
        const timer = setInterval(updateIndex, interval);
        return () => clearInterval(timer);
    }, [updateIndex, interval, words]);

    const currentWord = useMemo(() => words[index] || words[0] || "", [words, index]);

    return (
        <div className={cn("inline-flex items-center justify-center min-h-[1.4em]", className)}>
            <div className="relative flex items-center justify-center w-full" style={{ perspective: "1000px" }}>
                <AnimatePresence mode="wait">
                    <Word
                        key={currentWord}
                        text={currentWord}
                        staggerDelay={staggerDelay}
                        exitStaggerDelay={exitStaggerDelay}
                        letterDuration={letterDuration}
                        textClassName={textClassName}
                    />
                </AnimatePresence>
            </div>
        </div>
    );
}

export default FlipFadeText;
