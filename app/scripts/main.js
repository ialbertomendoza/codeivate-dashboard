var urlJsonUsers = '/scripts/users.json';
var jsonUsers = [];
var template,source,pichon;
var pichonValue = 1000;
var activarPichon = true;

$.ajaxSetup({cache: false});

$(document).ready(function(){
  source   = $("#tarjeta-template").html();
  template = Handlebars.compile(source);

  peticionApi('get',urlJsonUsers,'',true)
    .done(function(data){
      console.log(data);
      data.users.forEach(function(item) {
        console.log(item);
        jsonUsers.push(item.codeivate);
        var html = template(item);
        $('#cont-tarjeta').append(html);
      });
      consultaCodeivate();
      var pullCode = setInterval(consultaCodeivate, 10000);
    });
});

function peticionApi(metodo,url,parametros,debug) {
  var opcionesAjax ={
    type: metodo,
    url: url,
    dataType: "json"
  };
  if((typeof parametros != 'undefined') || (parametros != false)){
    opcionesAjax.data = parametros;
  };
  if(typeof debug != 'undefined'){
    console.log("Peticion AJAX: "+metodo);
    console.log("Peticion url: "+url);
    console.log("Peticion parametros: "+parametros);
  }
  return $.ajax(opcionesAjax);
}

function consultaCodeivate(){
  jsonUsers.forEach(function(user){
    var urlCodeivate = 'http://codeivate.com/users/'+user+'.json?callback=?';
    peticionApi('get',urlCodeivate)
      .done(function(result){
        console.log(result);
        if(result.programming_now == true){
          $('#'+user).find('.status').removeClass('hide');
          $('#'+user).find('.progress-level').addClass('active');
          $('#'+user).find('.progress-focus').addClass('active');
          $('#'+user).find('.thumbnail').addClass('bgactive');
        }else{
          $('#'+user).find('.status').addClass('hide');
          $('#'+user).find('.progress-level').removeClass('active');
          $('#'+user).find('.progress-focus').removeClass('active');
          $('#'+user).find('.thumbnail').removeClass('bgactive');
        }
        if(result.current_language == false){
          $('#'+user).find('.current').addClass('hide');
        }else{
          $('#'+user).find('.current').removeClass('hide');
          $('#'+user).find('.current').html(result.current_language);
        }
        var nivel = separaValores(result.level);
        var focus = separaValores(result.focus_level);
        $('#'+user).find('.level span').html(nivel[0]);
        $('#'+user).find('.focus span').html(focus[0]);
        asignaBarraEstado(user,'.progress-level',nivel[1]);
        asignaBarraEstado(user,'.progress-focus',focus[1]);

        var lenguajes = lenguajesTop(result.languages);
        if(lenguajes.length>0){
          $('#'+user).find('.langA').removeClass('hide');
          var lenguajeA = separaValores(lenguajes[0].valor);
          $('#'+user).find('.langA h5').html(lenguajes[0].lenguaje);
          $('#'+user).find('.langA .lang-level span').html(lenguajeA[0]);
          asignaBarraEstado(user,'.progress-langA',lenguajeA[1]);
        }
        if(lenguajes.length>1){
          $('#'+user).find('.langB').removeClass('hide');
          var lenguajeB = separaValores(lenguajes[1].valor);
          $('#'+user).find('.langB h5').html(lenguajes[1].lenguaje);
          $('#'+user).find('.langB .lang-level span').html(lenguajeB[0]);
          asignaBarraEstado(user,'.progress-langB',lenguajeB[1]);
        }
        if(activarPichon == true){
          if(result.level<pichonValue){
            pichonValue=result.level;
            pichon = user;
          }
          $('.tarjeta').find('#pichon').remove();
          $('#'+pichon).find('.thumbnail').append('<div id="pichon"></div>');
        }
      });
  });
}
//Funcion para separar los niveles de los indices.
function separaValores(dato){
  var res = dato.split(".");
  return res;
}
//Funcion para asignar valores a las barras de status.
function asignaBarraEstado(usuario,div,valor){
  var lon = valor+'%';
  $('#'+usuario).find(div).attr('aria-valuenow',(valor*10)).animate({width: lon}, 50);
}
//Funcion para obtener todos los lenguajes e insertarlos en un array para su ordenamiento.
function lenguajesTop(dato){
  var arr = [];
  for (var item in dato) {
    if (dato.hasOwnProperty(item)) {
      var item = {"lenguaje":item,"valor":dato[item]['level']}
      arr.push(item);
    }
  }
  var arrResult = (ordenamiento(arr)).reverse();
  return arrResult;
}
//Funcion que realiza el ordenamiento tipo burbuja.
function ordenamiento(arr){
  var longitud = arr.length;
  for( var i = 1; i < longitud; i++ ){
    for( var izq = 0; izq < (longitud - i); izq++){
      var der = izq + 1;
      if( arr[izq].valor > arr[der].valor ){
        intercambioArr(arr, izq, der);
      }
    }
  }
  return arr;
}
//Function para intercambiar entre posiciones del array.
function intercambioArr(arr, indexOne, indexTwo){
  var tmpVal = arr[indexOne];
  arr[indexOne] = arr[indexTwo];
  arr[indexTwo] = tmpVal;
  return arr;
}
