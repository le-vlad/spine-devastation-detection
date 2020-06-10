self.addEventListener('message', function(e) {
  const data = e.data;
  postMessage(JSON.stringify(data));
}, false);
