export async function runDistressInference(
  audioUri: string
): Promise<number> {
  // TEMP: simulate ML
  await new Promise((r) => setTimeout(r, 500));
  return Math.random();
}
