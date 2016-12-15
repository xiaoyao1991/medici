$(document).ready(function() {
  var adspaces = $(".ad");
  for (var i=0; i<adspaces.length; i++) {
    var adspace = adspaces[i];
    $.post("http://localhost:4444", function(data) {
      adspace.innerHTML = data.ad;
    });
  }
});
