function divElementEnostavniTekst(sporocilo) {
  var jeSmesko = sporocilo.indexOf('http://sandbox.lavbic.net/teaching/OIS/gradivo/') > -1;
  if (jeSmesko) {
    sporocilo = sporocilo.replace(/\</g, '&lt;').replace(/\>/g, '&gt;').replace('&lt;img', '<img').replace('png\' /&gt;', 'png\' />');
    return $('<div style="font-weight: bold"></div>').html(sporocilo);
  } else {
    return $('<div style="font-weight: bold;"></div>').text(sporocilo);
  }
}

function divElementHtmlTekst(sporocilo) {
  return $('<div></div>').html('<i>' + sporocilo + '</i>');
}

function divElementSlikaTekst(sporocilo) {
  return $('<div></div>').html(sporocilo);
}

function procesirajVnosUporabnika(klepetApp, socket) {
  var sporocilo = $('#poslji-sporocilo').val();
  sporocilo = dodajSmeske(sporocilo);
  var sistemskoSporocilo;

  if (sporocilo.charAt(0) == '/') {
    sistemskoSporocilo = klepetApp.procesirajUkaz(sporocilo);
    if (sistemskoSporocilo) {
      $('#sporocila').append(divElementHtmlTekst(sistemskoSporocilo));
    }
  } else {
    sporocilo = filtirirajVulgarneBesede(sporocilo);
    klepetApp.posljiSporocilo(trenutniKanal, sporocilo);
    $('#sporocila').append(divElementEnostavniTekst(sporocilo));
    $('#sporocila').scrollTop($('#sporocila').prop('scrollHeight'));
  }
  
  var dobi = /(https?:\/\/\S+(\.png|\.jpg|\.gif))/g
  var novoSporocilo = sporocilo;

  var posnetek = /(https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?/g;
  var novoSporocilo2 = novoSporocilo;

  //console.log(novoSporocilo2.match(posnetek));

  

  if (novoSporocilo2.match(posnetek)) 
  {
    //console.log("zaznal youtube" + novoSporocilo2);

    //console.log("Slika1");

    var geturl1 = new RegExp(/(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?/g,"g");

    var stevilo = novoSporocilo2.match(geturl1).length;
    //console.log("Stevilo linkov: "+stevilo);

    var povezave = novoSporocilo2.match(geturl1);
    //console.log("Linki: " + povezave);

    var povezave1 = String(povezave);
   

    var res = povezave1.split(",");
    //console.log("Linki drugi: " + res);

    

    var string = "";

    for (var i = 0; i < res.length; i++) 
    {
        temp = String(res[i]);
        var temp2 = temp.split("watch?v=");
        var stringTemp = '<iframe src="https://www.youtube.com/embed/'+String(temp2[1])+'" style="margin-left: 20px; width: 200px; height:150px;" allowfullscreen></iframe>'
        
        string = string +" "+stringTemp;   
      
    }

    //console.log("Rezultat: " + string);

    var novoSporocilo2 = string; 

    klepetApp.posljiSporocilo(trenutniKanal, novoSporocilo2);
    $('#sporocila').append(divElementSlikaTekst(novoSporocilo2));
    $('#sporocila').scrollTop($('#sporocila').prop('scrollHeight'));

    console.log(novoSporocilo2);

    //console.log("YouTube!");

  }
  
  if (novoSporocilo.match(dobi)) 
  {
    var geturl = new RegExp(/(https?:\/\/\S+(\.png|\.jpg|\.gif))/g ,"g");

    var stevilo = novoSporocilo.match(geturl).length;
    //console.log("Stevilo linkov: "+stevilo);

    var povezave = novoSporocilo.match(geturl);
    //console.log("Linki: " + povezave);

    var povezave1 = String(povezave);
   

    var res = povezave1.split(",");
    //console.log("Linki drugi: " + res);

    var string = "";
    for (var i = 0; i < res.length; i++) 
    {
      if ((!(res[i].match("http://sandbox.lavbic.net/teaching/OIS/gradivo/wink.png")))&&
          (!(res[i].match("http://sandbox.lavbic.net/teaching/OIS/gradivo/smiley.png")))&&
          (!(res[i].match("http://sandbox.lavbic.net/teaching/OIS/gradivo/like.png")))&&
          (!(res[i].match("http://sandbox.lavbic.net/teaching/OIS/gradivo/kiss.png")))&&
          (!(res[i].match("http://sandbox.lavbic.net/teaching/OIS/gradivo/sad.png")))) 
      {
        string = string +" "+String(res[i]);
      }
      
    };

    //console.log("Rezultat: " + res);



    var exp = /(https?:\/\/\S+(\.png|\.jpg|\.gif))/g

    var novoSporocilo = string.replace(exp,'<img src="$1" style="margin-left: 20px; width: 200px;">'); 

    klepetApp.posljiSporocilo(trenutniKanal, novoSporocilo);
    $('#sporocila').append(divElementSlikaTekst(novoSporocilo));
    $('#sporocila').scrollTop($('#sporocila').prop('scrollHeight'));

    //console.log(novoSporocilo);

    //console.log("Slika!");
  };
  

  $('#poslji-sporocilo').val('');
}

var socket = io.connect();
var trenutniVzdevek = "", trenutniKanal = "";

var vulgarneBesede = [];
$.get('/swearWords.txt', function(podatki) {
  vulgarneBesede = podatki.split('\r\n');
});

function filtirirajVulgarneBesede(vhod) {
  for (var i in vulgarneBesede) {
    vhod = vhod.replace(new RegExp('\\b' + vulgarneBesede[i] + '\\b', 'gi'), function() {
      var zamenjava = "";
      for (var j=0; j < vulgarneBesede[i].length; j++)
        zamenjava = zamenjava + "*";
      return zamenjava;
    });
  }
  return vhod;
}

$(document).ready(function() {
  var klepetApp = new Klepet(socket);

  socket.on('vzdevekSpremembaOdgovor', function(rezultat) {
    var sporocilo;
    if (rezultat.uspesno) {
      trenutniVzdevek = rezultat.vzdevek;
      $('#kanal').text(trenutniVzdevek + " @ " + trenutniKanal);
      sporocilo = 'Prijavljen si kot ' + rezultat.vzdevek + '.';
    } else {
      sporocilo = rezultat.sporocilo;
    }
    $('#sporocila').append(divElementHtmlTekst(sporocilo));
  });

  socket.on('pridruzitevOdgovor', function(rezultat) {
    trenutniKanal = rezultat.kanal;
    $('#kanal').text(trenutniVzdevek + " @ " + trenutniKanal);
    $('#sporocila').append(divElementHtmlTekst('Sprememba kanala.'));
  });

  socket.on('sporocilo', function (sporocilo) {
    
    var snow = sporocilo.besedilo;


    if (snow.match("<img src=") || snow.match("<iframe src=")) 

    {
      var novElement = divElementSlikaTekst(sporocilo.besedilo);
    }
    else
    {
      var novElement = divElementEnostavniTekst(sporocilo.besedilo);
    } 
    
    $('#sporocila').append(novElement);
  });
  
  socket.on('kanali', function(kanali) {
    $('#seznam-kanalov').empty();
    
    //fdsadsafdsfsfsa

    for(var kanal in kanali) {
      kanal = kanal.substring(1, kanal.length);
      if (kanal != '') {
        $('#seznam-kanalov').append(divElementEnostavniTekst(kanal));
      }
    }

    $('#seznam-kanalov div').click(function() {
      klepetApp.procesirajUkaz('/pridruzitev ' + $(this).text());
      $('#poslji-sporocilo').focus();
    });
  });

  socket.on('uporabniki', function(uporabniki) {
    $('#seznam-uporabnikov').empty();
    for (var i=0; i < uporabniki.length; i++) {
      $('#seznam-uporabnikov').append(divElementEnostavniTekst(uporabniki[i]));
    }
    
    
    $('#seznam-uporabnikov div').click(function() {
      console.log("Izbira uporabnika za hitro sporocilo");

      
      var child = $(this).text();

      console.log(child);

      var vrstica = '/zasebno '+'"'+child+'"';   
      console.log(vrstica);

      $('#poslji-sporocilo').val(vrstica);
      $('#poslji-sporocilo').focus();

    });
    
  });

  setInterval(function() {
    socket.emit('kanali');
    socket.emit('uporabniki', {kanal: trenutniKanal});
  }, 1000);

  $('#poslji-sporocilo').focus();

  $('#poslji-obrazec').submit(function() {
    procesirajVnosUporabnika(klepetApp, socket);
    return false;
  });
  
  
});

function dodajSmeske(vhodnoBesedilo) {
  var preslikovalnaTabela = {
    ";)": "wink.png",
    ":)": "smiley.png",
    "(y)": "like.png",
    ":*": "kiss.png",
    ":(": "sad.png"
  }
  for (var smesko in preslikovalnaTabela) {
    vhodnoBesedilo = vhodnoBesedilo.replace(smesko,
      "<img src='http://sandbox.lavbic.net/teaching/OIS/gradivo/" +
      preslikovalnaTabela[smesko] + "' />");
  }
  return vhodnoBesedilo;
}
