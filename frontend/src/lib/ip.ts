export async function getUserIP() {
  const res = await fetch("/api/ip");
  const data = await res.json();
  return data.ip;
}