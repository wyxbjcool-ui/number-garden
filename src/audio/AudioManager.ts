import { Audio } from 'expo-av';

const soundSources = {
  buttonTap: require('../../assets/audio/button_tap.mp3'),
  taskComplete: require('../../assets/audio/task_complete.mp3'),
  coinGain: require('../../assets/audio/coin_gain.mp3'),
  levelUp: require('../../assets/audio/level_up.mp3'),
  badgeUnlock: require('../../assets/audio/badge_unlock.mp3'),
} as const;

export type SoundName = keyof typeof soundSources;

const soundCooldowns: Partial<Record<SoundName, number>> = {
  buttonTap: 80,
  coinGain: 220,
  levelUp: 500,
  badgeUnlock: 500,
};

class AudioManager {
  private readonly sounds = new Map<SoundName, Audio.Sound>();
  private readonly loadingSounds = new Map<SoundName, Promise<Audio.Sound>>();
  private isConfigured = false;
  private muted = false;
  private readonly lastPlayedAt = new Map<SoundName, number>();

  private async configureAudio() {
    if (this.isConfigured) {
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      staysActiveInBackground: false,
    });

    this.isConfigured = true;
  }

  private async getSound(soundName: SoundName) {
    const cachedSound = this.sounds.get(soundName);

    if (cachedSound) {
      return cachedSound;
    }

    const loadingSound = this.loadingSounds.get(soundName);

    if (loadingSound) {
      return loadingSound;
    }

    const nextSound = (async () => {
      await this.configureAudio();

      const { sound } = await Audio.Sound.createAsync(soundSources[soundName], {
        shouldPlay: false,
        volume: 1,
      });

      this.sounds.set(soundName, sound);
      this.loadingSounds.delete(soundName);

      return sound;
    })();

    this.loadingSounds.set(soundName, nextSound);

    return nextSound;
  }

  async playSound(soundName: SoundName) {
    if (this.muted) {
      return;
    }

    const now = Date.now();
    const cooldownMs = soundCooldowns[soundName] ?? 0;
    const lastPlayedAt = this.lastPlayedAt.get(soundName) ?? 0;

    if (now - lastPlayedAt < cooldownMs) {
      return;
    }

    this.lastPlayedAt.set(soundName, now);

    try {
      const sound = await this.getSound(soundName);
      await sound.replayAsync();
    } catch (error) {
      console.warn(`Failed to play sound: ${soundName}`, error);
    }
  }

  setMuted(nextMuted: boolean) {
    this.muted = nextMuted;
  }

  isMuted() {
    return this.muted;
  }
}

export const audioManager = new AudioManager();

export const playSound = (soundName: SoundName) =>
  audioManager.playSound(soundName);

export const setMuted = (nextMuted: boolean) =>
  audioManager.setMuted(nextMuted);

export const isMuted = () => audioManager.isMuted();
