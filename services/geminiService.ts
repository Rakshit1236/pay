import { GoogleGenAI, Type } from "@google/genai";
import { Payee } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// This function simulates a "Bank Backend" lookup using AI to halllucinate realistic details 
// based on a scanned UPI ID or QR string.
export const resolvePayeeFromId = async (scannedId: string): Promise<Payee> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      Analyze this scanned payment data: "${scannedId}".
      It might be a simple UPI ID (e.g. name@bank) or a full URI (e.g. upi://pay?pa=...&pn=...).
      If it is a URI, extract the 'pa' (address) and 'pn' (name) params.
      
      Generate a realistic Indian payee profile for this ID.
      If the ID looks like a merchant (e.g. contains shop, store, ent, pvt, ltd, merchant codes), make it a business.
      If it looks like a person, make it a personal name.
      Provide a popular Indian bank name associated with it.
      Return JSON only.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            normalizedId: { type: Type.STRING, description: "The clean UPI ID (e.g. user@bank) extracted from the scan" },
            name: { type: Type.STRING, description: "Full Name of the person or Business Name" },
            bankName: { type: Type.STRING, description: "Bank Name (e.g. HDFC, SBI, ICICI)" },
            isVerified: { type: Type.BOOLEAN, description: "True if it looks like a verified merchant" },
            category: { type: Type.STRING, description: "Category like 'Grocery', 'Electronics', 'Personal', etc." }
          },
          required: ["name", "bankName", "isVerified", "category"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    
    return {
      upiId: data.normalizedId || scannedId,
      name: data.name || "Unknown Payee",
      bankName: data.bankName || "Unknown Bank",
      isVerified: data.isVerified || false,
      category: data.category || "General"
    };

  } catch (error) {
    console.error("Gemini Resolution Error:", error);
    // Fallback for demo if API fails
    return {
      upiId: scannedId,
      name: "Verified Merchant",
      bankName: "State Bank of India",
      isVerified: true,
      category: "Shop"
    };
  }
};

export const generateTransactionInsight = async (transactions: any[]) => {
    // Helper to generate a summary of spending
    try {
        const model = "gemini-2.5-flash";
        const prompt = `Summarize these transactions in 1 short sentence: ${JSON.stringify(transactions.slice(0, 5))}`;
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        return response.text;
    } catch (e) {
        return "Spending looks normal this week.";
    }
}