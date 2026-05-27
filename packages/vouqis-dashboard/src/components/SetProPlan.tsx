'use client'

import {useEffect} from 'react'

export function SetProPlan() {
  useEffect(() => {
    localStorage.setItem('vouqis_plan', 'pro')
  }, [])
  return null
}
