import assert from "node:assert/strict";

const density = (m, v) => {
  if (!Number.isFinite(m) || !Number.isFinite(v) || m <= 0 || v <= 0) throw new Error("invalid density inputs");
  return m / v;
};
const force = (m, a) => {
  if (!Number.isFinite(m) || !Number.isFinite(a) || m <= 0) throw new Error("invalid force inputs");
  return m * a;
};
const speed = (d, t) => {
  if (!Number.isFinite(d) || !Number.isFinite(t) || d < 0 || t <= 0) throw new Error("invalid speed inputs");
  return d / t;
};
const acceleration = (v, u, t) => {
  if (![v, u, t].every(Number.isFinite) || t <= 0) throw new Error("invalid acceleration inputs");
  return (v - u) / t;
};
const kineticEnergy = (m, v) => {
  if (!Number.isFinite(m) || !Number.isFinite(v) || m <= 0) throw new Error("invalid kinetic-energy inputs");
  return 0.5 * m * v * v;
};
const pressure = (f, a) => {
  if (!Number.isFinite(f) || !Number.isFinite(a) || f < 0 || a <= 0) throw new Error("invalid pressure inputs");
  return f / a;
};
const potentialEnergy = (m, g, h) => {
  if (![m, g, h].every(Number.isFinite) || m <= 0 || g <= 0) throw new Error("invalid potential-energy inputs");
  return m * g * h;
};
const work = (f, d, angleDeg) => {
  if (![f, d, angleDeg].every(Number.isFinite) || d < 0 || angleDeg < -360 || angleDeg > 360) throw new Error("invalid work inputs");
  return f * d * Math.cos(angleDeg * Math.PI / 180);
};
const power = (w, t) => {
  if (!Number.isFinite(w) || !Number.isFinite(t) || t <= 0) throw new Error("invalid power inputs");
  return w / t;
};
const momentum = (m, v) => {
  if (!Number.isFinite(m) || !Number.isFinite(v) || m <= 0) throw new Error("invalid momentum inputs");
  return m * v;
};
const ohmsLaw = (mode, v, i, r) => {
  if (mode === "v") { if (![i,r].every(Number.isFinite) || i < 0 || r < 0) throw new Error("invalid"); return i*r; }
  if (mode === "i") { if (![v,r].every(Number.isFinite) || v < 0 || r <= 0) throw new Error("invalid"); return v/r; }
  if (![v,i].every(Number.isFinite) || v < 0 || i <= 0) throw new Error("invalid");
  return v/i;
};
const photon = (f, wavelength) => {
  const h=6.62607015e-34, c=299792458;
  if (!(f > 0 || wavelength > 0)) throw new Error("invalid photon input");
  return f > 0 ? h*f : h*c/wavelength;
};
const waveSpeed = (f, wavelength) => {
  if (!Number.isFinite(f) || !Number.isFinite(wavelength) || f <= 0 || wavelength <= 0) throw new Error("invalid wave inputs");
  return f*wavelength;
};
const lens = (f, d, i) => {
  if (![f,d,i].every(Number.isFinite)) throw new Error("invalid lens input");
  if (f === 0 || d === 0 || i === 0) throw new Error("zero lens input");
  return 1/f - 1/d - 1/i;
};
const heat = (m, c, dt) => {
  if (![m,c,dt].every(Number.isFinite) || m <= 0 || c <= 0) throw new Error("invalid heat inputs");
  return m*c*dt;
};

assert.equal(density(10,2),5);
assert.equal(force(2,3),6);
assert.equal(speed(100,20),5);
assert.equal(acceleration(20,5,3),5);
assert.equal(kineticEnergy(2,3),9);
assert.equal(pressure(100,2),50);
assert.equal(potentialEnergy(2,9.81,10),196.2);
assert.ok(Math.abs(work(10,2,60)-10)<1e-12);
assert.equal(power(100,20),5);
assert.equal(momentum(2,3),6);
assert.equal(ohmsLaw("v",3,4,undefined),12);
assert.equal(ohmsLaw("i",12,undefined,4),3);
assert.equal(ohmsLaw("r",12,3,undefined),4);
assert.ok(Math.abs(photon(5e14,0)-3.313035075e-19)<1e-30);
assert.equal(waveSpeed(170,2),340);
assert.ok(Math.abs(lens(0.2,0.4,0.4))<1e-12);
assert.equal(heat(2,900,10),18000);

for (const bad of [
  () => density(0,2), () => force(0,3), () => speed(10,0),
  () => kineticEnergy(0,3), () => pressure(-1,2), () => ohmsLaw("i",12,0,0),
  () => photon(0,0), () => waveSpeed(0,2), () => heat(0,900,10)
]) assert.throws(bad);

console.log("Science calculator regression tests: PASS");
