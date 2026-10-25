import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const pages = [
  "hours-to-days-calculator.html",
  "interest-rate-calculator.html",
  "ellipse-area-calculator.html",
  "distance-between-points-calculator.html",
  "eps-calculator.html",
  "amps-to-watts-calculator.html",
  "days-to-weeks-calculator.html",
  "area-calculator.html",
  "down-payment-calculator.html",
  "kg-to-lb-calculator.html"
];
for (const path of pages) {
  const html = readFileSync(path, "utf8");
  const canonical = "https://azeemwaseem2020.github.io/" + path;
  assert.match(html, /<title[^>]*>[^<]+<\/title>/i, path + ": title");
  assert.equal((html.match(/<h1\b/gi) || []).length, 1, path + ": one H1");
  assert.equal((html.match(/<link[^>]+rel=["']canonical["']/gi) || []).length, 1, path + ": one canonical");
  assert.ok(html.includes(canonical), path + ": canonical URL");
  assert.match(html, /<meta[^>]+name=["']author["'][^>]+content=["']Abdul Qadir["']/i, path + ": author metadata");
  assert.match(html, /property=["']og:title["']/i, path + ": OG title");
  assert.match(html, /property=["']og:description["']/i, path + ": OG description");
  assert.match(html, /name=["']twitter:card["']/i, path + ": Twitter card");
  const blocks = [...html.matchAll(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
  assert.ok(blocks.length, path + ": JSON-LD");
  let app = false;
  for (const [, raw] of blocks) {
    const schema = JSON.parse(raw.trim());
    if (schema["@type"] === "WebApplication" || schema["@type"] === "SoftwareApplication") {
      app = true;
      assert.equal(schema.url, canonical, path + ": schema canonical");
      assert.equal(schema.author?.name, "Abdul Qadir", path + ": schema author");
      assert.equal(schema.dateModified, "2026-10-19", path + ": schema date");
    }
  }
  assert.ok(app, path + ": WebApplication schema");
  for (const [, script] of html.matchAll(/<script(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/gi)) {
    if (script.trim()) new vm.Script(script, { filename: path });
  }
}
const sitemap = readFileSync("sitemap.xml", "utf8");
for (const path of pages) {
  const expectedLastmod = ["eps-calculator.html", "interest-rate-calculator.html"].includes(path) ? "2026-10-25" : "2026-10-19";
  assert.ok(sitemap.includes("<loc>https://azeemwaseem2020.github.io/" + path + "</loc><lastmod>" + expectedLastmod + "</lastmod>"), path + ": sitemap lastmod");
}
const amps = readFileSync("amps-to-watts-calculator.html", "utf8");
assert.match(amps, /id=['"]pf['"]/i, "amps-to-watts: power factor input");
assert.match(amps, /real=apparent\*pf/, "amps-to-watts: power factor used");
const kg = readFileSync("kg-to-lb-calculator.html", "utf8");
assert.match(kg, /x<0/, "kg-to-lb: rejects negative mass");
const ellipse = readFileSync("ellipse-area-calculator.html", "utf8");
assert.match(ellipse, /a>0&&b>0/, "ellipse: positive semi-axis validation");
const salaryTax = readFileSync("pakistan-salary-tax-calculator.html", "utf8");
assert.match(salaryTax, /No independently qualified tax professional is identified as a reviewer/i, "salary tax: disclose lack of independent tax review");
assert.doesNotMatch(salaryTax, /<strong>Reviewer:<\/strong>\s*Mr\. Jack/i, "salary tax: do not attribute review to an unverified named reviewer");
assert.match(salaryTax, /<strong>Review type:<\/strong> Internal software and source-reference review/i, "salary tax: clearly label internal review");
assert.match(salaryTax, /"dateModified":"2026-10-25"/, "salary tax: schema modification date reflects review disclosure");
assert.match(salaryTax, /id="salary-net-gross-tools"/, "salary tax: net-to-gross feature is visibly documented");
const solar = readFileSync("solar-load-calculator.html", "utf8");
assert.match(solar, /daily\/\(S\*E\)/, "solar: PV size uses daily kWh divided by sun hours and efficiency");
assert.match(solar, /BL\/1000\*B\/\(D\*I\)/, "solar: battery capacity accounts for backup load, hours, DoD and inverter efficiency");
assert.match(solar, /motor-starting surge/i, "solar: disclose that motor-starting surge is excluded");
assert.match(solar, /seasonal electricity demand stress test/i, "solar: seasonal demand comparison is present");
assert.match(solar, /Approximate area per panel \(m²; 1 m² ≈ 10\.764 ft²\)/, "solar: explain metric input conversion for US users");
assert.match(solar, /pc\*R\*10\.7639\)\.toFixed\(1\).*ft²/, "solar: show roof-area estimate in square feet as well as square metres");
const solarPakistanGuide = readFileSync("blog-solar-calculator-pakistan.html", "utf8");
assert.ok(solarPakistanGuide.includes("<title>Solar Calculator Pakistan: Panels, Inverter &amp; Battery | Calcora</title>"), "solar guide: title clearly states the Pakistan sizing task");
assert.match(solarPakistanGuide, /name="description" content="Estimate solar panel count, inverter capacity and battery backup in Pakistan/i, "solar guide: description explains actual user inputs and outputs");
assert.ok(solarPakistanGuide.includes('property="og:title" content="Solar Calculator Pakistan: Panels, Inverter &amp; Battery | Calcora"'), "solar guide: Open Graph title matches page title");
assert.match(solarPakistanGuide, /name="twitter:description" content="Estimate solar panel count, inverter capacity and battery backup in Pakistan/i, "solar guide: Twitter description is aligned with search description");
assert.match(solarPakistanGuide, /"headline":"Solar Calculator Pakistan: Panels, Inverter & Battery"/, "solar guide: Article headline matches the visible topic");
assert.match(solarPakistanGuide, /"dateModified":"2026-10-25"/, "solar guide: Article schema reflects metadata review date");
const inverterGuide = readFileSync("blog-solar-inverter-size-calculator.html", "utf8");
assert.match(inverterGuide, /name="twitter:title"/, "inverter guide: Twitter title exists");
assert.match(inverterGuide, /name="twitter:description"/, "inverter guide: Twitter description exists");
const psxCapitalGains = readFileSync("psx-capital-gains-tax-calculator.html", "utf8");
assert.match(psxCapitalGains, /name="twitter:title"/, "PSX CGT: Twitter title exists");
assert.match(psxCapitalGains, /name="twitter:description"/, "PSX CGT: Twitter description exists");
assert.match(psxCapitalGains, /Estimate PSX capital gains tax in Pakistan/i, "PSX CGT: social metadata describes the actual calculator task");
const psxCapitalGainGuide = readFileSync("blog-psx-capital-gain-calculator.html", "utf8");
assert.ok(psxCapitalGainGuide.includes("<title>PSX Capital Gains Calculator Guide: Profit &amp; CGT | Calcora</title>"), "PSX guide: title matches user-facing calculation intent");
assert.doesNotMatch(psxCapitalGainGuide, /Search intent and related PSX tools|aria-label="PSX search intent"/i, "PSX guide: no internal SEO wording is exposed to readers");
assert.match(psxCapitalGainGuide, /"headline":"PSX Capital Gains Calculator Guide: Profit & CGT"/, "PSX guide: Article headline matches the page topic");
assert.match(psxCapitalGainGuide, /"dateModified":"2026-10-25"/, "PSX guide: Article schema reflects the latest substantive review");
const zakat = readFileSync("zakat-calculator.html", "utf8");
assert.match(zakat, /not an independent review by a qualified Islamic scholar/i, "zakat: distinguish software checks from religious review");
assert.match(zakat, /No religious or professional qualification is claimed/i, "zakat: qualifications and scope are transparent");
for (const page of ["blog-solar-calculator-pakistan.html", "blog-solar-inverter-size-calculator.html", "psx-capital-gains-tax-calculator.html", "blog-psx-capital-gain-calculator.html", "blog-bank-loan-calculator-pakistan.html", "pakistan-salary-tax-guide-urdu.html", "pakistan-salary-tax-guide-roman-urdu.html", "pakistan-filer-non-filer-tax-rates-2026-27.html", "pakistan-income-tax-return-deadline-2026.html", "contact.html", "faq.html", "pakistan-salary-tax-calculator.html"]) {
  assert.match(sitemap, new RegExp("<loc>https://azeemwaseem2020\\.github\\.io/" + page.replace(".", "\\.") + "</loc><lastmod>2026-10-25</lastmod>"), page + ": current sitemap lastmod");
}

assert.match(inverterGuide, /<title>Solar Inverter Sizing Guide: kW, kVA &amp; Surge \| Calcora<\/title>/, "inverter guide: concise page title");
assert.match(inverterGuide, /property=["']og:title["'] content=["']Solar Inverter Sizing Guide: kW, kVA &amp; Surge \| Calcora["']/i, "inverter guide: OG title matches page title");
assert.match(inverterGuide, /property=["']og:image["']/i, "inverter guide: OG image is available");
assert.match(inverterGuide, /name=["']twitter:description["']/i, "inverter guide: Twitter description is available");
assert.match(sitemap, /<loc>https:\/\/azeemwaseem2020\.github\.io\/blog-solar-inverter-size-calculator\.html<\/loc><lastmod>2026-10-25<\/lastmod>/, "inverter guide: sitemap reflects the latest metadata update");

const batteryGuide = readFileSync("blog-solar-battery-backup-calculator.html", "utf8");
assert.match(batteryGuide, /<title>Solar Battery Backup Calculator Pakistan \| kWh &amp; Ah \| Calcora<\/title>/, "battery guide: title identifies Pakistan scope");
assert.match(batteryGuide, /property=["']og:title["'] content=["']Solar Battery Backup Calculator Pakistan \| kWh &amp; Ah \| Calcora["']/i, "battery guide: OG title matches page title");
assert.match(batteryGuide, /name=["']twitter:title["'] content=["']Solar Battery Backup Calculator Pakistan \| kWh &amp; Ah \| Calcora["']/i, "battery guide: Twitter title matches page title");
assert.match(batteryGuide, /"headline":"Solar Battery Backup Calculator Pakistan: kWh, Ah & Backup Hours"/, "battery guide: Article schema headline reflects page topic");
assert.match(batteryGuide, /"name":"Solar Battery Backup Guide","item":"https:\/\/azeemwaseem2020\.github\.io\/blog-solar-battery-backup-calculator\.html"/, "battery guide: final breadcrumb has its canonical URL");
assert.match(sitemap, /<loc>https:\/\/azeemwaseem2020\.github\.io\/blog-solar-battery-backup-calculator\.html<\/loc><lastmod>2026-10-25<\/lastmod>/, "battery guide: sitemap reflects the latest metadata update");

console.log("Next-10 calculator quality regression checks: PASS (10 pages) + priority trust/solar/sitemap checks");
