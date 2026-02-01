
import { GoogleGenAI, Type } from "@google/genai";
import { RiskLevel } from "./types";

const getAIInstance = () => {
  const apiKey = process.env.API_KEY?.trim();
  if (!apiKey || apiKey === 'undefined') {
    console.warn("Polaris OS: API_KEY is missing or invalid in environment.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

/**
 * Diagnostic tool to check if the API key is valid and responding.
 */
export const testApiKeyConnectivity = async () => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Diagnostic Ping. Reply with 'OK'.",
    });
    return { success: true, message: response.text || "Connection established." };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || "Unknown error",
      status: error.status || "FAILED"
    };
  }
};

export const analyzeRisk = async (scenario: string) => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are the Polaris OS Cognitive Engine. Analyze this scenario using the "Structural Aversion Playbook" framework.
    Focus on these specific axes:
    1. Chronic Degradation
    2. Irreversible Inflection
    3. Judgment Sovereignty
    Scenario: ${scenario}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          axes: {
            type: Type.OBJECT,
            properties: {
              chronicDegradation: { type: Type.NUMBER },
              irreversibleInflection: { type: Type.NUMBER },
              judgmentSovereignty: { type: Type.NUMBER }
            },
            required: ["chronicDegradation", "irreversibleInflection", "judgmentSovereignty"]
          },
          riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
          summary: { type: Type.STRING },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["axes", "riskLevel", "summary", "recommendations"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const analyzeGlobalResonance = async (event: string) => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `As the Polaris Global Intelligence Engine, analyze this global event: "${event}".
    Perform a 3rd-order ripple deduction focusing on Geopolitical Entropy and Sovereign Risk.
    Explain your reasoning path clearly.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ripples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                order: { type: Type.NUMBER },
                impact: { type: Type.STRING },
                probability: { type: Type.NUMBER }
              },
              required: ["order", "impact", "probability"]
            }
          },
          reasoningPath: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Step-by-step logic nodes" },
          protocolUpdates: { type: Type.ARRAY, items: { type: Type.STRING } },
          entropyScore: { type: Type.NUMBER }
        },
        required: ["ripples", "reasoningPath", "protocolUpdates", "entropyScore"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const calibrateProtocol = async (prediction: any, reality: string) => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `CALIBRATION SESSION:
    Original Prediction: ${JSON.stringify(prediction.ripples)}
    Actual Outcome: "${reality}"
    
    Tasks:
    1. Identify the logic gap.
    2. Extract the 'Cognitive Crystal' (a new rule for future scans).
    3. Show the thinking trace of this calibration.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          gapAnalysis: { type: Type.STRING },
          thinkingTrace: { type: Type.ARRAY, items: { type: Type.STRING } },
          calibrationDelta: { type: Type.NUMBER },
          cognitiveCrystal: { 
            type: Type.OBJECT, 
            properties: {
              rule: { type: Type.STRING },
              weightAdjustment: { type: Type.STRING }
            },
            required: ["rule", "weightAdjustment"]
          },
          biasWarning: { type: Type.STRING }
        },
        required: ["gapAnalysis", "thinkingTrace", "calibrationDelta", "cognitiveCrystal", "biasWarning"]
      }
    }
  });
  
  return {
    data: JSON.parse(response.text),
    grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks
  };
};

export const analyzePowerDynamics = async (actors: any[], relationships: any[]) => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze power dynamics: ${JSON.stringify({actors, relationships})}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          instabilityPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          leveragePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          strategicAdvice: { type: Type.STRING }
        },
        required: ["instabilityPoints", "leveragePoints", "strategicAdvice"]
      }
    }
  });
  return JSON.parse(response.text);
};
