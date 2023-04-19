if (localStorage.getItem("epidemic_simulator_source")) document.getElementById('source').value = localStorage.getItem("epidemic_simulator_source");
function download() {
  let blob = new Blob([get()], { type: "application/json" });
  let link = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = link;
  a.download = 'epidemic_simulator_source.json';
  a.click();
}
function play() {
  sessionStorage.setItem('epidemic_simulator_json', get());
  open('game.html?open=1');
}
function opengame(file) {
  let reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function() {
    document.getElementById('source').value = reader.result;
  };
}
function get() {
  return document.getElementById('source').value;
}
