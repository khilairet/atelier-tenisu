import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app";

const newPlayer = {
  firstname: "Roger",
  lastname: "Federer",
  shortname: "R.FED",
  sex: "M",
  country: { picture: "https://tenisu.latelier.co/resources/Suisse.png", code: "SUI" },
  picture: "https://tenisu.latelier.co/resources/Federer.png",
  data: { rank: 3, points: 2100, weight: 85000, height: 185, age: 37, last: [1, 1, 0, 1, 1] },
};

describe("API /players", () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp();
  });

  it("lists players from best to worst", async () => {
    const res = await request(app).get("/players").expect(200);
    expect(res.body.data.map((p: { data: { rank: number } }) => p.data.rank)).toEqual([1, 2, 10, 21, 52]);
    expect(res.body.data[0].lastname).toBe("Nadal");
  });

  it("filters the list by country and/or sex while keeping the ranking order", async () => {
    const lastnames = (res: request.Response) => res.body.data.map((p: { lastname: string }) => p.lastname);

    expect(lastnames(await request(app).get("/players?country=usa").expect(200))).toEqual(["Williams", "Williams"]);
    expect(lastnames(await request(app).get("/players?sex=M").expect(200))).toEqual(["Nadal", "Djokovic", "Wawrinka"]);

    const res = await request(app).get("/players?country=USA&sex=f").expect(200);
    expect(res.body.data.map((p: { firstname: string }) => p.firstname)).toEqual(["Serena", "Venus"]);

    const empty = await request(app).get("/players?country=FRA").expect(200);
    expect(empty.body).toEqual({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it("paginates the list", async () => {
    const lastnames = (res: request.Response) => res.body.data.map((p: { lastname: string }) => p.lastname);

    const first = await request(app).get("/players?page=1&limit=2").expect(200);
    expect(lastnames(first)).toEqual(["Nadal", "Djokovic"]);
    expect(first.body.pagination).toEqual({ page: 1, limit: 2, total: 5, totalPages: 3 });

    const last = await request(app).get("/players?page=3&limit=2").expect(200);
    expect(last.body.data).toHaveLength(1);

    const beyond = await request(app).get("/players?page=9&limit=2").expect(200);
    expect(beyond.body.data).toEqual([]);

    const filtered = await request(app).get("/players?sex=M&page=2&limit=2").expect(200);
    expect(lastnames(filtered)).toEqual(["Wawrinka"]);
    expect(filtered.body.pagination.total).toBe(3);
  });

  it("rejects invalid pagination", async () => {
    await request(app).get("/players?page=0").expect(400);
    await request(app).get("/players?limit=101").expect(400);
    await request(app).get("/players?limit=abc").expect(400);
  });

  it("rejects invalid filters", async () => {
    await request(app).get("/players?sex=X").expect(400);
    await request(app).get("/players?country=FRANCE").expect(400);
  });

  it("returns a player's details", async () => {
    const res = await request(app).get("/players/52").expect(200);
    expect(res.body.lastname).toBe("Djokovic");
  });

  it("returns 404 for an unknown player and 400 for an invalid id", async () => {
    await request(app).get("/players/999").expect(404);
    await request(app).get("/players/abc").expect(400);
  });

  it("creates a player", async () => {
    const res = await request(app).post("/players").send(newPlayer).expect(201);
    expect(res.body.id).toBe(103);
    expect(res.headers.location).toBe("/players/103");

    const list = await request(app).get("/players").expect(200);
    expect(list.body.data[2].lastname).toBe("Federer");
  });

  it("rejects an invalid player", async () => {
    const res = await request(app)
      .post("/players")
      .send({ ...newPlayer, sex: "X", data: { ...newPlayer.data, rank: 0 } })
      .expect(400);
    expect(res.body.details.fieldErrors).toHaveProperty("sex");
  });

  it("updates a player", async () => {
    const res = await request(app).put("/players/17").send({ ...newPlayer, firstname: "Rafa" }).expect(200);
    expect(res.body).toMatchObject({ id: 17, firstname: "Rafa" });
    await request(app).put("/players/999").send(newPlayer).expect(404);
  });

  it("deletes a player", async () => {
    await request(app).delete("/players/95").expect(204);
    await request(app).get("/players/95").expect(404);
    await request(app).delete("/players/95").expect(404);
  });
});
