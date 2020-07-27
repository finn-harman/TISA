export async function getData() {
  const url = "http://localhost:5000/api/regulator/"
  const response = await fetch(url, {
    method: "GET",
    headers:{'content-type': 'application/json'},
  });
  const body = await response.json();

  if (response.status !== 200) throw Error(body.message);

  return body;
};

export async function register(hash, address) {
  const url = "http://localhost:5000/api/regulator/addAccount" + hash
  const response = await fetch(url, {
    method: "POST",
    headers:{'content-type': 'application/json'},
    body: JSON.stringify({hash: hash, address: address})
  });
  const body = await response.json();

  if (response.status !== 200) throw Error(body.message);

  return body;
};
