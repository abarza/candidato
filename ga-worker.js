//importo scripts:
//json2.js is an open source JSON parser, http://www.json.org/js.html
//json2.js se usa para convertir objetos a strings cuando pasan desde el worker
importScripts('json2.js');
//postMessage('{"act":"debug","data":"message"}');
function Item(name,weight,cost,bound){
	this.name = name;
	this.weight = weight;
	this.cost = cost;
	this.bound = bound;
}

/**
Worker para que no se bloquee la interfaz.
**/

var config;
var runTimeout = 0;
var stop_run = true;
var poblacion;
var run;
var gen;

//función que se llama todas las veces que el worker recibe un mensaje
//basado en el contenido del mensaje (event.data.act), realiza la accion apropiada.
onmessage = function(event) {
	var message = JSON.parse(event.data);
	switch(message.act){
		case 'pausa':
			stop_run = true;
			if(runTimeout) clearTimeout(runTimeout);
			break;
		case 'init':
			config = message.data;
			run = 0;
			runGA();
			break;
	}
}

function runGA(){

	gen = 0;
	//población inicial random
	poblacion = new Array();
	for(var i = 0;i<config.popSize;){
		var object = new Object();
		object.cromosoma = genera_cromosoma();
		object.fitness = 0;
		if(inserta_en_pobla(object,poblacion))
			i++;
	}
	stop_run = false;
	iterGA();
}

function iterGA(){
	//ordena población por el valor del fitnes
	if(config.fitness_order == "desc")
		poblacion.sort( function (a,b) { return b.fitness-a.fitness });
	else
		poblacion.sort( function (a,b) { return a.fitness-b.fitness });

	if(gen > 0){
		//reporta los mejores hasta ahora
		var message = new Object();
		message.act = "generation";
		message.data = {}
		message.data.pop = poblacion[poblacion.length-1];
		message.data.items = config.items;
		postMessage(JSON.stringify(message));
	}
	//termino de la etapa?
	if(stop_run || config.maxGenerations == gen){
		run++;
		var message = new Object();
		message.act = "respuesta";
		message.data = {}
		message.data.pop = poblacion[poblacion.length-1];
		message.data.items = config.items;
		postMessage(JSON.stringify(message));
		if(!stop_run && run < config.maxRuns){
			runTimeout = setTimeout(runGA, 150);
			return true;
		}

		return true;
	}

	for(var i = 0;i<poblacion.length;i++){
		poblacion[i].fitness = mide_fitness(poblacion[i].cromosoma);
	}


	var newpoblacion = new Array();
	for(var i = 0;i<poblacion.length;){
		var rnum = Math.ceil(Math.random() * 3);
		switch(rnum){
			case 1:
				//selecciona un individuo basado en la fitness
				var individual = poblacion[selecciona_de_poblacion()];
				//reproducción
				var newIndividuo = new Object();
				newIndividuo.cromosoma = individual.cromosoma.slice();
				newIndividuo.fitness = individual.fitness;
				//inserta copia
				if(inserta_en_pobla(newIndividuo,newpoblacion))
					i++;
				break;
			case 2:
				//selecciona dos individuos segun fitness
				var individual1 = poblacion[selecciona_de_poblacion()];
				var individual2 = poblacion[selecciona_de_poblacion()];
				//realiza cruce
				var hijo1 = new Object();
				var hijo2 = new Object();
				var xover = Math.floor(Math.random()*individual1.cromosoma.length);
				if(config.unique_cromosomas){
					var r = Math.random();
					if(r < 0.5){
						hijo1.cromosoma = cruce1(individual1.cromosoma,individual2.cromosoma);
						hijo2.cromosoma = cruce1(individual1.cromosoma,individual2.cromosoma);
					}else{
						hijo1.cromosoma = cruce2(individual1.cromosoma,individual2.cromosoma);
						hijo2.cromosoma = cruce2(individual1.cromosoma,individual2.cromosoma);
					}
				}else{
					hijo1.cromosoma = individual1.cromosoma.slice(0,xover).concat(individual2.cromosoma.slice(xover));
					hijo2.cromosoma = individual2.cromosoma.slice(0,xover).concat(individual1.cromosoma.slice(xover));
				}

				hijo1.fitness = mide_fitness(hijo1.cromosoma);
				hijo2.fitness = mide_fitness(hijo2.cromosoma);

				var candidatos = new Array();
				candidatos.push(individual1);
				candidatos.push(individual2);
				candidatos.push(hijo1);
				candidatos.push(hijo2);
				if(config.fitness_order == "desc")
					candidatos.sort( function (a,b) { return b.fitness-a.fitness });
				else
					candidatos.sort( function (a,b) { return a.fitness-b.fitness });
				//inserta descendientes en la poblacion
				if(inserta_en_pobla(candidatos[2],newpoblacion))
					i++;
				if(inserta_en_pobla(candidatos[3],newpoblacion))
					i++;
				break;
			case 3:
				//selecciona individuo segun fitness
				var individual = poblacion[selecciona_de_poblacion()];
				//realiza mutación
				var mutante = new Object();
				mutante.cromosoma = individual.cromosoma.slice();
				var r = Math.random();
				var x1 = Math.floor(Math.random()*mutante.cromosoma.length);
				var x2 = Math.floor(Math.random()*mutante.cromosoma.length);
				if(r < 0.5){
					//Mutacion 1 - intercambio recíproco
					var temp = mutante.cromosoma[x1];
					mutante.cromosoma[x1] = mutante.cromosoma[x2];
					mutante.cromosoma[x2] = temp;
				}else{
					//Mutacion - inserción
					var tempC = mutante.cromosoma.splice(x1,1);
					var tempA = mutante.cromosoma.splice(x2);
					mutante.cromosoma = mutante.cromosoma.concat(tempC.concat(tempA));
				}
				mutante.fitness = mide_fitness(mutante.cromosoma);
				//inserta mutacion en la población
				if(inserta_en_pobla(mutante,newpoblacion))
					i++;
				break;
			default:
		}

	}
	poblacion = newpoblacion;

	gen++;

	if(!stop_run){
		runTimeout = setTimeout(iterGA, 50);
	}
}

