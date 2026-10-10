// Join the recording once; AudioBufferSourceNode then repeats it on the audio
// clock, so a delayed/background JavaScript timer cannot leave a playback gap.
export function createRainLoop(context, recording, fadeSeconds = 3) {
  const channels = Array.from({ length: recording.numberOfChannels }, (_, channel) => recording.getChannelData(channel));
  const blockSize = Math.max(1, Math.round(recording.sampleRate * .05));
  const levels = [];
  let peak = 0;
  for (let offset = 0; offset < recording.length; offset += blockSize) {
    let energy = 0;
    let samples = 0;
    for (const channel of channels) {
      for (let i = offset; i < Math.min(offset + blockSize, recording.length); i += 8) {
        energy += channel[i] ** 2;
        samples += 1;
      }
    }
    const level = Math.sqrt(energy / samples);
    levels.push(level);
    peak = Math.max(peak, level);
  }
  if (peak < .00001) return recording;
  // Remove only the quiet edges, including the recording's existing fades.
  const threshold = peak * .2;
  const first = levels.findIndex(level => level >= threshold);
  let last = levels.length - 1;
  while (levels[last] < threshold) last -= 1;
  const start = first * blockSize;
  const end = Math.min(recording.length, (last + 1) * blockSize);
  const fade = Math.min(Math.round(Math.max(0, fadeSeconds) * recording.sampleRate), Math.floor((end - start) / 4));
  if (fade < 2) return recording;
  const middleLength = end - start - fade * 2;
  const loop = context.createBuffer(recording.numberOfChannels, middleLength + fade, recording.sampleRate);
  for (let channel = 0; channel < channels.length; channel += 1) {
    const input = channels[channel];
    const output = loop.getChannelData(channel);
    output.set(input.subarray(start + fade, end - fade));
    for (let i = 0; i < fade; i += 1) {
      const angle = i / (fade - 1) * Math.PI / 2;
      output[middleLength + i] = input[end - fade + i] * Math.cos(angle) + input[start + i] * Math.sin(angle);
    }
  }
  return loop;
}
