export type AlertV1 = {
  v: 1;
  id: string;              // unique id
  createdAt: number;       // epoch ms
  senderId: string;        // anonymous device id
  hop: number;             // how many relays
  ttl: number;             // max hops
  confidence: number;      // 0..1 (ML later)
  tier: "CONFIRMED";       // fixed for now
  approxLocation?: {
    lat: number;
    lon: number;
    accuracyM?: number;
  };
};
