import { resolve4, resolve6 } from "node:dns/promises";
import { connect } from "node:tls";

const host = "nakahya.com";
const addresses = (await Promise.allSettled([resolve4(host), resolve6(host)]))
  .flatMap(result => result.status === "fulfilled" ? result.value : []);
if (!addresses.length) throw new Error("nakahya.com has no resolved A/AAAA record");
console.log(JSON.stringify({ hostname: host, addresses }));

await new Promise((resolve, reject) => {
  const socket = connect({ host, port: 443, servername: host, rejectUnauthorized: true }, () => {
    const certificate = socket.getPeerCertificate();
    console.log(JSON.stringify({ tlsAuthorized: socket.authorized, validTo: certificate.valid_to, subjectAltName: certificate.subjectaltname }));
    socket.end();
    resolve();
  });
  socket.setTimeout(10000, () => socket.destroy(new Error("TLS verification timeout")));
  socket.on("error", reject);
});

const homepage = await fetch("https://nakahya.com/", { redirect: "manual", signal: AbortSignal.timeout(15000) });
if (homepage.status !== 200) throw new Error(`Official HTTPS homepage returned ${homepage.status}`);
if (!(await homepage.text()).includes("NAKAHYA")) throw new Error("Official domain does not serve NAKAHYA");
console.log("Official HTTPS homepage: HTTP 200");

// A diagnostic, not a passing www redirect test: DNS provisioning is outside this repository.
const www = (await Promise.allSettled([resolve4("www.nakahya.com"), resolve6("www.nakahya.com")]))
  .flatMap(result => result.status === "fulfilled" ? result.value : []);
console.log(JSON.stringify({ wwwAddresses: www, wwwConfigured: www.length > 0 }));
if (!www.length) console.log("::warning::www.nakahya.com has no A/AAAA record. Add it as a Custom Domain to Worker nikahya; no DNS record has been changed by this check.");