function cruce1(padre1, padre2){
	//ordena cruce
	var A = Math.floor(Math.random()*padre1.length);
	var B = Math.floor(Math.random()*padre1.length);
	while(A == B)
		B = Math.floor(Math.random()*padre1.length);
	if(A > B){
		var temp = B;
		B = A;
		A = temp;
	}
	var child = new Array(padre1.length);
	//copia A a B del padre 1
	for(var i = A;i<B;i++){
		child[i] = padre1[i];
	}
	//completa en el resto del hijo de los genes del padre 2
	var padre2_index = 0;
	for(var child_index = 0;child_index<padre1.length;child_index++){
		if(child[child_index] == undefined){
			for(;padre2_index<padre1.length;padre2_index++){
				//if(child.indexOf(padre2[padre2_index])<0){
					child[child_index] = padre2[padre2_index];
					break;
				//}
			}
		}
	}
	return child;
}

function cruce2(padre1, padre2){
	//cruce respecto a la posición
	var child = new Array(padre1.length);
	for(var i = 0;i<padre1.length;i++){
		var r = Math.random();
		if(r < 0.5)
			child[i] = padre1[i];
	}
	//completa el resto de genes del padre 2
	var padre2_index = 0;
	for(var child_index = 0;child_index<padre1.length;child_index++){
		if(child[child_index] == undefined){
			for(;padre2_index<padre1.length;padre2_index++){
				//if(child.indexOf(padre2[padre2_index])<0){
					child[child_index] = padre2[padre2_index];
					break;
				//}
			}
		}
	}
	return child;
}

function inserta_en_pobla(individual,newpoblacion){
	//restriccion para no insertar en la poblacion hijos que no cumplen el peso maximo
	var total_weight = 0;
	for(var i=0;i<individual.cromosoma.length;i++){
		total_weight += individual.cromosoma[i].weight;
	}
	if(total_weight > config.max_weight)
		return false;
	//regla para no inserta hijos en la población
	for(var i=0;i<config.items.length;i++){
		var countArray = individual.cromosoma.filter(get_items_filter,config.items[i]);
		if(countArray.length > config.items[i].bound){
			return false;
		}
	}
	newpoblacion.push(individual);
	return true;
}

function arrays_equal(array1,array2){
	if(array1.length != array2.length)
		return false;
	for(var i=0;i<array1.length;i++){
		if(array1[i] != array2[i])
			return false;
	}
	return true;
}

function selecciona_de_poblacion(){
	switch(config.selection){
		case "ranking":
			var r = Math.random()*((poblacion.length*(poblacion.length+1))/2);
			var sum = 0;
			for(var i = 0;i<poblacion.length;i++){
				for (sum += i; sum > r; r++) return i;
			}
			return poblacion.length-1;
			break;
		case "torneo":
			var opciones = new Array();
			for(var i = 0;i<5;i++){
				var rnum = Math.floor(Math.random() * poblacion.length);
				opciones[i] = poblacion[rnum];
				opciones[i].index = rnum;
			}
			if(config.fitness_order == "desc")
				opciones.sort( function (a,b) { return b.fitness-a.fitness });
			else
				opciones.sort( function (a,b) { return a.fitness-b.fitness });
			var r = Math.random();
			//p = 0.5
			if(r < 0.5){
				//devuelve el mas apto
				return opciones[opciones.length-1].index;
			}
			//sino devuelve opción random
			var rnum = Math.floor(Math.random() * opciones.length);
			return opciones[rnum].index;
			break;
		default:
			return 1;
	}
}

function mide_fitness(cromosoma){
	var fitness = 0;
	for(var i = 0;i<cromosoma.length;i++){
		fitness+=cromosoma[i].value;
	}
	return fitness;
}

function get_items_filter(item){
	return this === item;
}

//generacion de string random
function genera_cromosoma() {
	var randomcromosoma = [];
	var weight_hasta_ahora = 0;
	var disponible_items = config.items.slice();
	while(weight_hasta_ahora <= config.max_weight && disponible_items.length){
		var index = Math.floor(Math.random() * disponible_items.length);
		if((weight_hasta_ahora + disponible_items[index].weight) <= config.max_weight){
			randomcromosoma = randomcromosoma.concat(disponible_items[index]);
			weight_hasta_ahora += disponible_items[index].weight;
			var countArray = randomcromosoma.filter(get_items_filter,disponible_items[index]);

			if(countArray.length >= disponible_items[index].bound){
				disponible_items.splice(index,1);
			}

		}else{
			//si el item es muy grande pa la mochila
			disponible_items.splice(index,1);
		}
	}
	return randomcromosoma;
}