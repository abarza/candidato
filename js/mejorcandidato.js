//Oferta laboral
var ofertaempleo = [{ofName: 'Desarrollador Front End', vacant: 2, Xsal: 850000, Xxp: 5}];
var oferta = ofertaempleo[0];

// Candidatos
var candidatos= [
    {id:1, name: 'Francisco Abarza',sal: 600000, mov: 1, xp: 2, preg: 5, post: 3, git: 1, db: 1, java: 1, py: 0, js: 1},
    {id:2, name: 'John Bonachon', sal: 500000, mov: 0, xp: 3, preg: 4, post: 2, git: 0, db: 0, java: 0, py: 1, js: 1},
    {id:3, name: 'Ricardo Canitrot', sal:450000, mov: 1, xp: 5, preg: 4, post: 1, git: 0, db: 1, java: 1, py: 1, js: 1},
    {id:4, name: 'Juan Perez', sal:560000, mov: 0, xp: 6,  preg: 8, post: 0, git: 1, db: 0, java: 0, py: 0, js: 1},
    {id:5, name: 'María Rojas', sal:515000, mov: 1,xp: 10,  preg: 2, post: 1, git: 1, db: 1, java: 1, py: 0, js: 0}
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
    Pimp = 0.5;
    Vpreg = (c.preg / mediana(pregrado) * Pimp);

    //Valoración años de postgrado
    Pgimp = 0.5;
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


    console.log(Vsal + Vmov + Vxp + Vpreg + Vpost + Vgit + Vdb + Vlang);


}
