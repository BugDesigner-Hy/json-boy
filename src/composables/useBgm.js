import { ref, watch, onMounted, onUnmounted } from 'vue'

const BGM_ENABLED_KEY = 'json-boy-bgm-enabled'
const BGM_SRC = '/audio/bgm.mp3'
const BGM_VOLUME = 0.35

function readEnabled() {
  try {
    const saved = localStorage.getItem(BGM_ENABLED_KEY)
    if (saved === 'false') return false
    return true
  } catch {
    return true
  }
}

export function useBgm() {
  const bgmEnabled = ref(readEnabled())
  let audio = null
  let unlockBound = false

  function ensureAudio() {
    if (audio) return audio
    audio = new Audio(BGM_SRC)
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = BGM_VOLUME
    return audio
  }

  async function playBgm() {
    const el = ensureAudio()
    try {
      await el.play()
      return true
    } catch {
      return false
    }
  }

  function pauseBgm() {
    if (audio) audio.pause()
  }

  function unlockAndPlay() {
    if (!bgmEnabled.value) return
    playBgm().then((ok) => {
      if (ok) unbindUnlock()
    })
  }

  function bindUnlock() {
    if (unlockBound) return
    unlockBound = true
    window.addEventListener('pointerdown', unlockAndPlay, { passive: true })
    window.addEventListener('keydown', unlockAndPlay)
  }

  function unbindUnlock() {
    if (!unlockBound) return
    unlockBound = false
    window.removeEventListener('pointerdown', unlockAndPlay)
    window.removeEventListener('keydown', unlockAndPlay)
  }

  async function applyBgmState(enabled) {
    try {
      localStorage.setItem(BGM_ENABLED_KEY, String(enabled))
    } catch {
      // ignore
    }
    if (enabled) {
      const ok = await playBgm()
      if (!ok) bindUnlock()
    } else {
      pauseBgm()
      unbindUnlock()
    }
  }

  function toggleBgm() {
    bgmEnabled.value = !bgmEnabled.value
  }

  watch(bgmEnabled, (enabled) => {
    applyBgmState(enabled)
  })

  onMounted(() => {
    applyBgmState(bgmEnabled.value)
  })

  onUnmounted(() => {
    pauseBgm()
    unbindUnlock()
    audio = null
  })

  return {
    bgmEnabled,
    toggleBgm,
  }
}
