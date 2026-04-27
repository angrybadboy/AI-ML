import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { getServerEnv } from "@/lib/env/server";
import {
  QUOTE_SYSTEM_PROMPT,
  buildQuoteUserPrompt,
  computeSeed,
} from "@/lib/prompts/quote";
import {
  GeneratedQuoteSchema,
  type GeneratedQuote,
} from "@/lib/schemas/quote";

/**
 * Anthropic Claude API 래퍼 — 서버 전용.
 * TRD §7.3 호출 예시 구조 그대로.
 *
 * 모델: claude-sonnet-4-6 (TRD §7.1 / CLAUDE.md §5)
 */

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 1024;

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (_client) return _client;
  const env = getServerEnv();
  _client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  return _client;
}

/**
 * 응답 텍스트에서 JSON 객체 한 개 추출.
 * Claude가 가끔 코드펜스를 붙여 보내면 벗겨내고, 첫 `{...}` 블록만 파싱.
 */
function extractJson(text: string): unknown {
  // 코드펜스 제거
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  // 첫 { 부터 마지막 } 까지
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    throw new Error("응답에서 JSON 객체를 찾지 못함.");
  }
  return JSON.parse(cleaned.slice(first, last + 1));
}

async function callClaudeOnce(date: Date): Promise<GeneratedQuote> {
  const seed = computeSeed(date);
  const userPrompt = buildQuoteUserPrompt(seed);

  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: QUOTE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  // content blocks 중 첫 text 블록
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("응답에 text 블록이 없음.");
  }

  const raw = extractJson(textBlock.text);
  return GeneratedQuoteSchema.parse(raw);
}

/**
 * 오늘의 글귀 생성. 실패 시 1회 재시도. 두 번 모두 실패하면 null.
 * 호출자(Route Handler)는 null이면 폴백 풀로 fallback 한다.
 */
export async function generateDailyQuote(
  date: Date = new Date()
): Promise<GeneratedQuote | null> {
  try {
    return await callClaudeOnce(date);
  } catch (firstErr) {
    console.warn("[anthropic] 첫 호출 실패, 1회 재시도:", firstErr);
    try {
      return await callClaudeOnce(date);
    } catch (secondErr) {
      console.error(
        "[anthropic] 재시도도 실패. 폴백 풀로 전환:",
        secondErr
      );
      return null;
    }
  }
}
