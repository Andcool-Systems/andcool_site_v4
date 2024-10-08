'use client';

import { useEffect, useRef, useState } from "react";
import { useMotionValue, animate } from 'framer-motion';
import { IconHome2, IconMinus, IconPlus } from "@tabler/icons-react";
import main_style from '@/app/styles/main.module.css';
import style from '@/app/styles/draggable.module.css';

export const main_cords = { x: 1175, y: 1190 };

interface DraggableDivProps {
    children: React.ReactNode;
    position: { x: number, y: number },
}

const DraggableDiv = ({ children, position }: DraggableDivProps) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const scale = useMotionValue(1);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [isCanDrag, setIsCanDrag] = useState<boolean>(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [scrollStart, setScrollStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [hitValue, setHitValue] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [speed, setSpeed] = useState<number>(0);

    const [scaleTarget, setScaleTarget] = useState<number>(1);
    const [scaleSpeed, setScaleSpeed] = useState<number>(0.3);

    useEffect(() => {
        if (!position) return;
        setHitValue(position);
        setSpeed(1);
        setScaleSpeed(1);
        setScaleTarget(1);
    }, [position])

    const handleMouseMove = (event: any) => {
        const canDrag = event.target instanceof HTMLElement && event.target.id === 'drag_controller';
        if (canDrag !== isCanDrag) {
            setIsCanDrag(canDrag);
        }
        if (!isDragging || !containerRef.current) return;
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
        const dx = (clientX - dragStart.x) * (1 / scale.get());
        const dy = (clientY - dragStart.y) * (1 / scale.get());
        setHitValue({ x: scrollStart.x + dx, y: scrollStart.y + dy });
    };

    const handleMouseDown = (event: any) => {
        setSpeed(0);
        if (event.target instanceof HTMLElement && event.target.id === 'drag_controller') {
            setIsDragging(true);
            const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
            const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
            setDragStart({ x: clientX, y: clientY });
            if (!containerRef.current) return;
            setScrollStart({ x: Number(containerRef.current?.style.left.replace('px', '')), y: Number(containerRef.current?.style.top.replace('px', '')) });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (!containerRef.current) return;
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

        const controls = animate(x, hitValue.x, {
            duration: speed,
            ease: "easeInOut",
            onUpdate: (latest) => {
                if (!containerRef.current) return;
                containerRef.current.style.left = latest.toString() + 'px';
                containerRef.current.style.transformOrigin = `${-latest + (vw / 2)}px ${-y.get() + (vh / 2)}px`;
            },
        });

        const controls_y = animate(y, hitValue.y, {
            duration: speed,
            ease: "easeInOut",
            onUpdate: (latest) => {
                if (!containerRef.current) return;
                containerRef.current.style.top = latest.toString() + 'px';
                containerRef.current.style.transformOrigin = `${-x.get() + (vw / 2)}px ${-latest + (vh / 2)}px`;
            },
        });

        const scale_target = animate(scale, scaleTarget, {
            duration: scaleSpeed,
            ease: "easeInOut",
            onUpdate: (latest) => {
                if (!containerRef.current) return;
                containerRef.current.style.transform = `scale(${latest})`;
            },
        });

        return controls.stop, controls_y.stop, scale_target.stop;
    }, [hitValue, scaleTarget]);


    return (
        <>
            <div
                className={style.drag_controller}
                id='drag_controller'
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}

                onWheel={(evt) => {
                    setScaleTarget(prev => Math.max(Math.min(prev + (evt.deltaY / -Math.abs(evt.deltaY) * 0.1), 1.5), 0.5));
                    setScaleSpeed(0);
                }}

                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
                style={{ cursor: isCanDrag ? isDragging ? 'grabbing' : 'grab' : 'auto', }}
            />
            <div
                ref={containerRef}
                style={{
                    overflow: 'visible',
                    position: 'fixed'
                }}
                className={main_style.draggable_div}
            >

                {children}
            </div>
            <div className={main_style.buttons_container}>
                <button
                    onClick={() => {
                        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
                        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
                        setHitValue({ x: -(main_cords.x - (vw / 2)), y: -(main_cords.y - (vh / 2)) });
                        setSpeed(1);
                        setScaleSpeed(1);
                        setScaleTarget(1);
                    }
                    }
                    className={main_style.home_btn}>
                    <IconHome2 width={24} height={24} color='white' />
                </button>
                <button
                    onClick={() => {
                        setScaleTarget(prev => Math.min(prev + 0.1, 1.5));
                        setScaleSpeed(0.3);
                    }
                    }
                    className={main_style.home_btn}>
                    <IconPlus width={24} height={24} color='white' />
                </button>
                <button
                    onClick={() => {
                        setScaleTarget(prev => Math.max(prev - 0.1, 0.5));
                        setScaleSpeed(0.3);
                    }
                    }
                    className={main_style.home_btn}>
                    <IconMinus width={24} height={24} color='white' />
                </button>
            </div>
        </>
    );
};

export default DraggableDiv;