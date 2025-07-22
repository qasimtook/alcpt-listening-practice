import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
});

export async function generateAudioFromText(text: string): Promise<{ audioPath: string; cleanup: () => void }> {
  try {
    if (!openai.apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
      response_format: "mp3",
    });

    // Create temporary file
    const audioDir = path.join(process.cwd(), "temp_audio");
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    const filename = `${uuidv4()}.mp3`;
    const audioPath = path.join(audioDir, filename);

    // Convert response to buffer and save
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(audioPath, buffer);

    // Return path and cleanup function
    return {
      audioPath,
      cleanup: () => {
        try {
          if (fs.existsSync(audioPath)) {
            fs.unlinkSync(audioPath);
          }
        } catch (error) {
          console.error("Error cleaning up audio file:", error);
        }
      }
    };
  } catch (error) {
    console.error("Error generating audio:", error);
    throw new Error(`Failed to generate audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function cleanupOldAudioFiles(): Promise<void> {
  try {
    const audioDir = path.join(process.cwd(), "temp_audio");
    if (!fs.existsSync(audioDir)) return;

    const files = fs.readdirSync(audioDir);
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes

    for (const file of files) {
      const filePath = path.join(audioDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error("Error cleaning up old audio files:", error);
  }
}

// Auto-cleanup every 15 minutes
setInterval(cleanupOldAudioFiles, 15 * 60 * 1000);
