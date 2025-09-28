'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'

import Smiley1 from '../../assets/smiley1.svg'
import Smiley2 from '../../assets/smiley2.svg'
import Smiley3 from '../../assets/smiley3.svg'
import Smiley4 from '../../assets/smiley4.svg'

const smileys = [Smiley1, Smiley2, Smiley3, Smiley4]
const accessories = [
  'https://www.notion.so/_assets/fc556f4d021cf665.png',
  'https://www.notion.so/_assets/14d5b1e86af73b85.png',
  'https://www.notion.so/_assets/31299301d549e6d5.png',
  'https://www.notion.so/_assets/7afb74ab9eed1a81.png',
] as const

const AvatarButton = () => {
  const [currentSmileyIndex, setCurrentSmileyIndex] = useState(0)
  const [selectedAccessoryIndex, setSelectedAccessoryIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSmileyHover = useCallback(() => {
    setCurrentSmileyIndex((prev) => {
      let next = prev
      while (next === prev) {
        next = Math.floor(Math.random() * smileys.length)
      }
      return next
    })
  }, [])

  const handleAccessorySelect = useCallback((index: number) => {
    setSelectedAccessoryIndex(index)
  }, [])

  const openModal = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  useEffect(() => {
    if (!isModalOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [isModalOpen, closeModal])

  const modalContent =
    isModalOpen && typeof document !== 'undefined'
      ? createPortal(
          <motion.div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="relative flex w-full max-w-lg flex-col items-center gap-6 rounded-2xl bg-neutral-900/95 p-8 text-white shadow-2xl"
              initial={{ scale: 0.9, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 16, opacity: 0 }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="text-center mb-4">
                <p className="text-lg font-semibold">Your Companion</p>
                <p className="text-sm text-[#888888]">Pick your accessory vibe</p>
              </div>

              {/* Wardrobe-style avatar display */}
              <div className="flex flex-col items-center gap-6">
                {/* Esther avatar with layered accessories */}
                <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-white border-2 border-white/20">
                  {/* Base Esther avatar */}
                  <img
                    src={smileys[currentSmileyIndex]}
                    alt="Esther avatar"
                    className="absolute inset-0 h-full w-full object-contain z-10"
                  />

                  {/* Layered accessory - positioned to overlay like clothing */}

                  <img
                    src={accessories[selectedAccessoryIndex]}
                    alt="Selected accessory"
                    className="absolute inset-0 h-40 w-40 object-contain z-20 -top-8  pointer-events-none "
                    style={{
                      mixBlendMode: 'normal',
                      opacity: 1,
                    }}
                  />
                </div>

                {/* Accessory wardrobe grid */}
                <div className="flex flex-col gap-3">
                  <div>
                    <textarea
                      className="w-full border max-h-40 min-h-20 border-[#6d6d6d] p-2 rounded-xl  outline-none text-white placeholder-[#888888] leading-5"
                      placeholder="Enter your AI Description"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {accessories.map((accessory, index) => {
                      const isActive = selectedAccessoryIndex === index
                      return (
                        <button
                          key={accessory}
                          type="button"
                          onClick={() => handleAccessorySelect(index)}
                          className={`relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border transition ${
                            isActive
                              ? 'border-white/80 bg-white/15 scale-110'
                              : 'border-white/20 bg-white/5 hover:border-white/40 hover:scale-105'
                          }`}
                          aria-pressed={isActive}
                        >
                          <img src={accessory} alt="Wardrobe accessory option" className="h-14 w-14 object-contain" />
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="rounded-full bg-white/10 px-6 py-3 text-sm font-medium hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 transition-colors"
                onClick={closeModal}
              >
                Done
              </button>
            </motion.div>
          </motion.div>,
          document.body
        )
      : null

  return (
    <>
      <motion.button
        type="button"
        className="group inline-flex items-center rounded-full "
        onMouseEnter={handleSmileyHover}
        onFocus={handleSmileyHover}
        onClick={openModal}
        whileHover={{ rotate: -20, x: -12, y: -12, scale: 1.4 }}
        whileFocus={{ rotate: -20, x: -12, y: -12, scale: 1.4 }}
        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
      >
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white">
          {/* Base Esther avatar */}
          <img src={smileys[currentSmileyIndex]} alt="Esther avatar" className="h-10 w-10 object-contain z-10" />

          {/* Layered accessory - same as in modal */}
          <img
            src={accessories[selectedAccessoryIndex]}
            alt="Selected accessory"
            className="absolute inset-0 h-14 w-14 object-contain z-20 pointer-events-none -top-2"
            style={{
              mixBlendMode: 'normal',
              opacity: 1,
            }}
          />
        </span>
      </motion.button>
      {modalContent}
    </>
  )
}

export default AvatarButton
