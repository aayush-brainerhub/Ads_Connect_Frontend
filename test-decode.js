const payloadStr = JSON.stringify({
    name: "test",
    role: "Advertiser",
    exp: 9999999999,
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": "123",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": "test@test.com"
  });
const payloadBase64 = Buffer.from(payloadStr).toString('base64');
console.log('payloadBase64:', payloadBase64);
const fakeToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payloadBase64}.sig`;
const payload = fakeToken.split(".")[1];
const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
console.log('padded:', padded);
const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
console.log('json:', JSON.parse(new TextDecoder().decode(bytes)));
