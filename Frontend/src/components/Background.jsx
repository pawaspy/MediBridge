import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Background() {
  const starsRef = useRef()
  const errorRef = useRef(false)

  const stars = useMemo(() => {
    try {
      const geometry = new THREE.BufferGeometry()
      const vertices = []
      const colors = []
      const color = new THREE.Color()
      
      const numStars = 3000
      
      for (let i = 0; i < numStars; i++) {
        const x = (Math.random() - 0.5) * 100
        const y = (Math.random() - 0.5) * 100
        const z = (Math.random() - 0.5) * 100
        
        vertices.push(x, y, z)
        
        const r = 0.1 + Math.random() * 0.1
        const g = 0.5 + Math.random() * 0.3
        const b = 0.7 + Math.random() * 0.3
        
        color.setRGB(r, g, b)
        colors.push(color.r, color.g, color.b)
      }
      
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
      
      const material = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true, 
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
      })
      
      return { geometry, material }
    } catch (error) {
      console.error("Error creating stars:", error)
      errorRef.current = true
      return { 
        geometry: new THREE.BufferGeometry(),
        material: new THREE.PointsMaterial()
      }
    }
  }, [])

  useFrame((state, delta) => {
    if (starsRef.current && !errorRef.current) {
      try {
        starsRef.current.rotation.x += delta * 0.01
        starsRef.current.rotation.y += delta * 0.01
      } catch (error) {
        console.error("Error animating stars:", error)
        errorRef.current = true
      }
    }
  })

  return (
    <>
      <points ref={starsRef} geometry={stars.geometry} material={stars.material} />
      <ambientLight intensity={0.2} />
    </>
  )
} 