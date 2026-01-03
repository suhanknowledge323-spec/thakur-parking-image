async function upload() {
  const file = document.getElementById("image").files[0];
  const expiry = document.getElementById("expiry").value;

  const form = new FormData();
  form.append("image", file);
  form.append("expiry", expiry);

  const res = await fetch("/upload", {
    method: "POST",
    body: form
  });

  const data = await res.json();
  document.getElementById("result").innerHTML =
    "Image URL: <br><a target='_blank' href='" + data.link + "'>" + location.origin + data.link + "</a>";
}
