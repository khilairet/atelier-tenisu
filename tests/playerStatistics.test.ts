import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { Player, PlayerProps } from "../src/domain/player/Player";
import { averageBmi, bestCountryByWinRatio, medianHeight } from "../src/domain/player/PlayerStatistics";

const makePlayer = (id: number, code: string, height: number, weight: number, last: (0 | 1)[]): Player =>
  Player.create({
    id,
    firstname: "John",
    lastname: "Doe",
    shortname: "J.DOE",
    sex: "M",
    country: { picture: "https://example.com/flag.png", code },
    picture: "https://example.com/player.png",
    data: { rank: id, points: 100, weight, height, age: 30, last },
  } satisfies PlayerProps);

describe("PlayerStatistics (domain)", () => {
  it("aggregates wins by country and breaks ties by number of matches played", () => {
    const players = [
      makePlayer(1, "FRA", 180, 80000, [1, 0]),
      makePlayer(2, "FRA", 180, 80000, [1, 1]),
      makePlayer(3, "ITA", 180, 80000, [1, 1, 0]),
      makePlayer(4, "GER", 180, 80000, []),
    ];
    // FRA: 3/4, ITA: 2/3, GER ignored (no match played)
    expect(bestCountryByWinRatio(players)).toEqual({ code: "FRA", wins: 3, matches: 4, ratio: 0.75 });

    const tie = [makePlayer(1, "FRA", 180, 80000, [1, 0]), makePlayer(2, "ITA", 180, 80000, [1, 1, 0, 0])];
    expect(bestCountryByWinRatio(tie)?.code).toBe("ITA");
  });

  it("computes the average BMI from weight in grams and height in cm", () => {
    const players = [makePlayer(1, "FRA", 200, 80000, []), makePlayer(2, "FRA", 100, 30000, [])];
    // 80 / 2² = 20 and 30 / 1² = 30
    expect(averageBmi(players)).toBe(25);
  });

  it("computes the median for an even and an odd number of players", () => {
    const heights = [190, 170, 180, 200];
    const players = heights.map((h, i) => makePlayer(i + 1, "FRA", h, 80000, []));
    expect(medianHeight(players)).toBe(185);
    expect(medianHeight(players.slice(0, 3))).toBe(180);
  });

  it("returns null when there are no players", () => {
    expect(bestCountryByWinRatio([])).toBeNull();
    expect(averageBmi([])).toBeNull();
    expect(medianHeight([])).toBeNull();
  });
});

describe("GET /players/stats", () => {
  it("returns the statistics of the seeded players", async () => {
    const res = await request(createApp()).get("/players/stats").expect(200);
    expect(res.body).toEqual({
      bestCountryByWinRatio: { code: "SRB", wins: 5, matches: 5, ratio: 1 },
      averageBmi: 23.36,
      medianHeight: 185,
    });
  });

  it("applies country and sex filters", async () => {
    const app = createApp();

    // Venus (74 kg, 185 cm) and Serena (72 kg, 175 cm)
    const women = await request(app).get("/players/stats?sex=f").expect(200);
    expect(women.body).toEqual({
      bestCountryByWinRatio: { code: "USA", wins: 5, matches: 10, ratio: 0.5 },
      averageBmi: 22.57,
      medianHeight: 180,
    });

    const swissMen = await request(app).get("/players/stats?country=SUI&sex=M").expect(200);
    expect(swissMen.body).toMatchObject({ bestCountryByWinRatio: { code: "SUI" }, medianHeight: 183 });

    await request(app)
      .get("/players/stats?country=FRA")
      .expect(200, { bestCountryByWinRatio: null, averageBmi: null, medianHeight: null });
    await request(app).get("/players/stats?sex=X").expect(400);
  });
});
