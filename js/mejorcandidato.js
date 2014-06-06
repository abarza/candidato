//Oferta laboral
var ofertaempleo = [{ofName: 'Desarrollador Front End', vacant: 2, Xsal: 850000, Xxp: 5, Ctech: 0.3, Csoft: 0.3}];
var oferta = ofertaempleo[0];
var Csoft = oferta.Csoft;
var Ctech = oferta.Ctech;

// Candidatos
var candidatos= [
    {id:1, name: 'Francisco Abarza',sal: 600000, mov: 1, xp: 2, preg: 5, post: 3, git: 1, db: 1, java: 1, py: 0, js: 1, jqu: 1, css: 1, html: 1, pro: 0.7, team: 0.5, lead: 0.8, com: 1},
    {id:2, name: 'John Bonachon', sal: 500000, mov: 0, xp: 3, preg: 4, post: 2, git: 0, db: 0, java: 0, py: 1, js: 1, jqu: 0, css: 1, html: 0, pro: 0.6, team: 0.7, lead: 0.3, com: 0.7},
    {id:3, name: 'Ricardo Canitrot', sal:450000, mov: 1, xp: 5, preg: 4, post: 1, git: 0, db: 1, java: 1, py: 1, js: 1, jqu: 1, css: 0, html: 1, pro: 0.5, team: 0.8, lead: 0.9, com: 0.6},
    {id:4, name: 'Juan Perez', sal:560000, mov: 0, xp: 6,  preg: 8, post: 0, git: 1, db: 0, java: 0, py: 0, js: 1, jqu: 1, css: 1, html: 1, pro: 0.4, team: 0.9, lead: 0.4, com: 0.6},
    {id:5, name: 'María Rojas', sal:515000, mov: 1,xp: 10,  preg: 2, post: 1, git: 1, db: 1, java: 1, py: 0, js: 0, jqu: 1, css: 0, html: 1, pro: 0.6, team: 0.4, lead: 0.4, com: 0.9}
];

// Disponibilidad monetaria de la empresa por candidato (XVsal)
var Xsal = oferta.Xsal;
var vacant = oferta.vacant;
var XVsal = Xsal / vacant;

function mediana(values) {
    values.sort( function(a,b) {return a - b;} );
    var half = Math.floor(values.length/2);
    if(values.length % 2)
        return values[half];
    else
        return (values[half-1] + values[half]) / 2.0;
}

// Mediana de salarios candidatos
var salarios = [];
for (var i = 0; i < candidatos.length; i++) {
        salarios.push(candidatos[i].sal);
    }

// Mediana años de experiencia
var experiencia = [];
for (var i = 0; i < candidatos.length; i++) {
        experiencia.push(candidatos[i].xp);
    }

// Mediana años pregrado
var pregrado = [];
for (var i = 0; i < candidatos.length; i++) {
        pregrado.push(candidatos[i].preg);
    }

// Mediana años postgrado
var postgrado = [];
for (var i = 0; i < candidatos.length; i++) {
        postgrado.push(candidatos[i].post);
    }

// iterando por todos los candidatos...
for (var i = 0; i < candidatos.length; i++) {
    var c = candidatos[i];

    // Valoración del salario (Vsal)
    var Simp = 0.8; // valoracion del empleador (ejemplo 100%)
    var ajus = 200000; // ajuste para equilibrar la ecuación (aprox a la centena de millon inferior del sueldo minimo chile)
    if (Simp === 0){
        Vsal = (c.sal / XVsal) / ajus;
    } else {
        Vsal = (c.sal / XVsal * (mediana(salarios) * Simp)) / ajus;
    }

    // Valoración a trasladarse al puesto de trabajo
    var Mimp = 1; // 100% de valoración por parte del empleador
    Vmov = c.mov * Mimp;

    //Valoración años de experiencia
    Ximp = 0.7; // 70% de importancia
    Vxp = (c.xp / mediana(experiencia)) * Ximp;

    //Valoración años de pregrado
    Pimp = 0.5; // valoracion empleador a pregado 50%
    Vpreg = (c.preg / mediana(pregrado) * Pimp);

    //Valoración años de postgrado
    Pgimp = 0.2; // valoracion empleador a postgrado 50%
    Vpost = (c.post / mediana(postgrado) * Pgimp);

    //Valoración a los conocimientos técnicos
        // Valoracion repositorios
        Vgit = c.git;
        // Valoración DB
        Vdb = c.db;
        // Valoración Lenguajes de programación
        Vlang = c.py + c.java + c.js;
        // Valoración Front End
        Vfront = c.jqu + c.css + c.html;

    // Valoracion habilidades blandas
        // Valoraciones empleador a habilidades blandas
        Bimppro = 0.8;
        Bimpteam = 0.9;
        Bimplead = 0.4;
        Bimpcom = 0.7;
        // Valoración total habilidades blandas
        Vsoft = (Bimppro * c.pro + Bimpteam * c.team + Bimplead * c.lead + Bimpcom * c.com);


    // Evaluación de candidatos
    var value = Vsal;
    var weight = ((1 - (Ctech + Csoft)) * (Vmov + Vxp + Vpreg + Vpost)) + (Ctech * (Vgit + Vdb + Vlang + Vfront)) + (Csoft * (Vsoft));
    //console.log ("| valor: " + value + " | " + "weight: " + weight + " |");


    var values = [];
    values.push(c.name, value, weight);

    console.log(values);

    //console.log(weight);



    var out = '<div class="col-lg-4 col-xs-4 col-md-4" style="border-bottom:1px solid #cccccc"">' + values[0] + '</div>';
        out += '<div class="col-lg-4 col-xs-4 col-md-4" style="border-bottom:1px solid #cccccc"">' + values[1] + '</div>';
        out += '<div class="col-lg-3 col-xs-4 col-md-4" style="border-bottom:1px solid #cccccc"">' + values[2] + '</div>';


    document.write(out);

}


console.log([0][3]);