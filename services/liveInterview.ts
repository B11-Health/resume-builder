import {
  GoogleGenAI,
  LiveServerMessage,
  MediaResolution,
  Modality,
  Session,
} from '@google/genai';

interface WavConversionOptions {
  numChannels: number;
  sampleRate: number;
  bitsPerSample: number;
}

interface LiveInterviewResult {
  reply?: string;
  audioBase64?: string;
  mimeType?: string;
}

const MODEL_ID = 'models/gemini-2.5-flash-native-audio-preview-12-2025';
const TURN_TIMEOUT_MS = 20_000;

const convertToWav = (rawData: string[], mimeType: string) => {
  if (!rawData.length) return undefined;

  const options = parseMimeType(mimeType);
  const dataLength = rawData.reduce((a, b) => a + Buffer.byteLength(b, 'base64'), 0);
  const wavHeader = createWavHeader(dataLength, options);
  const buffer = Buffer.concat(rawData.map((data) => Buffer.from(data, 'base64')));

  return Buffer.concat([wavHeader, buffer]);
};

const parseMimeType = (mimeType: string): WavConversionOptions => {
  const [fileType, ...params] = mimeType.split(';').map((s) => s.trim());
  const [, format] = fileType.split('/');

  const options: Partial<WavConversionOptions> = {
    numChannels: 1,
    bitsPerSample: 16,
    sampleRate: 24000,
  };

  if (format && format.startsWith('L')) {
    const bits = parseInt(format.slice(1), 10);
    if (!Number.isNaN(bits)) {
      options.bitsPerSample = bits;
    }
  }

  for (const param of params) {
    const [key, value] = param.split('=').map((s) => s.trim());
    if (key === 'rate') {
      const parsedRate = parseInt(value, 10);
      if (!Number.isNaN(parsedRate)) {
        options.sampleRate = parsedRate;
      }
    }
  }

  return options as WavConversionOptions;
};

const createWavHeader = (dataLength: number, options: WavConversionOptions) => {
  const { numChannels, sampleRate, bitsPerSample } = options;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const buffer = Buffer.alloc(44);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);

  return buffer;
};

const waitMessage = async (queue: LiveServerMessage[]): Promise<LiveServerMessage> => {
  while (true) {
    const message = queue.shift();
    if (message) {
      return message;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
};

const handleTurn = async (queue: LiveServerMessage[]) => {
  const turnMessages: LiveServerMessage[] = [];
  let done = false;

  while (!done) {
    const message = await waitMessage(queue);
    turnMessages.push(message);
    if (message.serverContent?.turnComplete) {
      done = true;
    }
  }

  return turnMessages;
};

const summarizeModelTurn = (
  messages: LiveServerMessage[],
  audioParts: string[],
  textParts: string[]
): { mimeType?: string } => {
  let inlineMimeType: string | undefined;

  for (const message of messages) {
    const parts = message.serverContent?.modelTurn?.parts;
    if (!parts?.length) continue;

    for (const part of parts) {
      if (part.inlineData) {
        audioParts.push(part.inlineData.data ?? '');
        inlineMimeType = part.inlineData.mimeType ?? inlineMimeType;
      }
      if (part.text) {
        textParts.push(part.text);
      }
      inlineMimeType = inlineMimeType || inferMimeType(part.fileData?.fileUri);
    }
  }

  return { mimeType: inlineMimeType };
};

const inferMimeType = (fileUri?: string) => {
  if (!fileUri) return undefined;
  if (fileUri.endsWith('.wav')) return 'audio/wav';
  if (fileUri.endsWith('.mp3')) return 'audio/mpeg';
  if (fileUri.endsWith('.aac')) return 'audio/aac';
  return undefined;
};

export const runLiveInterviewTurn = async (
  ai: GoogleGenAI,
  prompt: string
): Promise<LiveInterviewResult> => {
  const responseQueue: LiveServerMessage[] = [];
  const audioParts: string[] = [];
  const textParts: string[] = [];

  let session: Session | undefined;

  try {
    session = await ai.live.connect({
      model: MODEL_ID,
      callbacks: {
        onmessage: (message) => responseQueue.push(message),
        onopen: () => {
          // no-op placeholder for visibility
        },
        onerror: (e: ErrorEvent) => {
          console.error('Live interview error:', e.message);
        },
        onclose: (event: CloseEvent) => {
          if (event.reason) {
            console.warn('Live interview closed:', event.reason);
          }
        },
      },
      config: {
        responseModalities: [Modality.AUDIO, Modality.TEXT],
        mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Zephyr',
            },
          },
        },
        contextWindowCompression: {
          triggerTokens: '25600',
          slidingWindow: { targetTokens: '12800' },
        },
      },
    });

    session.sendClientContent({
      turns: [
        {
          role: 'user',
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      turnComplete: true,
    });

    const turnMessages = await Promise.race([
      handleTurn(responseQueue),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Live interview response timed out')), TURN_TIMEOUT_MS)
      ),
    ]);

    const { mimeType } = summarizeModelTurn(turnMessages, audioParts, textParts);

    const wavBuffer = mimeType ? convertToWav(audioParts, mimeType) : undefined;

    return {
      reply: textParts.join(' ').trim(),
      audioBase64: wavBuffer?.toString('base64'),
      mimeType: wavBuffer ? 'audio/wav' : undefined,
    };
  } finally {
    session?.close();
  }
};
