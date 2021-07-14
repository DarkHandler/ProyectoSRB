#create database DIMAO_SRB;

create table sector(
sector_id int unsigned not null AUTO_INCREMENT,
nombre varchar(25) not null,
primary Key (sector_id)
);

create table subsector(
subsector_id int unsigned not null AUTO_INCREMENT,
nombre varchar(40) not null,
sector_id int unsigned not null,
primary key (subsector_id),
foreign key (sector_id) references sector (sector_id)
on update cascade
on delete cascade
);

create table usuario(
run varchar(12),
nombre varchar(50),
tipo_usuario enum("admin","vivienda") not null,
email varchar(40),
contrasena varchar(60) not null,
primary key (run)
);


create table vivienda(
rol int unsigned not null,
domicilio varchar(100),
num_habitantes int unsigned default 1,
telefono varchar(12),
fecha_incorporacion date not null,
estado enum("inscrito","en espera","desinscrito") default "en espera" not null,
subsector_id int unsigned not null,
run varchar(12),
primary key (rol),
foreign key (run) references usuario (run)
on update cascade
on delete cascade,
foreign key (subsector_id) references subsector (subsector_id)
on update cascade
on delete cascade
);


create table desinscripcion(
run varchar(12),
motivo text,
primary key(run),
foreign key (run) references usuario (run)
on update cascade
on delete cascade
);


create table corroboracion(
fecha_reciclaje date not null,
rol int unsigned not null,
foreign key (rol) references vivienda (rol)
on update cascade
on delete cascade
);

create table alerta(
fecha_alerta datetime not null default current_timestamp, -- quizas solo deberia ser un tipo date
rol int unsigned not null,
estado enum("pendiente","revisado") not null default "pendiente",
foreign key (rol) references vivienda (rol)
on update cascade
on delete cascade
);


create table solicitud_modificacion(
run varchar(12) not null,  
estado varchar(10),
rol int unsigned not null,
domicilio varchar(100) not null,
num_habitantes int unsigned,
subsector_id int unsigned not null,
primary key(run),
foreign key (run) references usuario (run)
on update cascade
on delete cascade
);


--Tabla de codigo
CREATE TABLE codigo( codigo varchar(5) not null UNIQUE );


--Vista PARA LA VIEW USUARIOS INSCRITOS
create view userinscrito as SELECT v.rol, u.contrasena, v.run, u.nombre, v.telefono, v.num_habitantes, v.domicilio, u.email,
COALESCE(s.num_alertas, 0) AS num_alertas FROM (SELECT nombre, contrasena, email, run FROM usuario) AS u INNER JOIN (SELECT rol, run
, telefono, num_habitantes, domicilio FROM vivienda WHERE estado = "inscrito") AS v ON u.run = v.run LEFT JOIN (SELECT x.run, count(*) AS num_alertas FROM (SELECT v.run, a.fecha_alerta FROM alerta AS a INNER JOIN vivienda AS v ON a.rol=v.rol WHERE MONTH(a.fecha_alerta)=MONTH(CURDATE())) as x group by x.run) AS s ON v.run=s.run;

--Vista numero de reciclajes
CREATE VIEW num_reciclaje_vivienda AS SELECT rol,COUNT(fecha_reciclaje) AS 'recicló' FROM corroboracion GROUP BY rol;

--Vista para la seleccion de numero de reciclaje en esta
CREATE VIEW userinscrito_reciclo AS SELECT userinscrito.rol, contrasena,run,nombre,telefono,num_habitantes,domicilio,email,num_alertas,recicló FROM userinscrito INNER JOIN num_reciclaje_vivienda on num_reciclaje_vivienda.rol = userinscrito.rol;

--Vista alertas
CREATE VIEW vistaAlertas AS SELECT * FROM alerta;

--INSERCION DE USUARIO ADMINISTRADOR A LA BASE DE DATOS
INSERT INTO usuario(run, nombre, tipo_usuario, contrasena) VALUES ('0','Administrador','admin','A2G3TL0NK2E')