import { beforeAll, describe, expect, it } from "vitest";
import { createUser, json, type TestUser } from "@repo/testing";
import app from "../src/app.js";

let alice: TestUser;
let bob: TestUser;

beforeAll(async () => {
  [alice, bob] = await Promise.all([createUser(), createUser()]);
});

const profile = {
  profileName: "Wedding",
  unit: "cm",
  height: 182,
  chest: 101,
  waist: 86,
  hips: 99,
  inseam: 83,
  shoulder: 47,
};

describe("measurement profiles", () => {
  it("require sign-in", async () => {
    expect((await app.request("/measurements/profiles")).status).toBe(401);
    expect(
      (await app.request("/measurements/profiles", json(profile))).status,
    ).toBe(401);
  });

  it("a customer can save, list and update their profile", async () => {
    const created = await app.request(
      "/measurements/profiles",
      json(profile, alice.headers),
    );
    expect(created.status).toBe(201);
    const { profile: saved } = (await created.json()) as any;
    expect(saved).toMatchObject({ profileName: "Wedding", chest: "101.00" });

    const updated = await app.request(
      `/measurements/profiles/${saved.id}`,
      json({ chest: 104 }, alice.headers, "PUT"),
    );
    expect(updated.status).toBe(200);

    const list = (await (
      await app.request("/measurements/profiles", { headers: alice.headers })
    ).json()) as any;
    expect(list.profiles).toHaveLength(1);
    expect(list.profiles[0].chest).toBe("104.00");
  });

  it("profiles are private to their owner", async () => {
    const created = await app.request(
      "/measurements/profiles",
      json(profile, alice.headers),
    );
    const { profile: saved } = (await created.json()) as any;

    const bobsList = (await (
      await app.request("/measurements/profiles", { headers: bob.headers })
    ).json()) as any;
    expect(bobsList.profiles).toEqual([]);
    const bobEdit = await app.request(
      `/measurements/profiles/${saved.id}`,
      json({ chest: 1 }, bob.headers, "PUT"),
    );
    expect(bobEdit.status).toBe(404);
    const bobDelete = await app.request(`/measurements/profiles/${saved.id}`, {
      method: "DELETE",
      headers: bob.headers,
    });
    expect(bobDelete.status).toBe(404);
  });

  it("only one profile is the default", async () => {
    const first = (await (
      await app.request(
        "/measurements/profiles",
        json({ ...profile, isDefault: true }, bob.headers),
      )
    ).json()) as any;
    await app.request(
      "/measurements/profiles",
      json({ ...profile, profileName: "Office", isDefault: true }, bob.headers),
    );
    const list = (await (
      await app.request("/measurements/profiles", { headers: bob.headers })
    ).json()) as any;
    const defaults = list.profiles.filter((p: any) => p.isDefault);
    expect(defaults).toHaveLength(1);
    expect(defaults[0].id).not.toBe(first.profile.id);
  });

  it("measurement definitions are public", async () => {
    expect((await app.request("/measurements/definitions")).status).toBe(200);
  });
});
