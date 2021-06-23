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
email varchar(40) not null,
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