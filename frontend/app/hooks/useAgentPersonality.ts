import { useState, useCallback } from 'react'

interface AgentPersonalityRequest {
  personality_description: string
}

interface AgentPersonalityResponse {
  personality_description: string
  message: string
}

interface AgentPersonalityState {
  personality_description: string
  isLoading: boolean
  error: string | null
}

interface UseAgentPersonalityReturn {
  state: AgentPersonalityState
  updatePersonality: (personalityDescription: string) => Promise<void>
  loadPersonality: () => Promise<void>
}

export const useAgentPersonality = (): UseAgentPersonalityReturn => {
  const [state, setState] = useState<AgentPersonalityState>({
    personality_description: '',
    isLoading: false,
    error: null,
  })

  const updatePersonality = useCallback(async (personalityDescription: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const requestPayload: AgentPersonalityRequest = {
        personality_description: personalityDescription,
      }

      const response = await fetch('http://localhost:8000/core/agent-personality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(requestPayload),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result: AgentPersonalityResponse = await response.json()

      setState(prev => ({
        ...prev,
        personality_description: result.personality_description,
        isLoading: false,
        error: null,
      }))

      console.log('[AgentPersonality] Updated successfully:', result.message)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('[AgentPersonality] Update failed:', errorMessage)

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
    }
  }, [])

  const loadPersonality = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch('http://localhost:8000/core/agent-personality', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      setState(prev => ({
        ...prev,
        personality_description: result.personality_description || '',
        isLoading: false,
        error: null,
      }))

      console.log('[AgentPersonality] Loaded successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('[AgentPersonality] Load failed:', errorMessage)

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
    }
  }, [])

  return {
    state,
    updatePersonality,
    loadPersonality,
  }
}