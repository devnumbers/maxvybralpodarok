'use client'

import {useEffect, useRef, useState} from 'react'
import {Canvas, useFrame, useThree} from '@react-three/fiber'
import {useGLTF} from '@react-three/drei'
import {Euler, Object3D, Vector3} from 'three'
import type {GLTF} from 'three-stdlib'
import './App.css'

useGLTF.preload('/model.glb')

type KeyProps = {
    scale?: number | Vector3
    position?: [number, number, number] | Vector3
    rotation?: [number, number, number] | Euler
}

function Key({scale = 1, position = [0, 0, 0], rotation = [0, 0, 0]}: KeyProps) {
    const {scene} = useGLTF('/model.glb') as GLTF
    const keyRef = useRef<Object3D>(null)
    const {gl} = useThree()

    const isDragging = useRef(false)
    const previousPosition = useRef({x: 0, y: 0})

    useFrame((_, delta) => {
        if (!isDragging.current && keyRef.current) {
            keyRef.current.rotation.y += delta * 0.2
        }
    })

    useEffect(() => {
        const canvas = gl.domElement

        const handleMove = (clientX: number, clientY: number) => {
            if (!isDragging.current || !keyRef.current) return

            const deltaX = clientX - previousPosition.current.x
            keyRef.current.rotation.y += deltaX * 0.01

            previousPosition.current = {x: clientX, y: clientY}
        }

        const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY)
        const onMouseDown = (e: MouseEvent) => {
            isDragging.current = true
            previousPosition.current = {x: e.clientX, y: e.clientY}
        }
        const handleEnd = () => {
            isDragging.current = false
        }

        const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 1) {
                e.preventDefault()
                isDragging.current = true
                previousPosition.current = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY
                }
            }
        }
        const onTouchMove = (e: TouchEvent) => {
            if (isDragging.current && e.touches.length === 1) {
                e.preventDefault()
                handleMove(e.touches[0].clientX, e.touches[0].clientY)
            }
        }
        const onTouchEnd = () => {
            isDragging.current = false
        }

        canvas.addEventListener('mousedown', onMouseDown)
        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', handleEnd)

        canvas.addEventListener('touchstart', onTouchStart, {passive: false})
        window.addEventListener('touchmove', onTouchMove, {passive: false})
        window.addEventListener('touchend', onTouchEnd)

        return () => {
            canvas.removeEventListener('mousedown', onMouseDown)
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', handleEnd)

            canvas.removeEventListener('touchstart', onTouchStart)
            window.removeEventListener('touchmove', onTouchMove)
            window.removeEventListener('touchend', onTouchEnd)
        }
    }, [gl])

    return (
        <primitive
            ref={keyRef}
            object={scene}
            scale={scale}
            position={position}
            rotation={rotation}
        />
    )
}

export const App = () => {
    const [scale, setScale] = useState<number | null>(null)

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth
            let newScale = 0.4

            if (width >= 1200) {
                newScale = 0.8
            } else if (width >= 960) {
                newScale = 0.6
            } else if (width >= 768) {
                newScale = 0.5
            } else if (width >= 480) {
                newScale = 0.5
            }

            setScale(newScale)
        }

        const timer = setTimeout(() => {
            handleResize()
        }, 10)

        window.addEventListener('resize', handleResize)

        return () => {
            clearTimeout(timer)
            window.removeEventListener('resize', handleResize)
        }
    }, [])


    return (
        <div className="container">
            <div className='canvas'>
                <div className="gift">
                    Подарок
                </div>
                <div className="text">
                    Максим Клюшников выбрал в подарок пиздатое черное оверсайз худи
                </div>
            </div>
            {scale !== null && (
                <Canvas>
                    <directionalLight
                        position={[5, 5, 5]}
                        intensity={7}
                        shadow-mapSize={[2048, 2048]}
                        color="#ffffff"
                    />
                    <directionalLight
                        position={[-5, -5, -5]}
                        intensity={3}
                        shadow-mapSize={[2048, 2048]}
                        color="#ffffff"
                    />
                    <Key
                        scale={scale}
                        position={[0, -0.5, 0]}
                        rotation={[0, 0, 0]}
                    />
                </Canvas>
            )}
        </div>
    )
}