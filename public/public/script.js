const form = document.getElementById('uploadForm');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('imageInput');

dropZone.onclick = () => fileInput.click();

fileInput.onchange = () => {
    document.getElementById('fileLabel').innerText = fileInput.files[0].name;
};

form.onsubmit = async (e) => {
    e.preventDefault();
    document.getElementById('loader').classList.remove('hidden');
    document.getElementById('result').classList.add('hidden');

    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    formData.append('retention', document.getElementById('retention').value);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();

    document.getElementById('loader').classList.add('hidden');
    if(data.success) {
        document.getElementById('result').classList.remove('hidden');
        document.getElementById('outputUrl').value = data.url;
        document.getElementById('openLink').href = data.url;
    }
};

function copyLink() {
    const copyText = document.getElementById("outputUrl");
    copyText.select();
    document.execCommand("copy");
    alert("URL Copied!");
}
