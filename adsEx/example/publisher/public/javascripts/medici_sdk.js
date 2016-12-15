$(document).ready(function() {
  var adspaces = $(".ad");
  console.log(adspaces);
  for (var i=0; i<adspaces.length; i++) {
    var adspace = adspaces[i];
    $.post("http://localhost:4444", function(data) {
      console.log(adspace);
      adspace.innerHTML = data.ad;
    });
  }
});
